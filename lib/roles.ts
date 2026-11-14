export function effectiveRole(
  storedRole: 'user' | 'admin',
  email: string | null,
  admins: readonly string[],
): 'user' | 'admin' {
  if (storedRole !== 'admin') return storedRole
  // ADMIN_EMAILS is the source of truth, but an empty list keeps DB-seeded admins
  // usable in local development and E2E.
  if (admins.length === 0) return storedRole
  return email !== null && admins.includes(email.toLowerCase()) ? 'admin' : 'user'
}
