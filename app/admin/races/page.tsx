import { auth0 } from '@/app/lib/auth0';
import { isAdmin } from '@/app/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getAllRaces } from '@/app/lib/actions/races';
import RacesClient from './RacesClient';

export const dynamic = 'force-dynamic';

export default async function RacesAdminPage() {
  const session = await auth0.getSession();

  if (!session?.user) redirect('/auth/login');
  if (!isAdmin(session.user)) redirect('/admin');

  const races = await getAllRaces();

  return <RacesClient races={races} />;
}
