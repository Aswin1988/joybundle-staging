const ALLOWED_ROLES = new Set(['owner', 'admin']);

export function isAllowedAdminRole(role) {
  return ALLOWED_ROLES.has(role);
}
