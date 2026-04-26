const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const KEBAB_CASE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== ""
}

export function validateRequiredFrontmatterKeys(params: {
  issues: string[]
  metadata: Record<string, unknown>
  requiredKeys: readonly string[]
}): void {
  for (const key of params.requiredKeys) {
    if (!(key in params.metadata)) {
      params.issues.push(`Missing required frontmatter key: ${key}.`)
    }
  }
}

export function validateAllowedFrontmatterKeys(params: {
  allowedKeys: ReadonlySet<string>
  issues: string[]
  metadata: Record<string, unknown>
}): void {
  for (const key of Object.keys(params.metadata)) {
    if (!params.allowedKeys.has(key)) {
      params.issues.push(`Unexpected frontmatter key: ${key}.`)
    }
  }
}

export function validateNonEmptyStringField(params: {
  issues: string[]
  key: string
  metadata: Record<string, unknown>
}): void {
  if (!isNonEmptyString(params.metadata[params.key])) {
    params.issues.push(`Frontmatter ${params.key} must be a non-empty string.`)
  }
}

export function validateReadWhen(params: {
  issues: string[]
  value: unknown
}): void {
  if (!Array.isArray(params.value) || params.value.length === 0) {
    params.issues.push("Frontmatter read_when must be a non-empty YAML list.")
    return
  }

  params.value.forEach((entry, index) => {
    if (!isNonEmptyString(entry)) {
      params.issues.push(
        `Frontmatter read_when[${index}] must be a non-empty string.`,
      )
    }
  })
}

export function validateStringList(params: {
  allowEmpty?: boolean
  fieldName: string
  issues: string[]
  value: unknown
}): void {
  if (!Array.isArray(params.value)) {
    params.issues.push(`Frontmatter ${params.fieldName} must be a YAML list.`)
    return
  }

  if (params.value.length === 0 && params.allowEmpty !== true) {
    params.issues.push(
      `Frontmatter ${params.fieldName} must be a non-empty YAML list.`,
    )
    return
  }

  params.value.forEach((entry, index) => {
    if (!isNonEmptyString(entry)) {
      params.issues.push(
        `Frontmatter ${params.fieldName}[${index}] must be a non-empty string.`,
      )
    }
  })
}

export function validateIsoDateOrNull(params: {
  allowNull?: boolean
  fieldName: string
  issues: string[]
  value: unknown
}): void {
  if (params.value === null && params.allowNull === true) {
    return
  }

  if (!isNonEmptyString(params.value) || !ISO_DATE_PATTERN.test(params.value)) {
    params.issues.push(
      `Frontmatter ${params.fieldName} must be a YYYY-MM-DD string${
        params.allowNull === true ? " or null" : ""
      }.`,
    )
  }
}

export function validateKebabCaseId(params: {
  fieldName: string
  issues: string[]
  value: unknown
}): void {
  if (!isNonEmptyString(params.value)) {
    params.issues.push(
      `Frontmatter ${params.fieldName} must be a non-empty string.`,
    )
    return
  }

  if (!KEBAB_CASE_ID_PATTERN.test(params.value)) {
    params.issues.push(
      `Frontmatter ${params.fieldName} must be a stable kebab-case id slug.`,
    )
  }
}

export function validateRepoRelativeMarkdownPath(params: {
  fieldName: string
  issues: string[]
  value: unknown
}): void {
  if (!isNonEmptyString(params.value)) {
    params.issues.push(
      `Frontmatter ${params.fieldName} must be a non-empty string.`,
    )
    return
  }

  if (
    params.value.startsWith("/") ||
    params.value.startsWith("~/") ||
    params.value.includes("://")
  ) {
    params.issues.push(
      `Frontmatter ${params.fieldName} must be a repo-relative path, not an absolute path or URL.`,
    )
    return
  }

  if (!params.value.endsWith(".md")) {
    params.issues.push(
      `Frontmatter ${params.fieldName} must be a repo-relative Markdown path.`,
    )
  }
}

export function validateH1TitleMatch(params: {
  h1: string | null
  issues: string[]
  missingMessage: string
  title: unknown
}): void {
  if (!isNonEmptyString(params.title)) {
    params.issues.push("Frontmatter title must be a non-empty string.")
    return
  }

  if (!params.h1) {
    params.issues.push(params.missingMessage)
    return
  }

  if (params.h1 !== params.title) {
    params.issues.push(
      `Frontmatter title must match the H1 exactly. Found title "${String(params.title)}" and H1 "${params.h1}".`,
    )
  }
}
