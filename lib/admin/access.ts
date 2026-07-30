export function isAdminEnabled(): boolean {
  if (process.env.ADMIN_ENABLED === "true") {
    return true;
  }
  return process.env.NODE_ENV === "development";
}
