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
				return "SBS Blueprint request saved";
			case "invited":
				return "Accept your SBS Blueprint invite";
			case "failed":
				return "Fix your GitHub username";
			default:
				return "Unlock SBS Blueprint access before Build";
		}
	}

	switch (status) {
		case "requested":
			return "SBS Blueprint invite pending";
		case "invited":
			return "SBS Blueprint invite sent";
		case "accepted":
			return "SBS Blueprint access confirmed";
		case "failed":
			return "SBS Blueprint access needs attention";
		default:
			return "Manage SBS Blueprint access";
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
				return "The saved GitHub username did not provision cleanly. Update it here so we can retry the SBS Blueprint invite.";
			case "loading":
				return "We are checking whether this account already has SBS Blueprint access.";
			default:
				return "Add the GitHub username that should receive access to your SBS Blueprint. This gives Build the execution base that matches your Blueprint.";
		}
	}

	switch (status) {
		case "requested":
			return "The GitHub username is saved and waiting for the SBS Blueprint invite to be sent.";
		case "invited":
			return "The SBS Blueprint invite has been sent. Accept it from GitHub to finish provisioning.";
		case "accepted":
			return "This account has confirmed access to the SBS Blueprint.";
		case "failed":
			return "The last provisioning attempt failed. Update the username and resubmit it here.";
		case "loading":
			return "We are checking the current SBS Blueprint access state for this account.";
		default:
			return "Save the GitHub username that should receive the SBS Blueprint invite.";
	}
}

export function getStarterRepoTemplateLockReason(
	status: StarterRepoAccessStatus,
) {
	switch (status) {
		case "loading":
			return "Checking SBS Blueprint access before unlocking the build path.";
		case "requested":
			return "We saved your GitHub username. The build path opens after the repo invite is accepted.";
		case "invited":
			return "Accept the GitHub invite for the SBS Blueprint before choosing the build path.";
		case "failed":
			return "Update your GitHub username in the SBS Blueprint access card, then retry the invite.";
		default:
			return "Add your GitHub username first so we know where to send the SBS Blueprint invite.";
	}
}
