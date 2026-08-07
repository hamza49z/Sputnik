import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGroups } from '../context/GroupContext';
import { OrbitalAnimation } from '../components/OrbitalAnimation';
import { formatTokenAmount } from '../config/contract';
import {
  UserPlus,
  PieChart,
  PlayCircle,
  CheckCircle,
  ShieldCheck,
  Clock,
  Coins,
  ChevronDown,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { stats } = useGroups();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      q: 'Can members pay different amounts?',
      a: 'Yes! Unlike rigid equal-split apps, Sputnik lets the group creator configure custom individual share amounts per cycle. Whether split 50/50, 70/30, or custom fixed amounts, each member pays only their designated share.',
    },
    {
      q: 'What happens if someone pays late?',
      a: 'Members can still contribute after the cycle deadline passes. The smart contract automatically flags late contributions on-chain (isLate = true) for total group transparency, without imposing harsh punitive financial penalties.',
    },
    {
      q: 'Who decides who receives the funds?',
      a: 'The group creator selects the designated recipient (payer) when starting each collection cycle. This makes Sputnik ideal for recurring bills like rent, shared utility bills, group travel, or party funds.',
    },
    {
      q: 'Can I start a new cycle before the last one finishes?',
      a: 'No. To ensure safety and avoid accounting overlaps, the smart contract strictly enforces that a new collection cycle can only be started once the previous cycle has reached 100% collection and released its funds.',
    },
    {
      q: 'What currencies are supported?',
      a: 'Sputnik currently supports USDC and EURC stablecoins on Arc Testnet, ensuring stable 1:1 value transfers without volatility risks.',
    },
  ];

  const roadmapPhases = [
    {
      phase: 'Phase 1 — Testnet Launch (Current)',
      desc: 'Core contract live on Arc Testnet, custom per-member shares, creator-controlled cycles with designated payers, automatic release on full collection, transparent late-payment flagging.',
      status: 'Live on Arc',
      active: true,
    },
    {
      phase: 'Phase 2 — Reminders & Notifications',
      desc: 'Deadline reminder notifications for members who haven’t yet contributed, optional recurring-deadline templates to speed up starting new cycles.',
      status: 'In Development',
      active: false,
    },
    {
      phase: 'Phase 3 — Flexible Payer Rotation',
      desc: 'Optional automatic round-robin payer rotation as a convenience alongside manual selection, group-level cycle history analytics.',
      status: 'Planned',
      active: false,
    },
    {
      phase: 'Phase 4 — Mainnet & Multi-Currency',
      desc: 'Mainnet deployment, expanded stablecoin support beyond USDC/EURC, gas-optimized batch transactions.',
      status: 'Planned',
      active: false,
    },
    {
      phase: 'Phase 5 — Group Templates & Discovery',
      desc: 'Pre-built templates for common recurring costs (rent, subscriptions, utilities), optional group insights across a wallet’s full contribution history.',
      status: 'Planned',
      active: false,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f7f9ff] text-[#071d2e] pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16 min-h-[600px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e3efff] text-[#0047ab] text-xs font-bold mb-6 border border-[#0047ab]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deployed on Arc Testnet</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#071d2e] tracking-tight leading-tight mb-6">
            Recurring Group Costs, <br />
            <span className="text-[#0047ab]">Handled Fairly</span>
          </h1>

          <p className="text-lg md:text-xl text-[#434653] leading-relaxed mb-8 max-w-lg">
            Set custom shares, collect on a deadline, and release funds automatically once everyone's paid.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/create-group"
              className="inline-flex items-center justify-center gap-2 h-13 px-8 text-sm font-bold text-white bg-[#0047ab] hover:bg-[#00327d] rounded-xl shadow-sm transition-all duration-200 active:scale-98"
            >
              Create a Group
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/groups"
              className="inline-flex items-center justify-center h-13 px-8 text-sm font-bold text-[#00327d] bg-white hover:bg-[#edf4ff] border border-[#0047ab]/30 rounded-xl transition-all duration-200"
            >
              View My Groups
            </Link>
          </div>
        </motion.div>

        {/* Right Interactive Orbital Animation Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[380px] md:h-[460px] w-full bg-white/60 backdrop-blur-sm border border-[#c3c6d5]/20 rounded-3xl p-4 shadow-sm overflow-hidden"
        >
          <OrbitalAnimation className="w-full h-full" />
        </motion.div>
      </section>

      {/* Platform Live Stats Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 my-4 border-y border-[#c3c6d5]/25 bg-white/40 backdrop-blur-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#c3c6d5]/20">
          <div className="pt-4 md:pt-0">
            <p className="text-xs font-bold text-[#434653] uppercase tracking-widest mb-2">
              Active Groups
            </p>
            <p className="text-4xl font-extrabold text-[#00327d] font-mono">
              {Number(stats.activeGroups).toLocaleString()}
            </p>
          </div>

          <div className="pt-4 md:pt-0">
            <p className="text-xs font-bold text-[#434653] uppercase tracking-widest mb-2">
              Cycles Completed
            </p>
            <p className="text-4xl font-extrabold text-[#00327d] font-mono">
              {Number(stats.cyclesCompleted).toLocaleString()}
            </p>
          </div>

          <div className="pt-4 md:pt-0">
            <p className="text-xs font-bold text-[#434653] uppercase tracking-widest mb-2">
              Total Collected
            </p>
            <p className="text-4xl font-extrabold text-[#00327d] font-mono">
              ${formatTokenAmount(stats.totalCollected)} USDC
            </p>
          </div>
        </div>
      </section>

      {/* How Sputnik Works Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16" id="how-it-works">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#071d2e] tracking-tight">
            How Sputnik Works
          </h2>
          <p className="text-[#434653] mt-2 max-w-xl mx-auto">
            Zero friction shared-expense management built for maximum fairness and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl border border-[#c3c6d5]/25 shadow-xs text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#e3efff] text-[#0047ab] flex items-center justify-center mb-4">
              <UserPlus className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-[#071d2e] mb-2">
              1. Create Group & Add Members
            </h3>
            <p className="text-xs text-[#434653] leading-relaxed">
              Invite your team or housemates securely using their wallet addresses.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl border border-[#c3c6d5]/25 shadow-xs text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#e3efff] text-[#0047ab] flex items-center justify-center mb-4">
              <PieChart className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-[#071d2e] mb-2">
              2. Set Custom Shares
            </h3>
            <p className="text-xs text-[#434653] leading-relaxed">
              Allocate exact per-member amounts for custom split requirements.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl border border-[#c3c6d5]/25 shadow-xs text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#e3efff] text-[#0047ab] flex items-center justify-center mb-4">
              <PlayCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-[#071d2e] mb-2">
              3. Start a Cycle
            </h3>
            <p className="text-xs text-[#434653] leading-relaxed">
              Initiate the collection period with a designated recipient and strict deadline.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl border border-[#c3c6d5]/25 shadow-xs text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#baeaff] text-[#003c4d] flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-[#071d2e] mb-2">
              4. Auto-Release
            </h3>
            <p className="text-xs text-[#434653] leading-relaxed">
              Funds release automatically to the recipient the instant 100% is collected.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Fairness & Transparency Explainer */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-gradient-to-br from-[#00327d] to-[#0047ab] text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#baeaff] text-xs font-semibold mb-4 border border-white/10">
              <ShieldCheck className="w-4 h-4" />
              <span>Built for Absolute Transparency</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
              On-Chain Fairness Guarantee
            </h2>

            <p className="text-sm md:text-base text-[#a5bdff] leading-relaxed mb-6">
              Sputnik removes social awkwardness from shared expenses. Group creators set exact shares, members pay directly on-chain, and late payments are logged transparently without financial penalties.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
                <p className="font-bold text-white mb-1">Flexible Allocation</p>
                <p className="text-[#a5bdff]">Supports unequal shares per member.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
                <p className="font-bold text-white mb-1">Late Flagging</p>
                <p className="text-[#a5bdff]">Transparent status without harsh fines.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
                <p className="font-bold text-white mb-1">Automatic Payout</p>
                <p className="text-[#a5bdff]">Instant release upon full collection.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#071d2e] tracking-tight">
            Product Roadmap
          </h2>
          <p className="text-[#434653] mt-2">
            Our staged journey to multi-chain recurring expense management.
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {roadmapPhases.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${
                item.active
                  ? 'bg-white border-[#0047ab] shadow-sm ring-1 ring-[#0047ab]/20'
                  : 'bg-white/60 border-[#c3c6d5]/25 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="font-bold text-base text-[#071d2e]">
                  {item.phase}
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    item.active
                      ? 'bg-[#0047ab]/10 text-[#0047ab] border-[#0047ab]/20'
                      : 'bg-[#edf4ff] text-[#434653] border-[#c3c6d5]/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#434653] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-12" id="faq">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#071d2e] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#c3c6d5]/25 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-[#071d2e] hover:text-[#0047ab] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#434653] transition-transform duration-200 shrink-0 ${
                    openFaqIndex === idx ? 'rotate-180 text-[#0047ab]' : ''
                  }`}
                />
              </button>

              {openFaqIndex === idx && (
                <div className="px-5 pb-5 text-xs md:text-sm text-[#434653] leading-relaxed border-t border-[#c3c6d5]/15 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
