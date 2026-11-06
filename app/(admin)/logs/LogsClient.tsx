"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  History,
  Coins,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';

export interface LogEntry {
  id: string;
  userId: string;
  sharedUserId: string;
  amount: number;
  type: string;
  description: string;
  dateFormatted: string;
  createdAtMs: number;
}

export default function LogsClient({ initialLogs }: { initialLogs: LogEntry[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    initialLogs.forEach(l => set.add(l.type));
    return Array.from(set).sort();
  }, [initialLogs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return initialLogs.filter(log => {
      const matchesSearch =
        !query ||
        log.sharedUserId.toLowerCase().includes(query) ||
        log.userId.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.type.toLowerCase().includes(query);
      const matchesType = typeFilter === 'all' || log.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [initialLogs, search, typeFilter]);

  const totalCreditsAdded = useMemo(
    () => filteredLogs.reduce((acc, l) => (l.amount > 0 ? acc + l.amount : acc), 0),
    [filteredLogs]
  );
  const totalCreditsSpent = useMemo(
    () => filteredLogs.reduce((acc, l) => (l.amount < 0 ? acc + Math.abs(l.amount) : acc), 0),
    [filteredLogs]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            <span>All User Logs</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Credit transactions and activity across every user, newest first.
          </p>
        </div>

        <button
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Log Events</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-white tracking-tight">{filteredLogs.length}</div>
          <div className="text-xs text-slate-400 mt-1">Matching current filters</div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Credits Added</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-400 tracking-tight">
            +{totalCreditsAdded.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Grants, purchases & plan bonuses</div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Credits Used</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-rose-400 tracking-tight">
            -{totalCreditsSpent.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Deductions & generation usage</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user ID, type, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            {typeOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Count / clear */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filteredLogs.length} of {initialLogs.length} log events</span>
        {(search || typeFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('all'); }}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs Table (fixed layout — no horizontal scroll) */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-sm">
        <table className="w-full table-fixed text-left text-sm text-slate-300">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[26%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead className="text-[11px] uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
            <tr>
              <th scope="col" className="px-3 py-3">User</th>
              <th scope="col" className="px-3 py-3">Date &amp; Time</th>
              <th scope="col" className="px-3 py-3">Type</th>
              <th scope="col" className="px-3 py-3">Amount</th>
              <th scope="col" className="px-3 py-3">Description</th>
              <th scope="col" className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  No log events found{search || typeFilter !== 'all' ? ' matching your filters' : ''}.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={`${log.userId}-${log.id}`} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-3 py-3 min-w-0">
                    <div
                      className="font-mono text-xs font-semibold text-white tracking-tight truncate"
                      title={log.sharedUserId}
                    >
                      {log.sharedUserId}
                    </div>
                    <div
                      className="text-[10px] text-slate-500 font-mono mt-0.5 truncate"
                      title={log.userId}
                    >
                      ID: {log.userId}
                    </div>
                  </td>

                  <td className="px-3 py-3 text-[11px] text-slate-400 leading-tight">
                    {log.dateFormatted}
                  </td>

                  <td className="px-3 py-3 min-w-0">
                    <span
                      className={`inline-block max-w-full truncate px-1.5 py-0.5 rounded text-[10px] font-medium border align-middle ${
                        log.amount > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : log.amount < 0
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title={log.type}
                    >
                      {log.type}
                    </span>
                  </td>

                  <td className="px-3 py-3 min-w-0">
                    <div className={`flex items-center gap-1 font-semibold text-xs ${
                      log.amount > 0 ? 'text-emerald-400' : log.amount < 0 ? 'text-rose-400' : 'text-slate-300'
                    }`}>
                      <Coins className="w-3 h-3 opacity-70 shrink-0" />
                      <span className="truncate">{log.amount > 0 ? `+${log.amount}` : log.amount}</span>
                    </div>
                  </td>

                  <td className="px-3 py-3 text-xs text-slate-300 min-w-0">
                    <span className="block truncate" title={log.description}>
                      {log.description}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/users/${log.userId}`}
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                      title="View user"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
