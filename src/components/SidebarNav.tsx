import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../config/contract';
import { LayoutDashboard, Users, Receipt, Settings, Plus, Home, Wallet, User as UserIcon } from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const location = useLocation();
  const { address } = useAccount();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] p-6 w-64 bg-[#edf4ff]/80 backdrop-blur-md border-r border-[#c3c6d5]/20 z-30">
      {/* Connected User Profile Card */}
      <div className="flex flex-col items-center mb-8 p-4 bg-white/70 rounded-2xl border border-[#c3c6d5]/20 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[#0047ab] flex items-center justify-center text-white mb-2 shadow-xs">
          <UserIcon className="w-7 h-7" />
        </div>
        <h2 className="font-bold text-lg text-[#00327d]">
          {address ? 'Hamza' : 'Guest Wallet'}
        </h2>
        <p className="text-xs text-[#434653] font-mono mt-0.5">
          {address ? shortenAddress(address) : '0x1234...abcd'}
        </p>
      </div>

      {/* Navigation Nav Items */}
      <nav className="flex-1 flex flex-col gap-2">
        <Link
          to="/"
          className={`flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-all ${
            isActive('/') && location.pathname === '/'
              ? 'bg-[#0047ab] text-white shadow-xs'
              : 'text-[#434653] hover:bg-[#d0e5fc]/50 hover:text-[#00327d]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        <Link
          to="/groups"
          className={`flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-all ${
            isActive('/groups')
              ? 'bg-[#0047ab] text-white shadow-xs'
              : 'text-[#434653] hover:bg-[#d0e5fc]/50 hover:text-[#00327d]'
          }`}
        >
          <Users className="w-5 h-5" />
          My Groups
        </Link>

        <Link
          to="/history"
          className={`flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-all ${
            isActive('/history')
              ? 'bg-[#0047ab] text-white shadow-xs'
              : 'text-[#434653] hover:bg-[#d0e5fc]/50 hover:text-[#00327d]'
          }`}
        >
          <Receipt className="w-5 h-5" />
          Transactions
        </Link>

        <a
          href="#settings"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 p-3 rounded-xl font-medium text-sm text-[#434653] hover:bg-[#d0e5fc]/50 hover:text-[#00327d] transition-all cursor-pointer opacity-70"
        >
          <Settings className="w-5 h-5" />
          Settings
        </a>
      </nav>

      {/* Create New Group CTA Button */}
      <Link
        to="/create-group"
        className="mt-auto bg-[#0047ab] text-white font-semibold text-sm w-full py-3 rounded-xl hover:bg-[#00327d] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
      >
        <Plus className="w-4 h-4" />
        Create New Group
      </Link>
    </aside>
  );
};

export const MobileBottomBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2.5 bg-white/95 backdrop-blur-md border-t border-[#c3c6d5]/30 shadow-lg">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-medium transition-colors ${
          isActive('/') && location.pathname === '/' ? 'text-[#0047ab] font-bold' : 'text-[#434653]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        to="/groups"
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-medium transition-colors ${
          isActive('/groups') ? 'text-[#0047ab] font-bold' : 'text-[#434653]'
        }`}
      >
        <Users className="w-5 h-5" />
        <span>Groups</span>
      </Link>

      <Link
        to="/history"
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-medium transition-colors ${
          isActive('/history') ? 'text-[#0047ab] font-bold' : 'text-[#434653]'
        }`}
      >
        <Wallet className="w-5 h-5" />
        <span>History</span>
      </Link>

      <Link
        to="/create-group"
        className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-medium text-[#0047ab]"
      >
        <Plus className="w-5 h-5" />
        <span>New</span>
      </Link>
    </nav>
  );
};
