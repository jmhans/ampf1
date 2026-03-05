import { auth0 } from '@/app/lib/auth0';
import Link from 'next/link';
import { getAllParticipants, getParticipantByAuth0Id } from '@/app/lib/actions/participants';
import JoinPoolButton from './JoinPoolButton';

export const dynamic = 'force-dynamic';

export default async function ParticipantsPage() {
  const [session, allParticipants] = await Promise.all([
    auth0.getSession(),
    getAllParticipants(),
  ]);

  const user = session?.user ?? null;
  const auth0Id = user?.sub ?? null;

  // Check if logged-in user is already in the pool
  const currentParticipant = auth0Id
    ? await getParticipantByAuth0Id(auth0Id)
    : null;

  const displayName = user
    ? (user.name || user.nickname || user.email || '') as string
    : '';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Participants
        </h2>

        {/* CTA: varies based on auth + pool status */}
        {!user ? (
          // Not logged in → prompt to sign in first
          <a
            href="/auth/login?returnTo=/participants"
            className="rounded-lg bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Sign in to Join Pool
          </a>
        ) : !currentParticipant ? (
          // Logged in but not yet in the pool
          <JoinPoolButton
            auth0Id={auth0Id!}
            email={(user.email as string) ?? null}
            displayName={displayName}
          />
        ) : (
          // Already in the pool
          <span className="rounded-lg bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400">
            ✅ You&apos;re in the pool
          </span>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {allParticipants.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-sm">
            No participants yet — be the first to join!
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {allParticipants.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-t border-gray-100 dark:border-gray-700 ${
                    p.auth0Id === auth0Id ? 'bg-red-50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    <Link
                      href={`/participants/${p.id}`}
                      className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {p.name}
                    </Link>
                    {p.auth0Id === auth0Id && (
                      <span className="ml-2 text-xs text-red-500">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
