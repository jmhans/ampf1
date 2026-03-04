'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function UserDisplay() {
  const { user, isLoading } = useUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (isLoading) {
    return null;
  }

  if (user) {
    const userName = user.name || user.email || user.nickname || user.sub;

    return (
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 rounded-lg bg-red-700 hover:bg-red-800 px-3 py-2 text-sm text-white transition-colors"
        >
          {user.picture && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt={userName as string}
              className="h-6 w-6 rounded-full"
            />
          )}
          <span className="hidden sm:inline">{userName}</span>
        </button>

        {userMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setUserMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-20">
              <div className="py-1" role="menu">
                <div className="block px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  {user.email}
                </div>
                <Link
                  href="/auth/logout"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Sign Out
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="flex items-center rounded-lg bg-red-700 hover:bg-red-800 px-3 py-2 text-sm text-white transition-colors"
    >
      Sign In
    </Link>
  );
}
