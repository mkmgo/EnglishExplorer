import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src";

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
