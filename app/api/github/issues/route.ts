import { auth0 } from '@/app/lib/auth0';
import { NextRequest } from 'next/server';

const GITHUB_REPO = 'jmhans/ampf1';
const GITHUB_API = 'https://api.github.com';

export async function GET(request: NextRequest) {
  const session = await auth0.getSession();

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stateParam = searchParams.get('state') || 'open';
  const validStates = ['open', 'closed', 'all'] as const;
  const state = validStates.includes(stateParam as (typeof validStates)[number])
    ? (stateParam as (typeof validStates)[number])
    : 'open';

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
  }

  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_REPO}/issues?state=${state}&per_page=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    return Response.json(
      { error: 'Failed to fetch issues', detail: errorText },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
  }

  const { title, body } = await request.json();

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return Response.json({ error: 'Title is required' }, { status: 400 });
  }

  const user = session.user;
  const displayName = (user.name || user.nickname || user.email || user.sub) as string;

  const issueBody = `${body ? body.trim() + '\n\n' : ''}---\n*Submitted by: ${displayName}*`;

  const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: title.trim(), body: issueBody }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return Response.json(
      { error: 'Failed to create issue', detail: errorText },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data, { status: 201 });
}
