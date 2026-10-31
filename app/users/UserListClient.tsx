"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, ShieldAlert, CheckCircle2, ChevronRight, Coins, Laptop, Smartphone } from 'lucide-react';

export interface UserSummary {
  id: string;
  sharedUserId?: string;
  credits: number;
  subscriptionTier: string;
  totalGenerations: number;
  platform?: string;
  isBlocked: boolean;
  blockReason?: string | null;
  lastActiveFormatted: string;
  createdAtFormatted: string;
}

export default function UserListClient({ initialUsers }: { initialUsers: UserSummary[] }) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return initialUsers.filter(user => {
      const query = search.toLowerCase();
      const matchesSearch = !search || 
        user.id.toLowerCase().includes(query) || 
        (user.sharedUserId && user.sharedUserId.toLowerCase().includes(query));

      const matchesTier = tierFilter === 'all' || user.subscriptionTier === tierFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'blocked' ? user.isBlocked : !user.isBlocked);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [initialUsers, search, tierFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by User ID or Shared ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="lifetime">Lifetime</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>
        </div>
      </div>

      {/* Users Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filteredUsers.length} of {initialUsers.length} users</span>
        {(search || tierFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setTierFilter('all'); setStatusFilter('all'); }}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">User Identity</th>
                <th scope="col" className="px-5 py-3.5">Credits</th>
                <th scope="col" className="px-5 py-3.5">Tier</th>
                <th scope="col" className="px-5 py-3.5">Platform</th>
                <th scope="col" className="px-5 py-3.5">Generations</th>
                <th scope="col" className="px-5 py-3.5">Last Active</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs font-semibold text-white tracking-tight">
                        {user.sharedUserId || user.id}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                        ID: {user.id}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{user.credits.toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-lg ${
                        user.subscriptionTier === 'weekly' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : user.subscriptionTier === 'monthly'
                          ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                          : user.subscriptionTier === 'lifetime'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {user.subscriptionTier.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-4 capitalize text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {user.platform === 'ios' ? <Smartphone className="w-3.5 h-3.5 text-slate-400" /> : <Laptop className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{user.platform || 'macos'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-300 font-medium">
                      {user.totalGenerations}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {user.lastActiveFormatted}
                    </td>

                    <td className="px-5 py-4">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ShieldAlert className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/users/${user.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
