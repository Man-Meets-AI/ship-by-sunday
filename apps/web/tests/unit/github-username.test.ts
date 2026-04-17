import {
	normalizeGitHubUsername,
	toGitHubUsernameLower,
	validateGitHubUsername,
} from "@/features/starter-repo/lib/github-username";

describe("GitHub username helpers", () => {
	it("normalizes whitespace and a leading at-sign", () => {
		expect(normalizeGitHubUsername("  @ParkerRex  ")).toBe("ParkerRex");
		expect(toGitHubUsernameLower("  @ParkerRex  ")).toBe("parkerrex");
	});

	it("rejects invalid username shapes", () => {
		expect(validateGitHubUsername("")).toMatchObject({
			error: expect.stringContaining("Enter the GitHub username"),
		});
		expect(validateGitHubUsername("bad/name")).toMatchObject({
			error: expect.stringContaining("letters, numbers, or single hyphens"),
		});
		expect(validateGitHubUsername("-starter")).toMatchObject({
			error: expect.stringContaining("cannot start or end with a hyphen"),
		});
		expect(validateGitHubUsername("bad--name")).toMatchObject({
			error: expect.stringContaining("cannot contain consecutive hyphens"),
		});
		expect(validateGitHubUsername("x".repeat(40))).toMatchObject({
			error: expect.stringContaining("39 characters or fewer"),
		});
	});

	it("accepts a valid GitHub username", () => {
		expect(validateGitHubUsername("@ShipBySunday")).toEqual({
			normalized: "ShipBySunday",
			error: null,
		});
	});
});
