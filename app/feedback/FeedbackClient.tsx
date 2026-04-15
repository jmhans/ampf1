'use client';

import { useState, useEffect, useCallback } from 'react';

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  created_at: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: { id: number; name: string; color: string }[];
}

interface FeedbackClientProps {
  displayName: string;
}

export default function FeedbackClient({ displayName }: FeedbackClientProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState('');
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');

  const fetchIssues = useCallback(async (state: 'open' | 'closed') => {
    setIssuesLoading(true);
    setIssuesError('');
    try {
      const res = await fetch(`/api/github/issues?state=${state}`);
      if (!res.ok) throw new Error('Failed to load issues');
      const data: GitHubIssue[] = await res.json();
      setIssues(data);
    } catch {
      setIssuesError('Could not load issues. Please try again later.');
    } finally {
      setIssuesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues(activeTab);
  }, [activeTab, fetchIssues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/github/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitSuccess(true);
      setTitle('');
      setBody('');
      // Refresh open issues after successful submission
      if (activeTab === 'open') {
        fetchIssues('open');
      } else {
        setActiveTab('open');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Submit Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Submit Feedback
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Submitting as <span className="font-medium text-gray-700 dark:text-gray-300">{displayName}</span>
        </p>

        {submitSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            ✅ Your feedback has been submitted successfully!
          </div>
        )}

        {submitError && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            ❌ {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="feedback-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="feedback-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your request or issue"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label
              htmlFor="feedback-body"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Details
            </label>
            <textarea
              id="feedback-body"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide any additional context, steps to reproduce, or details about your request…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-vertical"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed px-5 py-2 text-sm font-semibold text-white transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>

      {/* Issues List */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Site Update Requests
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('open')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'open'
                ? 'border-red-600 text-red-600 dark:text-red-400 dark:border-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'closed'
                ? 'border-red-600 text-red-600 dark:text-red-400 dark:border-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Closed
          </button>
        </div>

        {issuesLoading ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            Loading issues…
          </div>
        ) : issuesError ? (
          <div className="text-center py-8 text-red-500 dark:text-red-400 text-sm">
            {issuesError}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No {activeTab} issues found.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {issues.map((issue) => (
              <li key={issue.id} className="py-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex-shrink-0 h-2 w-2 rounded-full ${
                      issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {issue.title}
                    </a>
                    {issue.labels.length > 0 && (
                      <span className="ml-2 inline-flex gap-1">
                        {issue.labels.map((label) => (
                          <span
                            key={label.id}
                            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: `#${label.color}` }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </span>
                    )}
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      #{issue.number} ·{' '}
                      {new Date(issue.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-right">
          <a
            href="https://github.com/jmhans/ampf1/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            View all issues on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}
