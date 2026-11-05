import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker, { BookingCoordinator } from "../src";

describe("English Explorer Tracker worker", () => {
	it("returns 405 for unknown routes", async () => {
		const ctx = createExecutionContext();
		const response = await worker.fetch(
			new Request("https://tracker.dev/whatever"),
			env,
			ctx,
		);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(405);
	});

	it("rejects the GitHub proxy when url host is not allowed", async () => {
		const response = await SELF.fetch(
			"https://tracker.dev/github?url=" +
				encodeURIComponent("https://evil.example/path"),
		);
		expect(response.status).toBe(403);
	});

	it("rejects the GitHub proxy when url is missing", async () => {
		const response = await SELF.fetch("https://tracker.dev/github");
		expect(response.status).toBe(400);
	});

	it("rejects /airtable when table is missing", async () => {
		const response = await SELF.fetch("https://tracker.dev/airtable");
		expect(response.status).toBe(400);
	});

	it("rejects /airtable for a non-allowlisted table", async () => {
		const response = await SELF.fetch(
			"https://tracker.dev/airtable?table=Secrets",
		);
		expect(response.status).toBe(400);
	});

	it("reads public lesson slots without caching or exposing other fields", async () => {
		const ctx = createExecutionContext();
		const origFetch = globalThis.fetch;
		globalThis.fetch = () =>
			new Response(
				JSON.stringify({
					records: [
						{
							id: "recSlot1",
							fields: {
								Student: "Onza",
								StartsAt: "2026-11-12T08:00:00.000Z",
								Status: "Available",
								Lesson: "Farmstead",
								PrivateNote: "not public",
							},
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		try {
			const response = await worker.fetch(
				new Request("https://tracker.dev/airtable?table=LessonSlots"),
				{ AIRTABLE_BASE_ID: "base1", AIRTABLE_PAT: "pat-test" },
				ctx,
			);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);
			expect(response.headers.get("Cache-Control")).toBe("no-store");
			const body = await response.json();
			expect(body.records[0].fields.PrivateNote).toBeUndefined();
			expect(body.records[0].fields.Lesson).toBe("Farmstead");
		} finally {
			globalThis.fetch = origFetch;
		}
	});

	it("confirms available lesson slots through the booking coordinator", async () => {
		const origFetch = globalThis.fetch;
		const calls = [];
		globalThis.fetch = async (url, options = {}) => {
			calls.push({ url: new URL(String(url)), options });
			if (options.method === "PATCH") {
				const body = JSON.parse(options.body);
				return new Response(JSON.stringify({ records: body.records }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
			return new Response(
				JSON.stringify({
					records: [
						{
							id: "recSlot1",
							fields: { Student: "Onza", Status: "Available" },
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		};
		try {
			const coordinator = new BookingCoordinator(
				{ blockConcurrencyWhile: (callback) => callback() },
				{ AIRTABLE_BASE_ID: "base1", AIRTABLE_PAT: "pat-test" },
			);
			const response = await coordinator.fetch(
				new Request("https://tracker.dev/bookings", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ student: "Onza", slotIds: ["recSlot1"] }),
				}),
			);
			expect(response.status).toBe(200);
			expect(calls).toHaveLength(2);
			expect(calls[1].options.method).toBe("PATCH");
			expect(JSON.parse(calls[1].options.body).records[0].fields.Status).toBe(
				"Booked",
			);
		} finally {
			globalThis.fetch = origFetch;
		}
	});

	it("rejects a slot that has already been booked", async () => {
		const origFetch = globalThis.fetch;
		let requestCount = 0;
		globalThis.fetch = async () => {
			requestCount += 1;
			return new Response(
				JSON.stringify({
					records: [
						{
							id: "recSlot1",
							fields: { Student: "Onza", Status: "Booked" },
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		};
		try {
			const coordinator = new BookingCoordinator(
				{ blockConcurrencyWhile: (callback) => callback() },
				{ AIRTABLE_BASE_ID: "base1", AIRTABLE_PAT: "pat-test" },
			);
			const response = await coordinator.fetch(
				new Request("https://tracker.dev/bookings", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ student: "Onza", slotIds: ["recSlot1"] }),
				}),
			);
			expect(response.status).toBe(409);
			expect(requestCount).toBe(1);
		} finally {
			globalThis.fetch = origFetch;
		}
	});

	it("reads an allowlisted Airtable table and returns records", async () => {
		const ctx = createExecutionContext();
		const inner = () =>
			new Response(
				JSON.stringify({
					records: [
						{
							id: "rec1",
							fields: { Title: "Interests and Hobbies", Link: "https://example.com/a.png" },
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		const origFetch = globalThis.fetch;
		globalThis.fetch = inner;
		try {
			const response = await worker.fetch(
				new Request("https://tracker.dev/airtable?table=BTStudyHub"),
				{ AIRTABLE_BASE_ID: "base1", AIRTABLE_PAT: "pat-test" },
				ctx,
			);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.records[0].fields.Title).toBe("Interests and Hobbies");
		} finally {
			globalThis.fetch = origFetch;
		}
	});

	it("fetches all Airtable pages up to the 200-record limit", async () => {
		const ctx = createExecutionContext();
		const requestedUrls = [];
		const origFetch = globalThis.fetch;
		globalThis.fetch = (url) => {
			const parsedUrl = new URL(String(url));
			requestedUrls.push(parsedUrl);
			const page = requestedUrls.length;
			return new Response(
				JSON.stringify(
					{
						records: Array.from({ length: 100 }, (_, index) => ({
							id: `rec${(page - 1) * 100 + index}`,
						})),
						offset: `next-page-${page}`,
					},
				),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		};
		try {
			const response = await worker.fetch(
				new Request(
					"https://tracker.dev/airtable?table=BTStudyHub&test=pagination",
				),
				{ AIRTABLE_BASE_ID: "base1", AIRTABLE_PAT: "pat-test" },
				ctx,
			);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);
			expect(requestedUrls).toHaveLength(2);
			expect(requestedUrls[0].searchParams.get("maxRecords")).toBe("200");
			expect(requestedUrls[0].searchParams.get("pageSize")).toBe("100");
			expect(requestedUrls[1].searchParams.get("offset")).toBe("next-page-1");
			const body = await response.json();
			expect(body.records).toHaveLength(200);
			expect(body.records[199].id).toBe("rec199");
		} finally {
			globalThis.fetch = origFetch;
		}
	});

	it("reads a GridShift table without a sort param", async () => {
		const ctx = createExecutionContext();
		let requestedUrl = "";
		const inner = (url) => {
			requestedUrl = String(url);
			return new Response(
				JSON.stringify({
					records: [{ id: "rec9", fields: { TileName: "Dog", Display: "Dog" } }],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		};
		const origFetch = globalThis.fetch;
		globalThis.fetch = inner;
		try {
			const response = await worker.fetch(
				new Request("https://tracker.dev/airtable?table=GridShift"),
				{ AIRTABLE_BASE_ID: "base1", AIRTABLE_PAT: "pat-test" },
				ctx,
			);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);
			expect(requestedUrl).not.toContain("sort[0][field]");
			const body = await response.json();
			expect(body.records[0].fields.TileName).toBe("Dog");
		} finally {
			globalThis.fetch = origFetch;
		}
	});

	it("reads GridShiftVariants without a sort param", async () => {
		const ctx = createExecutionContext();
		let requestedUrl = "";
		const origFetch = globalThis.fetch;
		globalThis.fetch = (url) => {
			requestedUrl = String(url);
			return new Response(
				JSON.stringify({
					records: [
						{
							id: "rec10",
							fields: { Name: "GridShift Pure Match", Active: true },
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		};
		try {
			const response = await worker.fetch(
				new Request(
					"https://tracker.dev/airtable?table=GridShiftVariants",
				),
				{ AIRTABLE_BASE_ID: "base1", AIRTABLE_PAT: "pat-test" },
				ctx,
			);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);
			expect(requestedUrl).not.toContain("sort[0][field]");
			const body = await response.json();
			expect(body.records[0].fields.Name).toBe("GridShift Pure Match");
		} finally {
			globalThis.fetch = origFetch;
		}
	});

	it("reads GridShiftSystem without a sort param", async () => {
		const ctx = createExecutionContext();
		let requestedUrl = "";
		const origFetch = globalThis.fetch;
		globalThis.fetch = (url) => {
			requestedUrl = String(url);
			return new Response(
				JSON.stringify({
					records: [
						{
							id: "rec11",
							fields: {
								SYSID: 5,
								SysItem: "TargetBox",
								SysIcoLucide: "target",
								ShowLabel: false,
								ShowIcoLucide: true,
							},
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		};
		try {
			const response = await worker.fetch(
				new Request("https://tracker.dev/airtable?table=GridShiftSystem"),
				{ AIRTABLE_BASE_ID: "base1", AIRTABLE_PAT: "pat-test" },
				ctx,
			);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);
			expect(requestedUrl).not.toContain("sort[0][field]");
			const body = await response.json();
			expect(body.records[0].fields.SysItem).toBe("TargetBox");
			expect(body.records[0].fields.ShowIcoLucide).toBe(true);
		} finally {
			globalThis.fetch = origFetch;
		}
	});

	it("proxies a GET to the GitHub API", async () => {
		const ctx = createExecutionContext();
		const inner = () =>
			new Response(
				JSON.stringify({ repo: "EnglishExplorer" }),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		const origFetch = globalThis.fetch;
		globalThis.fetch = inner;
		try {
			const response = await worker.fetch(
				new Request(
					"https://tracker.dev/github?url=" +
						encodeURIComponent(
							"https://api.github.com/repos/mkmgo/EnglishExplorer",
						),
				),
				{ GITHUB_TOKEN: "test-token" },
				ctx,
			);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.repo).toBe("EnglishExplorer");
		} finally {
			globalThis.fetch = origFetch;
		}
	});
});
