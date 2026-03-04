import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  beforeSessionSaved: async (session) => {
    // Auth0 v4 filters out custom claims by default - preserve them from ID token
    if (session.idToken) {
      const namespace = 'https://actuarialgames.auth0.com';
      const rolesKey = `${namespace}/roles`;

      const idToken = session.idToken as Record<string, unknown>;
      const user = session.user as Record<string, unknown>;

      if (idToken[rolesKey]) {
        user[rolesKey] = idToken[rolesKey];
      }
    }

    return session;
  },
});
