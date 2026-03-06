import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Construct APP_BASE_URL dynamically from VERCEL_URL if available
const getBaseUrl = () => {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

export const auth0 = new Auth0Client({
  baseURL: getBaseUrl(),
  beforeSessionSaved: async (session) => {
    // Auth0 v4 filters out custom claims by default - preserve them from ID token
    if (session.idToken) {
      const namespace = 'https://fantasyplayofffootball.vercel.app';
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
