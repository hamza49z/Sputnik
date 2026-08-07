import React from 'react';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#1e3244] text-[#e8f2ff] py-8 px-4 md:px-8 mt-auto border-t border-[#434653]/30 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Creator Brand with Sky-Blue Glow Effect */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <span className="text-sm font-semibold text-[#e8f2ff] tracking-wide">
            Built by <span className="font-bold text-[#baeaff] group-hover:text-white transition-colors duration-300">Hamza</span>
          </span>
          <div className="p-1 rounded-full bg-[#8ad0ed]/10 text-[#8ad0ed] group-hover:text-white group-hover:shadow-[0_0_12px_rgba(138,208,237,0.8)] transition-all duration-300">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Disclaimer & Network Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#c3c6d5]">
          <span>Sputnik is an independent project built on</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0047ab]/30 text-[#baeaff] border border-[#82c8e5]/30 shadow-xs">
            Arc Testnet
          </span>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-6 text-xs text-[#c3c6d5]">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#baeaff] transition-colors"
          >
            Twitter
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#baeaff] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#baeaff] transition-colors"
          >
            Discord
          </a>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#baeaff] transition-colors"
          >
            ArcScan
          </a>
        </div>
      </div>
    </footer>
  );
};
