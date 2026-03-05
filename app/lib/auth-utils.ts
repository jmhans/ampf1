export function isAdmin(user: Record<string, unknown> | undefined): boolean {
  if (!user) return false;

  const namespace = 'https://fantasyplayofffootball.vercel.app';
  const roles = user[`${namespace}/roles`] as string[] | undefined;

  return roles?.includes('ampf1_admin') || false;
}
