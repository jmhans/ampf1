export function isAdmin(user: Record<string, unknown> | undefined): boolean {
  if (!user) return false;

  const namespace = 'https://actuarialgames.auth0.com';
  const roles = user[`${namespace}/roles`] as string[] | undefined;

  return roles?.includes('ampf1_admin') || false;
}
