import { auth0 } from '@/app/lib/auth0';
import { redirect } from 'next/navigation';
import FeedbackClient from './FeedbackClient';

export const dynamic = 'force-dynamic';

export default async function FeedbackPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/login?returnTo=/feedback');
  }

  const user = session.user;
  const displayName = (user.name || user.nickname || user.email || '') as string;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Submit site update requests or report issues. Browse existing requests below before submitting.
        </p>
      </div>
      <FeedbackClient displayName={displayName} />
    </div>
  );
}
