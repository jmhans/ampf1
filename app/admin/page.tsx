import { auth0 } from '@/app/lib/auth0';
import { isAdmin } from '@/app/lib/auth-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';

export default async function AdminPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (!isAdmin(session.user)) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 text-center mt-8">
        <p className="text-red-800 dark:text-red-200 font-medium">Access Denied</p>
        <p className="mt-2 text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-16 items-end rounded-lg bg-red-600 dark:bg-red-700 p-4 mb-8">
        <h1 className={`${lusitana.className} text-white text-3xl`}>Admin Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/events"
          className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:border-red-500 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors text-2xl">
              🎱
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Bingo Events</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage the list of bingo squares</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
