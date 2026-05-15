export const DEFAULT_DEVELOPMENT_APP_URL = "http://localhost:3000";

export function resolveAppUrl(
  value: string | undefined,
  nodeEnv = process.env.NODE_ENV,
) {
  if (value !== undefined && value !== "") {
    return value;
  }

  if (nodeEnv === "development") {
    return DEFAULT_DEVELOPMENT_APP_URL;
  }

  return value;
}
