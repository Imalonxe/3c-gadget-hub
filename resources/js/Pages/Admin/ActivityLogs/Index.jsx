import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';

const IconLogin = ({ className = 'w-4 h-4 inline-block mr-2' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12H9.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9.75L20.25 12 18 14.25" />
    </svg>
);

function timeAgo(iso) {
    try {
        const d = new Date(iso);
        const diff = Date.now() - d.getTime();
        const sec = Math.floor(diff / 1000);
        const min = Math.floor(sec / 60);
        const hr = Math.floor(min / 60);
        const day = Math.floor(hr / 24);

        if (sec < 60) return `${sec}s ago`;
        if (min < 60) return `${min}m ago`;
        if (hr < 24) return `${hr}h ago`;
        return `${day}d ago`;
    } catch (e) {
        return '';
    }
}

export default function Index({ logs, filters = {} }) {
    const [q, setQ] = useState(filters.q || '');
    const [user, setUser] = useState(filters.user || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    function submitFilters(e) {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('admin.activity-logs.index'), {
            q: q || undefined,
            user: user || undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
        }, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setQ('');
        setUser('');
        setFromDate('');
        setToDate('');
        router.get(route('admin.activity-logs.index'), {}, { preserveState: true, replace: true });
    }
    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Activity Logs</h2>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => router.get(route('admin.activity-logs.index'), { action: '' }, { preserveState: true, replace: true })}
                            className={`px-3 py-1 rounded-md text-sm ${!filters.action ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => router.get(route('admin.activity-logs.index'), { action: 'login' }, { preserveState: true, replace: true })}
                            className={`px-3 py-1 rounded-md text-sm ${filters.action === 'login' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                        >
                            <IconLogin className="w-4 h-4 inline-block -mt-0.5 mr-1 text-current" />
                            Logins
                        </button>
                    </div>
                    <div className="text-sm text-gray-600">{filters.action ? `Filtering: ${filters.action}` : 'Showing all actions'}</div>
                </div>

                {/* Filters: search, user, from/to dates */}
                <form onSubmit={submitFilters} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search action, URL, IP or user"
                        className="px-3 py-2 border rounded-md w-full"
                    />

                    <input
                        type="text"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        placeholder="User name or email"
                        className="px-3 py-2 border rounded-md w-full"
                    />

                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="px-3 py-2 border rounded-md w-full"
                    />

                    <div className="flex space-x-2">
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-3 py-2 border rounded-md w-full"
                        />
                        <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-md">Filter</button>
                        <button type="button" onClick={clearFilters} className="px-3 py-2 border rounded-md">Clear</button>
                    </div>
                </form>

                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">User</th>
                                <th className="px-4 py-2 text-left">Action</th>
                                <th className="px-4 py-2 text-left">URL</th>
                                <th className="px-4 py-2 text-left">IP</th>
                                <th className="px-4 py-2 text-left">When</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                // Calculate starting index for current page so numbering is 1..n across pages
                                const currentPage = logs.current_page || (logs.meta && logs.meta.current_page) || 1;
                                const perPage = logs.per_page || (logs.meta && logs.meta.per_page) || (logs.data ? logs.data.length : 0);
                                const startIndex = (currentPage - 1) * perPage;
                                const pageCount = logs.data ? logs.data.length : 0;

                                return logs.data.map((log, idx) => {
                                    // Calculate row number so that the newest log on the page is numbered sequentially
                                        // e.g. page 1 -> 1..n (newest first), page 2 -> (perPage+1).. etc.
                                        const rowNumber = startIndex + idx + 1;

                                    return (
                                        <tr key={log.id} className="border-t">
                                            <td className="px-4 py-3">{rowNumber}</td>
                                            <td className="px-4 py-3">{log.user ? log.user.name : 'Guest'}</td>
                                            <td className="px-4 py-3">
                                                {log.action === 'login' ? (
                                                    <span className="flex items-center">
                                                        <IconLogin className="w-4 h-4 mr-2 text-indigo-600" />
                                                        <span className="capitalize">{log.action}</span>
                                                    </span>
                                                ) : (
                                                    <span className="capitalize">{log.action}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 truncate max-w-xs">{log.url}</td>
                                            <td className="px-4 py-3">{log.ip_address}</td>
                                            <td className="px-4 py-3">
                                                <div>{new Date(log.created_at).toLocaleString()}</div>
                                                <div className="text-xs text-gray-500">{timeAgo(log.created_at)}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={route('admin.activity-logs.show', log.id)} className="text-indigo-600">View</Link>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    {/* Simple pagination controls */}
                    {logs.links && (
                        <nav className="inline-flex items-center" aria-label="Pagination">
                            {logs.links.map((link, idx) => {
                                const isDisabled = !link.url;
                                const isActive = link.active;
                                const base = 'relative inline-flex items-center px-3 md:px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-150 mx-1';
                                const state = isActive
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';

                                return (
                                    <Link
                                        key={idx}
                                        href={isDisabled ? undefined : link.url}
                                        onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                                        className={`${base} ${state} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                                        aria-disabled={isDisabled}
                                        aria-current={isActive ? 'page' : undefined}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </nav>
                    )}
                </div>
            </div>
        </Layout>
    );
}
