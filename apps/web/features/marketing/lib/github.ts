type ContributionDay = { date: string; contributionCount: number };
type ContributionWeek = { contributionDays: ContributionDay[] };

type GitHubContributionsResponse = {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: ContributionWeek[];
        };
      };
    };
  };
};

export type GitHubActivity = {
  totalContributions: number;
  data: { date: string; count: number }[];
};

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export async function fetchGitHubContributions(
  username: string,
): Promise<GitHubActivity | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { login: username } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as GitHubContributionsResponse;
    const calendar =
      json.data.user.contributionsCollection.contributionCalendar;

    const data = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
      })),
    );

    return { totalContributions: calendar.totalContributions, data };
  } catch {
    return null;
  }
}
