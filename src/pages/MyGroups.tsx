import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGroups } from '../context/GroupContext';
import { useAccount } from 'wagmi';
import { shortenAddress, formatTokenAmount } from '../config/contract';
import { Users, Plus, Search, Filter, Layers, ArrowUpRight } from 'lucide-react';
import { Token } from '../types';

export const MyGroups: React.FC = () => {
  const { userGroups, isLoading } = useGroups();
  const { address } = useAccount();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [tokenFilter, setTokenFilter] = useState<'ALL' | 'USDC' | 'EURC'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COLLECTING' | 'FULLY_COLLECTED' | 'RELEASED'>('ALL');

  const filteredGroups = userGroups.filter((group) => {
    // Search
    if (searchQuery && !group.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Token
    if (tokenFilter === 'USDC' && group.token !== Token.USDC) return false;
    if (tokenFilter === 'EURC' && group.token !== Token.EURC) return false;

    // Status
    if (statusFilter !== 'ALL') {
      const isRel = group.activeCycle?.isReleased || (!group.activeCycle && group.pastCycles && group.pastCycles.length > 0);
      const isFull = group.activeCycle && group.activeCycle.totalCollected >= group.activeCycle.totalExpected;
      const isColl = group.activeCycle && !isFull && !isRel;

      if (statusFilter === 'RELEASED' && !isRel) return false;
      if (statusFilter === 'FULLY_COLLECTED' && !isFull) return false;
      if (statusFilter === 'COLLECTING' && !isColl) return false;
    }

    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#f7f9ff] text-[#071d2e] pt-20 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header Section matching Image 10 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#071d2e] flex items-center gap-3">
            Your Groups
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-[#d8eaff] text-[#0047ab] border border-[#c3c6d5]/30">
              {address ? shortenAddress(address) : '0x1234...abcd'}
            </span>
          </h1>
          <p className="text-sm text-[#434653] mt-1">
            Manage and track your shared financial pools.
          </p>
        </div>

        <Link
          to="/create-group"
          className="bg-[#0047ab] text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl hover:bg-[#00327d] transition-all shadow-xs flex items-center gap-2 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          Create New Group
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#c3c6d5]/25 shadow-xs mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737784]" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f7f9ff] border border-[#c3c6d5]/40 rounded-xl text-xs text-[#071d2e] focus:outline-none focus:border-[#0047ab]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Token Pills */}
          <div className="flex bg-[#edf4ff] p-1 rounded-xl text-xs font-semibold text-[#434653]">
            <button
              onClick={() => setTokenFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                tokenFilter === 'ALL' ? 'bg-white text-[#0047ab] shadow-xs' : 'hover:text-[#00327d]'
              }`}
            >
              All Tokens
            </button>
            <button
              onClick={() => setTokenFilter('USDC')}
              className={`px-3 py-1 rounded-lg transition-all ${
                tokenFilter === 'USDC' ? 'bg-white text-[#0047ab] shadow-xs' : 'hover:text-[#00327d]'
              }`}
            >
              USDC
            </button>
            <button
              onClick={() => setTokenFilter('EURC')}
              className={`px-3 py-1 rounded-lg transition-all ${
                tokenFilter === 'EURC' ? 'bg-white text-[#0047ab] shadow-xs' : 'hover:text-[#00327d]'
              }`}
            >
              EURC
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex bg-[#edf4ff] p-1 rounded-xl text-xs font-semibold text-[#434653]">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-[#0047ab] shadow-xs' : 'hover:text-[#00327d]'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('COLLECTING')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'COLLECTING' ? 'bg-white text-[#0047ab] shadow-xs' : 'hover:text-[#00327d]'
              }`}
            >
              Collecting
            </button>
            <button
              onClick={() => setStatusFilter('FULLY_COLLECTED')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'FULLY_COLLECTED' ? 'bg-white text-[#0047ab] shadow-xs' : 'hover:text-[#00327d]'
              }`}
            >
              Full
            </button>
          </div>
        </div>
      </div>

      {/* Groups Grid matching Image 10 */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map((group, index) => {
            const tokenSymbol = group.token === Token.EURC ? 'EURC' : 'USDC';
            const cycle = group.activeCycle;
            const isReleased = cycle?.isReleased || (!cycle && group.pastCycles && group.pastCycles.length > 0);
            const isFullyCollected = cycle && cycle.totalCollected >= cycle.totalExpected;

            let statusLabel = 'COLLECTING';
            let statusBg = 'bg-[#0047ab]/10 text-[#0047ab] border-[#0047ab]/20';

            if (isReleased) {
              statusLabel = 'RELEASED';
              statusBg = 'bg-[#c3c6d5]/30 text-[#434653] border-[#c3c6d5]/40';
            } else if (isFullyCollected) {
              statusLabel = 'FULLY COLLECTED';
              statusBg = 'bg-[#baeaff] text-[#003c4d] border-[#8ad0ed]/40';
            }

            const totalColl = cycle ? cycle.totalCollected : group.pastCycles?.[0]?.totalCollected || 0n;
            const totalExp = cycle ? cycle.totalExpected : group.pastCycles?.[0]?.totalExpected || 1000000000n;
            const progressPct = Math.min(100, Math.round((Number(totalColl) / (Number(totalExp) || 1)) * 100));

            return (
              <motion.div
                key={group.id.toString()}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => navigate(`/group/${group.id}`)}
                className={`bg-white rounded-2xl p-6 border border-[#c3c6d5]/25 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                  isReleased ? 'opacity-85' : ''
                }`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#071d2e] group-hover:text-[#0047ab] transition-colors flex items-center gap-2">
                        {group.name}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#0047ab]" />
                      </h3>
                      <p className="text-xs text-[#434653] font-medium flex items-center gap-1.5 mt-1">
                        <Users className="w-3.5 h-3.5" /> {group.totalMembers || group.members.length} Members
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-block px-2.5 py-1 bg-[#d0e5fc]/60 text-[#071d2e] text-[11px] font-bold rounded uppercase border border-[#c3c6d5]/30">
                        {tokenSymbol}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded uppercase border ${statusBg}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Amount Row */}
                <div className="pt-4 border-t border-[#c3c6d5]/15 mt-4">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#434653]">
                      {isReleased ? 'Distributed' : 'Progress'}
                    </span>
                    <span className="text-[#0047ab] font-mono">
                      {isReleased
                        ? `${formatTokenAmount(totalExp)} ${tokenSymbol}`
                        : `${formatTokenAmount(totalColl)} / ${formatTokenAmount(totalExp)} ${tokenSymbol}`}
                    </span>
                  </div>

                  <div className="w-full bg-[#d0e5fc]/40 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isReleased ? 'bg-[#737784]' : isFullyCollected ? 'bg-[#003c4d]' : 'bg-[#0047ab]'
                      }`}
                      style={{ width: `${isReleased ? 100 : progressPct}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-3xl border border-[#c3c6d5]/25 shadow-xs px-6">
          <div className="w-20 h-20 rounded-full bg-[#edf4ff] text-[#0047ab] flex items-center justify-center mb-4">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-[#071d2e] mb-2">
            You're not in any groups yet
          </h3>
          <p className="text-sm text-[#434653] max-w-md mb-6 leading-relaxed">
            Start a new pool to share expenses effortlessly with friends, family, or colleagues.
          </p>
          <Link
            to="/create-group"
            className="bg-[#0047ab] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#00327d] transition-all shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create a Group
          </Link>
        </div>
      )}
    </div>
  );
};
