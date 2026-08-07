import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGroups } from '../context/GroupContext';
import { useAccount } from 'wagmi';
import { Token } from '../types';
import { TOKENS, shortenAddress, DEPLOYER_ADDRESS } from '../config/contract';
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PieChart,
} from 'lucide-react';

export const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const { createGroup } = useGroups();
  const { address } = useAccount();

  const [step, setStep] = useState<number>(1);

  // Step 1 State
  const [groupName, setGroupName] = useState('');
  const [token, setToken] = useState<Token>(Token.USDC);

  // Step 2 State (Members)
  const creatorAddress = address || DEPLOYER_ADDRESS;
  const [members, setMembers] = useState<string[]>([creatorAddress]);
  const [newMemberInput, setNewMemberInput] = useState('');

  // Step 3 State (Per-member shares)
  const [shares, setShares] = useState<Record<string, string>>({
    [creatorAddress]: '200',
  });

  const [isDeploying, setIsDeploying] = useState(false);

  const handleAddMember = () => {
    if (!newMemberInput || members.includes(newMemberInput)) return;
    const updated = [...members, newMemberInput];
    setMembers(updated);
    setShares((prev) => ({ ...prev, [newMemberInput]: '200' }));
    setNewMemberInput('');
  };

  const handleRemoveMember = (addrToRemove: string) => {
    if (addrToRemove.toLowerCase() === creatorAddress.toLowerCase()) return; // cannot remove creator
    setMembers(members.filter((m) => m !== addrToRemove));
  };

  const handleShareChange = (addr: string, val: string) => {
    setShares((prev) => ({ ...prev, [addr]: val }));
  };

  const calculateTotalExpected = () => {
    return members.reduce((sum, m) => sum + (Number(shares[m]) || 0), 0);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const formattedMembers = members.map((m) => ({
        address: m,
        shareAmount: shares[m] || '200',
      }));

      const newGroupId = await createGroup(groupName, token, formattedMembers);
      navigate(`/group/${newGroupId}`);
    } catch (err: unknown) {
      console.warn('Deployment error:', err);
      navigate('/groups');
    } finally {
      setIsDeploying(false);
    }
  };

  const tokenSymbol = token === Token.EURC ? 'EURC' : 'USDC';

  return (
    <div className="w-full min-h-screen bg-[#f7f9ff] text-[#071d2e] pt-20 pb-28 px-4 md:px-8 max-w-3xl mx-auto">
      {/* Title Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#071d2e]">Create New Group</h1>
        <p className="text-sm text-[#434653] mt-1">
          Set up a recurring expense pool on Arc Testnet in 4 simple steps.
        </p>
      </div>

      {/* Top Stepper Indicator */}
      <div className="flex items-center justify-between mb-8 px-2 max-w-xl mx-auto">
        {[
          { num: 1, label: 'Details' },
          { num: 2, label: 'Members' },
          { num: 3, label: 'Shares' },
          { num: 4, label: 'Review' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                  step === s.num
                    ? 'bg-[#0047ab] text-white shadow-xs scale-110'
                    : step > s.num
                    ? 'bg-[#d0e5fc] text-[#0047ab]'
                    : 'bg-[#c3c6d5]/30 text-[#737784]'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className="text-[11px] font-bold text-[#434653]">{s.label}</span>
            </div>
            {idx < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                  step > s.num ? 'bg-[#0047ab]' : 'bg-[#c3c6d5]/30'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Wizard Form Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#c3c6d5]/25 shadow-sm min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-[#434653] mb-2 uppercase tracking-wider">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Rent, Summer Trip, Office Snacks"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full h-13 px-4 border border-[#c3c6d5]/40 rounded-xl text-sm font-semibold text-[#071d2e] focus:outline-none focus:border-[#0047ab] bg-[#f7f9ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434653] mb-2 uppercase tracking-wider">
                  Primary Currency
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setToken(Token.USDC)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      token === Token.USDC
                        ? 'border-[#0047ab] bg-[#edf4ff] ring-1 ring-[#0047ab]'
                        : 'border-[#c3c6d5]/30 hover:border-[#0047ab]/50'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-sm text-[#071d2e]">USDC</p>
                      <p className="text-xs text-[#434653]">USD Coin on Arc</p>
                    </div>
                    {token === Token.USDC && <Sparkles className="w-5 h-5 text-[#0047ab]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setToken(Token.EURC)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      token === Token.EURC
                        ? 'border-[#0047ab] bg-[#edf4ff] ring-1 ring-[#0047ab]'
                        : 'border-[#c3c6d5]/30 hover:border-[#0047ab]/50'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-sm text-[#071d2e]">EURC</p>
                      <p className="text-xs text-[#434653]">Euro Coin on Arc</p>
                    </div>
                    {token === Token.EURC && <Sparkles className="w-5 h-5 text-[#0047ab]" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Members */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-[#434653] mb-2 uppercase tracking-wider">
                  Add Member Wallet Addresses
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={newMemberInput}
                    onChange={(e) => setNewMemberInput(e.target.value)}
                    className="flex-1 h-12 px-4 border border-[#c3c6d5]/40 rounded-xl text-xs font-mono text-[#071d2e] focus:outline-none focus:border-[#0047ab] bg-[#f7f9ff]"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-5 bg-[#0047ab] hover:bg-[#00327d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-[#434653]">Current Group Members ({members.length}):</p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-[#f7f9ff] border border-[#c3c6d5]/25 rounded-xl text-xs font-mono"
                    >
                      <span className="font-bold text-[#071d2e]">
                        {shortenAddress(m)} {m.toLowerCase() === creatorAddress.toLowerCase() ? '(Creator)' : ''}
                      </span>
                      {m.toLowerCase() !== creatorAddress.toLowerCase() && (
                        <button
                          onClick={() => handleRemoveMember(m)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Shares */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#434653] uppercase tracking-wider">
                    Set Individual Contribution Share ({tokenSymbol})
                  </label>
                  <span className="text-xs font-bold text-[#0047ab] font-mono">
                    Total: {calculateTotalExpected()} {tokenSymbol}
                  </span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[#f7f9ff] border border-[#c3c6d5]/25 rounded-xl gap-4"
                    >
                      <span className="text-xs font-mono font-bold text-[#071d2e] shrink-0">
                        {shortenAddress(m)}
                      </span>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={shares[m] || ''}
                          onChange={(e) => handleShareChange(m, e.target.value)}
                          className="w-28 h-10 px-3 border border-[#c3c6d5]/40 rounded-lg text-xs font-bold text-right text-[#071d2e] focus:outline-none focus:border-[#0047ab] bg-white"
                        />
                        <span className="text-xs font-bold text-[#434653]">{tokenSymbol}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-[#edf4ff] p-6 rounded-2xl border border-[#c3c6d5]/30 space-y-4">
                <div className="flex justify-between items-center border-b border-[#c3c6d5]/20 pb-3">
                  <div>
                    <h3 className="font-extrabold text-xl text-[#071d2e]">{groupName || 'Untitled Group'}</h3>
                    <p className="text-xs text-[#434653]">Token: {tokenSymbol}</p>
                  </div>
                  <span className="bg-[#0047ab] text-white px-3 py-1 rounded-full text-xs font-bold font-mono">
                    {calculateTotalExpected()} {tokenSymbol} / Cycle
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#434653] mb-2">Members & Custom Shares:</p>
                  <div className="space-y-1.5">
                    {members.map((m, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-mono">
                        <span className="text-[#071d2e]">{shortenAddress(m)}</span>
                        <span className="font-bold text-[#0047ab]">
                          {shares[m] || '0'} {tokenSymbol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center pt-8 border-t border-[#c3c6d5]/15 mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 border border-[#c3c6d5] text-[#434653] font-bold text-xs rounded-xl hover:bg-[#f7f9ff] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !groupName) return;
                setStep(step + 1);
              }}
              disabled={step === 1 && !groupName}
              className="px-6 py-2.5 bg-[#0047ab] hover:bg-[#00327d] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-8 py-3 bg-[#0047ab] hover:bg-[#00327d] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isDeploying ? 'Deploying to Arc...' : 'Deploy Group to Arc Testnet'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
