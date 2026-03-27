const blogDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	day: "numeric",
	year: "numeric",
});

function getStableDateValue(isoDate: string) {
	if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
		const [year, month, day] = isoDate.split("-").map(Number);

		if (!year || !month || !day) {
			throw new Error(`Invalid date string: ${isoDate}`);
		}

		// Pin date-only strings to noon UTC so US timezones do not shift them backward.
		return new Date(Date.UTC(year, month - 1, day, 12));
	}

	return new Date(isoDate);
}

export function formatBlogDate(isoDate: string) {
	return blogDateFormatter.format(getStableDateValue(isoDate));
}
