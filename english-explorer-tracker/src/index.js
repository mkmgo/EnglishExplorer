const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

// Tables that may be read through GET /airtable?table=<name>.
// Kept server-side so untrusted clients cannot read arbitrary tables.
const ALLOWED_AIRTABLE_TABLES = ['ReadingList'];

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
		return json(data, response.status);
	} catch (err) {
		return json({ error: err.message }, 500);
	}
}

async function handleAirtable(request, env) {
	const table = new URL(request.url).searchParams.get('table');
	if (!table || !ALLOWED_AIRTABLE_TABLES.includes(table)) {
		return json({ error: 'Invalid or missing table' }, 400);
	}

	const airtableUrl =
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}` +
		'?maxRecords=200&pageSize=100&sort[0][field]=DisplayOrder&sort[0][direction]=asc';

	const response = await fetch(airtableUrl, {
		headers: {
			Authorization: `Bearer ${env.AIRTABLE_PAT}`,
		},
	});

	const data = await response.json();
	return json(data, response.status);
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
