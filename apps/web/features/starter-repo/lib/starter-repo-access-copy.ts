export type StarterRepoAccessStatus =
	| "loading"
	| "none"
	| "requested"
	| "invited"
	| "accepted"
	| "failed";

export type StarterRepoAccessSurface = "mission" | "settings";

export function getStarterRepoStatusLabel(status: StarterRepoAccessStatus) {
	switch (status) {
		case "requested":
			return "Invite pending";
		case "invited":
			return "Invite sent";
		case "accepted":
			return "Access ready";
		case "failed":
			return "Needs retry";
		case "loading":
			return "Checking access";
		default:
			return "Not requested";
	}
}

export function getStarterRepoCardTitle(
	surface: StarterRepoAccessSurface,
	status: StarterRepoAccessStatus,
) {
	if (surface === "mission") {
		switch (status) {
			case "requested":
				return "Agent-First Starter Repo request saved";
			case "invited":
				return "Accept your Agent-First Starter Repo invite";
			case "failed":
				return "Fix your GitHub username";
			default:
				return "Unlock the Agent-First Starter Repo before Build";
		}
	}

	switch (status) {
		case "requested":
			return "Agent-First Starter Repo invite pending";
		case "invited":
			return "Agent-First Starter Repo invite sent";
		case "accepted":
			return "Agent-First Starter Repo access confirmed";
		case "failed":
			return "Agent-First Starter Repo access needs attention";
		default:
			return "Manage Agent-First Starter Repo access";
	}
}

export function getStarterRepoCardBody(
	surface: StarterRepoAccessSurface,
	status: StarterRepoAccessStatus,
) {
	if (surface === "mission") {
		switch (status) {
			case "requested":
				return "You can keep moving through the continuation library. We saved your GitHub username, but the build path stays locked until repo access is accepted.";
			case "invited":
				return "GitHub has the invite out. Accept it on your GitHub account, then come back here and the build path will open.";
			case "failed":
				return "The saved GitHub username did not provision cleanly. Update it here so we can retry the Agent-First Starter Repo invite.";
			case "loading":
				return "We are checking whether this account already has Agent-First Starter Repo access.";
			default:
				return "Add the GitHub username that should receive access to your Agent-First Starter Repo. This gives Build the execution base that matches your Ship Kit.";
		}
	}

	switch (status) {
		case "requested":
			return "The GitHub username is saved and waiting for the Agent-First Starter Repo invite to be sent.";
		case "invited":
			return "The Agent-First Starter Repo invite has been sent. Accept it from GitHub to finish provisioning.";
		case "accepted":
			return "This account has confirmed access to the Agent-First Starter Repo.";
		case "failed":
			return "The last provisioning attempt failed. Update the username and resubmit it here.";
		case "loading":
			return "We are checking the current Agent-First Starter Repo access state for this account.";
		default:
			return "Save the GitHub username that should receive the Agent-First Starter Repo invite.";
	}
}

export function getStarterRepoTemplateLockReason(
	status: StarterRepoAccessStatus,
) {
	switch (status) {
		case "loading":
			return "Checking Agent-First Starter Repo access before unlocking the build path.";
		case "requested":
			return "We saved your GitHub username. The build path opens after the repo invite is accepted.";
		case "invited":
			return "Accept the GitHub invite for the Agent-First Starter Repo before choosing the build path.";
		case "failed":
			return "Update your GitHub username in the Agent-First Starter Repo access card, then retry the invite.";
		default:
			return "Add your GitHub username first so we know where to send the Agent-First Starter Repo invite.";
	}
}
