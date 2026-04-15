import {
	getCollaboratorSyncOutcome,
	getInviteOutcome,
} from "@/scripts/lib/starter-repo-access.mjs";

describe("starter repo script helpers", () => {
	it("maps a 201 GitHub invite response to invited", () => {
		expect(
			getInviteOutcome({
				status: 201,
				body: { id: 123 },
				username: "ParkerRex",
			}),
		).toEqual({
			status: "invited",
			invitationId: "123",
		});
	});

	it("maps a 204 GitHub invite response to accepted", () => {
		expect(
			getInviteOutcome({
				status: 204,
				body: null,
				username: "ParkerRex",
			}),
		).toEqual({
			status: "accepted",
		});
	});

	it("maps a 404 or 422 GitHub invite response to failed", () => {
		expect(
			getInviteOutcome({
				status: 404,
				body: null,
				username: "MissingUser",
			}),
		).toEqual({
			status: "failed",
			lastError: "GitHub user MissingUser was not found.",
		});
		expect(
			getInviteOutcome({
				status: 422,
				body: { message: "Validation Failed" },
				username: "BadUser",
			}),
		).toEqual({
			status: "failed",
			lastError: "Validation Failed",
		});
	});

	it("treats collaborator status 204 as accepted and 404 as pending", () => {
		expect(getCollaboratorSyncOutcome(204)).toBe("accepted");
		expect(getCollaboratorSyncOutcome(404)).toBe("pending");
	});
});
