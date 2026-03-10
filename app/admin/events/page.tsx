import { auth0 } from '@/app/lib/auth0';
import { isAdmin } from '@/app/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getAllEvents, getCompletedRaces } from '@/app/lib/actions/events';
import EventsClient from './EventsClient';

export const dynamic = 'force-dynamic';

export default async function EventsAdminPage() {
  const session = await auth0.getSession();

  if (!session?.user) redirect('/auth/login');
  if (!isAdmin(session.user)) redirect('/admin');

  const [events, races] = await Promise.all([
    getAllEvents(),
    getCompletedRaces(),
  ]);

  return <EventsClient events={events} races={races} />;
}
