export const APP_ID = "ericfinance";

export function stackId(stage: string, component: string): string {
  return `${APP_ID}-${stage}-${toKebab(component)}`;
}

// Generic resource name (non-global). Keep it short & kebab-case.
export function resourceName(
  stage: string,
  component: string,
  suffix?: string
): string {
  return [APP_ID, stage, toKebab(component), suffix && toKebab(suffix)]
    .filter(Boolean)
    .join("-");
}

// S3 bucket names must be globally unique and lowercase. Optionally append the account id.
export function bucketName(
  stage: string,
  component: string,
  account?: string,
  extra?: string
): string {
  const validAccount =
    account && /^[0-9]{6,20}$/.test(account) ? account : undefined;
  return [
    APP_ID,
    stage,
    toKebab(component),
    extra && toKebab(extra),
    validAccount,
  ]
    .filter(Boolean)
    .join("-")
    .toLowerCase();
}

// IAM Role names (avoid exceeding 64 chars). Keep consistent casing.
export function iamRoleName(stage: string, purpose: string): string {
  return `${APP_ID}-${stage}-${toKebab(purpose)}`.slice(0, 63);
}

export const Components = {
  auth: "auth",
  portfolio: "portfolio",
  staticSite: "web",
  githubOidc: "github-oidc",
};

function toKebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export interface NamingContext {
  stage: string;
  account?: string;
}

export function buildNaming(ctx: NamingContext) {
  return {
    stack(component: string) {
      return stackId(ctx.stage, component);
    },
    resource(component: string, suffix?: string) {
      return resourceName(ctx.stage, component, suffix);
    },
    bucket(component: string, extra?: string) {
      return bucketName(ctx.stage, component, ctx.account, extra);
    },
    role(purpose: string) {
      return iamRoleName(ctx.stage, purpose);
    },
  };
}
