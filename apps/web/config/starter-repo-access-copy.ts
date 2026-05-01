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
				return "Starter repo request saved";
			case "invited":
				return "Accept your starter repo invite";
			case "failed":
				return "Fix your GitHub username";
			default:
				return "Unlock starter repo access before Build";
		}
	}

	switch (status) {
		case "requested":
			return "Starter repo invite pending";
		case "invited":
			return "Starter repo invite sent";
		case "accepted":
			return "Starter repo access confirmed";
		case "failed":
			return "Starter repo access needs attention";
		default:
			return "Manage starter repo access";
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
				return "GitHub has the repo invite out. Accept it on your GitHub account, then come back here and the build path will open.";
			case "failed":
				return "The saved GitHub username did not provision cleanly. Update it here so we can retry the starter repo invite.";
			case "loading":
				return "We are checking whether this account already has starter repo access.";
			default:
				return "Add the GitHub username that should receive access to your starter repo. This gives Build the execution base that matches your worker layer.";
		}
	}

	switch (status) {
		case "requested":
			return "The GitHub username is saved and waiting for the starter repo invite to be sent.";
		case "invited":
			return "The starter repo invite has been sent. Accept it from GitHub to finish provisioning.";
		case "accepted":
			return "This account has confirmed access to the starter repo.";
		case "failed":
			return "The last provisioning attempt failed. Update the username and resubmit it here.";
		case "loading":
			return "We are checking the current starter repo access state for this account.";
		default:
			return "Save the GitHub username that should receive the starter repo invite.";
	}
}

export function getStarterRepoTemplateLockReason(
	status: StarterRepoAccessStatus,
) {
	switch (status) {
		case "loading":
			return "Checking starter repo access before unlocking the build path.";
		case "requested":
			return "We saved your GitHub username. The build path opens after the repo invite is accepted.";
		case "invited":
			return "Accept the GitHub invite for the starter repo before choosing the build path.";
		case "failed":
			return "Update your GitHub username in the starter repo access card, then retry the invite.";
		default:
			return "Add your GitHub username first so we know where to send the starter repo invite.";
	}
}
