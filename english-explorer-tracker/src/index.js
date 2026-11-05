const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

// Tables that may be read through GET /airtable?table=<name>.
// Kept server-side so untrusted clients cannot read arbitrary tables.
// Maps table name to the field it should be sorted by, or null to keep
// Airtable's default row order (a table that has no DisplayOrder field
// would otherwise make the sort query fail).
const ALLOWED_AIRTABLE_TABLES = {
	BTStudyHub: 'DisplayOrder',
	GridShift: null,
	GridShiftSystem: null,
	GridShiftVariants: null,
	HandWriting: null,
	LessonSlots: null,
};

const PUBLIC_LESSON_SLOT_FIELDS = [
	'Student',
	'StartsAt',
	'Status',
	'Lesson',
];

// Table data changes infrequently, while pages may request it on every visit.
// Cache successful reads for five minutes at each Cloudflare data center.
const AIRTABLE_CACHE_TTL_SECONDS = 300;

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...CORS_HEADERS,
		},
	});
}

async function handleTracking(request, env) {
	try {
		const body = await request.json();

		const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/SiteVisitorLogs`;

		const response = await fetch(airtableUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.AIRTABLE_PAT}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();
		return json(withAirtableDiagnostic(data, response.status), response.status);
	} catch (err) {
		return json({ error: err.message }, 500);
	}
}

async function handleAirtable(request, env) {
	const table = new URL(request.url).searchParams.get('table');
	const sortField = ALLOWED_AIRTABLE_TABLES[table];
	if (!table || sortField === undefined) {
		return json({ error: 'Invalid or missing table' }, 400);
	}

	// Include the base and table in the cache key, without exposing the PAT.
	// Cache API entries are local to a Cloudflare data center, so a cold region
	// still makes one Airtable request before subsequent reads are served here.
	const cacheKey = new Request(request.url);
	const cache = typeof caches !== 'undefined' ? caches.default : null;
	const shouldCache = table !== 'LessonSlots';
	let cached;
	try {
		cached = cache && shouldCache ? await cache.match(cacheKey) : undefined;
	} catch {
		// Cache API is unavailable on some Worker hostnames (for example previews).
	}
	if (cached) {
		return json(await cached.json());
	}

	const airtableUrl = new URL(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`,
	);
	airtableUrl.searchParams.set('maxRecords', '200');
	airtableUrl.searchParams.set('pageSize', '100');
	if (sortField) {
		airtableUrl.searchParams.set('sort[0][field]', sortField);
		airtableUrl.searchParams.set('sort[0][direction]', 'asc');
	}

	const records = [];
	let offset;
	do {
		if (offset) {
			airtableUrl.searchParams.set('offset', offset);
		}

		const response = await fetch(airtableUrl, {
			headers: {
				Authorization: `Bearer ${env.AIRTABLE_PAT}`,
			},
		});

		const data = await response.json();
		if (!response.ok) {
			return json(withAirtableDiagnostic(data, response.status), response.status);
		}

		records.push(...data.records);
		offset = data.offset;
	} while (offset && records.length < 200);

	const result = {
		records:
			table === 'LessonSlots'
				? records.map((record) => ({
						id: record.id,
						fields: Object.fromEntries(
							PUBLIC_LESSON_SLOT_FIELDS.filter((field) =>
								Object.hasOwn(record.fields || {}, field),
							).map((field) => [field, record.fields[field]]),
						),
					}))
				: records,
	};
	const cachedResponse = new Response(JSON.stringify(result), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': `public, max-age=${AIRTABLE_CACHE_TTL_SECONDS}`,
		},
	});
	try {
		if (cache && shouldCache) await cache.put(cacheKey, cachedResponse);
	} catch {
		// Serving fresh Airtable data still succeeds if edge caching is unavailable.
	}
	if (!shouldCache) {
		return new Response(JSON.stringify(result), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
				...CORS_HEADERS,
			},
		});
	}
	return json(result);
}

async function handleBooking(request, env) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Request body must be valid JSON' }, 400);
	}

	const student = body && body.student;
	const slotIds = body && body.slotIds;
	if (!['Onza', 'Nimza'].includes(student)) {
		return json({ error: 'Student must be Onza or Nimza' }, 400);
	}
	if (
		!Array.isArray(slotIds) ||
		slotIds.length < 1 ||
		slotIds.length > 10 ||
		slotIds.some((id) => typeof id !== 'string' || !id.trim()) ||
		new Set(slotIds).size !== slotIds.length
	) {
		return json({ error: 'Select between 1 and 10 unique sessions' }, 400);
	}

	if (!env.AIRTABLE_BASE_ID || !env.AIRTABLE_PAT) {
		return json({ error: 'Airtable booking is not configured' }, 500);
	}

	const airtableUrl = new URL(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/LessonSlots`,
	);
	airtableUrl.searchParams.set('maxRecords', '200');
	airtableUrl.searchParams.set('pageSize', '100');
	const records = [];
	let offset;
	do {
		if (offset) airtableUrl.searchParams.set('offset', offset);
		const response = await fetch(airtableUrl, {
			headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` },
		});
		const data = await response.json();
		if (!response.ok) {
			return json(withAirtableDiagnostic(data, response.status), response.status);
		}
		records.push(...(data.records || []));
		offset = data.offset;
	} while (offset && records.length < 200);

	const requestedSlots = slotIds.map((id) =>
		records.find((record) => record.id === id),
	);
	if (
		requestedSlots.some(
			(record) =>
				!record ||
				record.fields?.Student !== student ||
				record.fields?.Status !== 'Available',
		)
	) {
		return json(
			{
				error:
					'One or more selected sessions are no longer available. Refresh and choose again.',
			},
			409,
		);
	}

	const bookedAt = new Date().toISOString();
	const updateUrl = new URL(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/LessonSlots`,
	);
	const updateResponse = await fetch(updateUrl, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${env.AIRTABLE_PAT}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			records: requestedSlots.map((record) => ({
				id: record.id,
				fields: { Status: 'Booked', BookedAt: bookedAt },
			})),
		}),
	});
	const updateData = await updateResponse.json();
	if (!updateResponse.ok) {
		return json(
			withAirtableDiagnostic(updateData, updateResponse.status),
			updateResponse.status,
		);
	}
	return json({ records: updateData.records || [] });
}

export class BookingCoordinator {
	constructor(ctx, env) {
		this.ctx = ctx;
		this.env = env;
	}

	fetch(request) {
		return this.ctx.blockConcurrencyWhile(() =>
			handleBooking(request, this.env),
		);
	}
}

function withAirtableDiagnostic(data, status) {
	if (status !== 429) return data;
	const airtableError = data?.error?.type || data?.error?.message || '';
	const monthlyLimit = String(airtableError).includes('BILLING_LIMIT');
	return {
		...data,
		workerMessage: monthlyLimit
			? 'Airtable monthly API call limit reached. Calls will work again when the workspace quota resets; caching cannot restore exhausted monthly calls.'
			: 'Airtable rate limit reached. Airtable requires a 30-second pause before another request to this base.',
	};
}

async function handleGitHub(request, env) {
	const urlParam = new URL(request.url).searchParams.get('url');
	if (!urlParam) {
		return json({ error: 'Missing url query parameter' }, 400);
	}

	let target;
	try {
		target = new URL(urlParam);
	} catch {
		return json({ error: 'Invalid url query parameter' }, 400);
	}

	// Only allow proxying to the GitHub API and raw content hosts.
	const allowedHosts = ['api.github.com', 'raw.githubusercontent.com', 'github.com'];
	if (!allowedHosts.includes(target.host)) {
		return json({ error: 'URL host not allowed' }, 403);
	}

	const headers = {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'english-explorer-tracker',
	};
	if (env.GITHUB_TOKEN) {
		headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
	}

	const response = await fetch(target.toString(), { headers });
	const contentType = response.headers.get('content-type') || '';
	const isJson = contentType.includes('application/json');

	const body = isJson ? await response.json() : await response.text();
	return json(body, response.status);
}

export default {
	async fetch(request, env) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}

		const url = new URL(request.url);

		// GitHub API proxy (GET /github?url=...)
		if (request.method === 'GET' && url.pathname === '/github') {
			return handleGitHub(request, env);
		}

		// Airtable table reader (GET /airtable?table=...)
		if (request.method === 'GET' && url.pathname === '/airtable') {
			return handleAirtable(request, env);
		}

		if (request.method === 'POST' && url.pathname === '/bookings') {
			const id = env.BOOKING_COORDINATOR.idFromName('lesson-bookings');
			return env.BOOKING_COORDINATOR.get(id).fetch(request);
		}

		// Airtable visitor tracking (POST)
		if (request.method === 'POST') {
			return handleTracking(request, env);
		}

		return new Response('Method not allowed', {
			status: 405,
			headers: CORS_HEADERS,
		});
	},
};
