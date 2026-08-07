import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGroups } from '../context/GroupContext';
import { useAccount } from 'wagmi';
import { shortenAddress, formatTokenAmount } from '../config/contract';
import { Token } from '../types';
import { Receipt, Clock, CheckCircle, AlertTriangle, ArrowUpRight, Filter } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { contributions } = useGroups();
  const { address } = useAccount();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_TIME' | 'LATE'>('ALL');

  const filteredContributions = contributions.filter((c) => {
    if (statusFilter === 'ON_TIME' && c.isLate) return false;
    if (statusFilter === 'LATE' && !c.isLate) return false;
    return true;
  });

  const totalOnTime = contributions.filter((c) => !c.isLate).length;
  const totalLate = contributions.filter((c) => c.isLate).length;
  const totalSum = contributions.reduce((acc, c) => acc + c.amount, 0n);

  return (
    <div className="w-full min-h-screen bg-[#f7f9ff] text-[#071d2e] pt-20 pb-28 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Header Section matching Image 12 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#071d2e] flex items-center gap-3">
            Your Contributions
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-[#d8eaff] text-[#0047ab] border border-[#c3c6d5]/30">
              {address ? shortenAddress(address) : '0x1234...abcd'}
            </span>
          </h1>
          <p className="text-sm text-[#434653] mt-1">
            Chronological audit log of all your on-chain pool payments.
          </p>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-[#c3c6d5]/25 shadow-xs">
          <p className="text-xs font-bold text-[#434653] uppercase tracking-wider mb-2">
            Total Contributed
          </p>
          <p className="text-3xl font-extrabold text-[#00327d] font-mono">
            ${formatTokenAmount(totalSum)} <span className="text-xs font-normal text-[#434653]">USDC</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#c3c6d5]/25 shadow-xs">
          <p className="text-xs font-bold text-[#434653] uppercase tracking-wider mb-2">
            On-Time Payments
          </p>
          <p className="text-3xl font-extrabold text-teal-700 font-mono">
            {totalOnTime}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#c3c6d5]/25 shadow-xs">
          <p className="text-xs font-bold text-[#434653] uppercase tracking-wider mb-2">
            Late Payments
          </p>
          <p className="text-3xl font-extrabold text-amber-700 font-mono">
            {totalLate}
          </p>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex items-center justify-between mb-8 bg-white p-3 rounded-2xl border border-[#c3c6d5]/25 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#434653]">
          <Filter className="w-4 h-4 text-[#0047ab]" />
          <span>Filter Payments:</span>
        </div>

        <div className="flex bg-[#edf4ff] p-1 rounded-xl text-xs font-semibold text-[#434653]">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'ALL' ? 'bg-white text-[#0047ab] shadow-xs font-bold' : 'hover:text-[#00327d]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('ON_TIME')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'ON_TIME' ? 'bg-white text-[#0047ab] shadow-xs font-bold' : 'hover:text-[#00327d]'
            }`}
          >
            On-Time
          </button>
          <button
            onClick={() => setStatusFilter('LATE')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'LATE' ? 'bg-white text-[#0047ab] shadow-xs font-bold' : 'hover:text-[#00327d]'
            }`}
          >
            Late
          </button>
        </div>
      </div>

      {/* Chronological Timeline matching Image 12 */}
      <div className="relative pl-6 border-l-2 border-[#c3c6d5]/30 space-y-6">
        {filteredContributions.map((c, index) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="relative bg-white p-5 rounded-2xl border border-[#c3c6d5]/25 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Timeline Dot */}
            <div
              className={`absolute -left-[31px] top-6 w-4 h-4 rounded-full border-2 bg-white ${
                c.isLate ? 'border-amber-500' : 'border-[#0047ab]'
              }`}
            />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-base text-[#071d2e]">{c.groupName}</h3>
                <span className="text-xs text-[#737784] font-mono">Cycle #{c.cycleId.toString()}</span>
              </div>
              <p className="text-xs text-[#434653] font-medium">{c.date}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono font-extrabold text-base text-[#00327d]">
                +{formatTokenAmount(c.amount)} {c.token === Token.EURC ? 'EURC' : 'USDC'}
              </span>

              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  c.isLate
                    ? 'bg-amber-100/60 text-amber-800 border-amber-300'
                    : 'bg-[#baeaff] text-[#003c4d] border-[#8ad0ed]/50'
                }`}
              >
                {c.isLate ? 'PAID LATE' : 'PAID ON TIME'}
              </span>

              <a
                href={`https://testnet.arcscan.app/tx/${c.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#737784] hover:text-[#0047ab] transition-colors p-1"
                title="View on ArcScan"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
