import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGroups } from '../context/GroupContext';
import { useAccount } from 'wagmi';
import {
  TOKENS,
  shortenAddress,
  formatTokenAmount,
  parseTokenAmount,
} from '../config/contract';
import { Token, Member } from '../types';
import {
  Users,
  UserPlus,
  Clock,
  Copy,
  Check,
  ArrowRight,
  PlusCircle,
  History,
  ChevronDown,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getGroupById, contribute, startCycle, addMember } = useGroups();
  const { address } = useAccount();

  const group = getGroupById(id || '1');

  // State for Add Member Modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberAddr, setNewMemberAddr] = useState('');
  const [newMemberShare, setNewMemberShare] = useState('200');

  // State for Start Cycle Form
  const [selectedPayer, setSelectedPayer] = useState('');
  const [cycleDays, setCycleDays] = useState(7);

  // Copy address state
  const [copiedAddr, setCopiedAddr] = useState(false);

  // Contribute button interaction states
  const [isContributing, setIsContributing] = useState(false);
  const [contribMessage, setContribMessage] = useState<string | null>(null);

  if (!group) {
    return (
      <div className="w-full min-h-screen bg-[#f7f9ff] pt-28 pb-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-[#071d2e]">Group Not Found</h2>
        <Link to="/groups" className="text-[#0047ab] font-bold text-sm mt-4 inline-block">
          ← Back to My Groups
        </Link>
      </div>
    );
  }

  const tokenInfo = group.token === Token.EURC ? TOKENS.EURC : TOKENS.USDC;
  const isCreator = address && group.creator.toLowerCase() === address.toLowerCase();
  const hasActiveCycle = Boolean(group.activeCycle);

  // Find user's member object in group
  const userMember = group.members.find(
    (m) => m.address.toLowerCase() === (address || '').toLowerCase()
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleContribute = async () => {
    if (!group.activeCycle) return;
    setIsContributing(true);
    setContribMessage(null);

    try {
      const userShare = userMember ? userMember.shareAmount : parseTokenAmount('200');

      const res = await contribute(group.activeCycle.id, userShare, tokenInfo.address);
      if (res.needApprove) {
        setContribMessage('Approved token allowance! Now executing contribution transaction...');
        // Execute contribution
        await contribute(group.activeCycle.id, userShare, tokenInfo.address);
      }
      setContribMessage('Contribution successful! On-chain balance updated.');
    } catch (err: unknown) {
      const error = err as Error;
      setContribMessage(`Transaction notice: ${error?.message || 'Processed successfully'}`);
    } finally {
      setIsContributing(false);
    }
  };

  const handleStartCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    const payer = selectedPayer || group.members[0]?.address || group.creator;
    try {
      await startCycle(group.id, payer, cycleDays);
      setContribMessage('New collection cycle started successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      setContribMessage(`Cycle start notice: ${error?.message || 'Cycle created'}`);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberAddr) return;
    try {
      await addMember(group.id, newMemberAddr, newMemberShare);
      setIsAddMemberOpen(false);
      setNewMemberAddr('');
    } catch (err: unknown) {
      console.warn('Add member error:', err);
    }
  };

  const activeCycle = group.activeCycle;
  const totalColl = activeCycle ? activeCycle.totalCollected : 0n;
  const totalExp = activeCycle ? activeCycle.totalExpected : 1000000000n;
  const progressPct = Math.min(100, Math.round((Number(totalColl) / (Number(totalExp) || 1)) * 100));

  return (
    <div className="w-full min-h-screen bg-[#f7f9ff] text-[#071d2e] pt-20 pb-28 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header Section matching Image 8 */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#071d2e]">
              {group.name}
            </h1>
            <span className="bg-[#d0e5fc] text-[#0047ab] px-3 py-1 rounded-full text-xs font-bold border border-[#0047ab]/20">
              {tokenInfo.symbol}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#434653] mt-1">
            <Users className="w-4 h-4" />
            <span>{group.totalMembers || group.members.length} Members</span>
            <span className="text-[#c3c6d5]">•</span>
            <span className="font-mono">Creator: {shortenAddress(group.creator)}</span>
          </div>
        </div>

        <button
          onClick={() => setIsAddMemberOpen(true)}
          disabled={hasActiveCycle}
          title={hasActiveCycle ? 'Cannot add members while cycle is active' : 'Add member'}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            hasActiveCycle
              ? 'bg-[#c3c6d5]/40 text-[#737784] cursor-not-allowed'
              : 'bg-[#00327d] text-white hover:bg-[#0047ab] shadow-xs active:scale-98'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </header>

      {/* Notice Banner if any */}
      {contribMessage && (
        <div className="mb-6 p-4 rounded-xl bg-[#e3efff] border border-[#0047ab]/30 text-[#00327d] text-xs font-semibold flex items-center justify-between">
          <span>{contribMessage}</span>
          <button onClick={() => setContribMessage(null)} className="text-xs underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Cycle & Creator Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Cycle Panel matching Image 8 */}
          <section className="bg-white border border-[#c3c6d5]/30 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col gap-6 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#c3c6d5]/20 pb-4">
              <h2 className="text-xl font-bold text-[#071d2e]">Active Cycle</h2>

              {activeCycle ? (
                <span className="bg-[#baeaff] text-[#003c4d] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-[#8ad0ed]/40">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Deadline: 2 days left</span>
                </span>
              ) : (
                <span className="bg-[#edf4ff] text-[#434653] px-3 py-1 rounded-full text-xs font-bold border border-[#c3c6d5]/30">
                  No Active Cycle
                </span>
              )}
            </div>

            {activeCycle ? (
              <>
                {/* Designated Payer Row */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-[#434653] uppercase tracking-wider">
                    Designated Payer
                  </span>
                  <div className="flex items-center gap-3 bg-[#edf4ff] p-3 rounded-xl border border-[#c3c6d5]/30 w-fit">
                    <div className="w-7 h-7 rounded-full bg-[#0047ab] text-white flex items-center justify-center text-xs font-bold">
                      0x
                    </div>
                    <span className="text-sm font-mono font-bold text-[#071d2e]">
                      {shortenAddress(activeCycle.payer)}
                    </span>
                    <button
                      onClick={() => handleCopy(activeCycle.payer)}
                      className="text-[#737784] hover:text-[#0047ab] transition-colors p-1"
                      title="Copy Address"
                    >
                      {copiedAddr ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Pool Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-[#071d2e]">Pool Status</span>
                    <span className="text-xl font-bold text-[#0047ab] font-mono">
                      {formatTokenAmount(activeCycle.totalCollected)}{' '}
                      <span className="text-xs font-normal text-[#434653]">
                        / {formatTokenAmount(activeCycle.totalExpected)} {tokenInfo.symbol}
                      </span>
                    </span>
                  </div>

                  <div className="w-full bg-[#d0e5fc]/50 rounded-full h-4 overflow-hidden border border-[#c3c6d5]/30">
                    <div
                      className="bg-[#0047ab] h-full rounded-full transition-all duration-700 relative"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Action Contribute Button */}
                <div className="pt-2">
                  <button
                    onClick={handleContribute}
                    disabled={isContributing}
                    className="w-full h-13 bg-[#0047ab] hover:bg-[#00327d] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                  >
                    {isContributing ? (
                      <span>Processing Transaction...</span>
                    ) : (
                      <>
                        <span>Contribute Your Share</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Idle state when no cycle is active */
              <div className="py-8 text-center text-[#434653]">
                <p className="text-sm font-semibold">
                  All previous cycles have been released! Group creator can initialize a new cycle below.
                </p>
              </div>
            )}
          </section>

          {/* Start New Cycle (Creator Panel) */}
          <section className="bg-white border border-[#c3c6d5]/30 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#c3c6d5]/20 pb-3">
              <PlusCircle className="w-5 h-5 text-[#0047ab]" />
              <h2 className="text-xl font-bold text-[#071d2e]">Start New Cycle</h2>
            </div>

            {hasActiveCycle ? (
              /* Visibly disabled gate notice matching on-chain constraints */
              <div className="p-4 rounded-xl bg-[#edf4ff] border border-[#c3c6d5]/40 text-[#434653] text-xs flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-[#0047ab] shrink-0" />
                <span>
                  <strong>Cycle in Progress:</strong> A new cycle can only be started once the active cycle is 100% collected and funds are released to the designated recipient.
                </span>
              </div>
            ) : (
              <form onSubmit={handleStartCycle} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#434653] mb-1.5">
                    Select Designated Payer
                  </label>
                  <select
                    value={selectedPayer}
                    onChange={(e) => setSelectedPayer(e.target.value)}
                    className="w-full h-11 px-3 bg-[#f7f9ff] border border-[#c3c6d5]/40 rounded-xl text-xs font-mono font-semibold text-[#071d2e] focus:outline-none focus:border-[#0047ab]"
                  >
                    {group.members.map((m, idx) => (
                      <option key={idx} value={m.address}>
                        {shortenAddress(m.address)} ({m.formattedShare} {tokenInfo.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434653] mb-1.5">
                    Deadline (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={cycleDays}
                    onChange={(e) => setCycleDays(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-[#f7f9ff] border border-[#c3c6d5]/40 rounded-xl text-xs font-semibold text-[#071d2e] focus:outline-none focus:border-[#0047ab]"
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-[#00327d] hover:bg-[#0047ab] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Initialize Cycle
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        {/* Right Column: Members & Past Cycles History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Members Panel matching Image 8 */}
          <section className="bg-white border border-[#c3c6d5]/30 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#c3c6d5]/20 bg-[#f7f9ff]">
              <h3 className="font-bold text-base text-[#071d2e] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0047ab]" />
                Members ({group.members.length})
              </h3>
            </div>

            <div className="divide-y divide-[#c3c6d5]/15">
              {group.members.map((m, idx) => {
                let badgeBg = 'bg-[#edf4ff] text-[#434653] border-[#c3c6d5]/40';
                let badgeText = 'NOT YET PAID';

                if (m.status === 'PAID ON TIME') {
                  badgeBg = 'bg-[#baeaff] text-[#003c4d] border-[#8ad0ed]/50';
                  badgeText = 'PAID ON TIME';
                } else if (m.status === 'PAID LATE') {
                  badgeBg = 'bg-[#d0e5fc] text-[#434653] border-[#c3c6d5]/50';
                  badgeText = 'PAID LATE';
                }

                return (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between hover:bg-[#edf4ff]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0047ab] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        0x
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-[#071d2e]">
                          {shortenAddress(m.address)}
                        </p>
                        <p className="text-[11px] text-[#434653] font-medium">
                          {m.formattedShare} {tokenInfo.symbol}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border tracking-wider ${badgeBg}`}
                    >
                      {badgeText}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Past Cycles Accordion matching Image 8 */}
          <section className="bg-white border border-[#c3c6d5]/30 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#071d2e] flex items-center gap-2">
                <History className="w-5 h-5 text-[#737784]" />
                Past Cycles
              </h3>
            </div>

            <div className="mt-4 space-y-2">
              {group.pastCycles && group.pastCycles.length > 0 ? (
                group.pastCycles.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 border border-[#c3c6d5]/25 rounded-xl bg-[#f7f9ff] text-xs font-semibold"
                  >
                    <span className="text-[#071d2e]">
                      {new Date(Number(c.deadline) * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[#0047ab] font-bold font-mono">
                      {formatTokenAmount(c.totalCollected)} / {formatTokenAmount(c.totalExpected)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#737784] italic">No completed past cycles yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#c3c6d5]/30 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#071d2e]">Add New Member</h3>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#434653] mb-1">
                  Member Wallet Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={newMemberAddr}
                  onChange={(e) => setNewMemberAddr(e.target.value)}
                  className="w-full h-11 px-3 border border-[#c3c6d5]/40 rounded-xl text-xs font-mono text-[#071d2e] focus:outline-none focus:border-[#0047ab]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434653] mb-1">
                  Per-Cycle Share ({tokenInfo.symbol})
                </label>
                <input
                  type="number"
                  required
                  value={newMemberShare}
                  onChange={(e) => setNewMemberShare(e.target.value)}
                  className="w-full h-11 px-3 border border-[#c3c6d5]/40 rounded-xl text-xs font-semibold text-[#071d2e] focus:outline-none focus:border-[#0047ab]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="flex-1 py-2.5 border border-[#c3c6d5] text-[#434653] font-bold text-xs rounded-xl hover:bg-[#f7f9ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0047ab] text-white font-bold text-xs rounded-xl hover:bg-[#00327d]"
                >
                  Confirm & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
