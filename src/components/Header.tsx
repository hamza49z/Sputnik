import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bell, Settings, Menu, X, PlusCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f9ff]/90 backdrop-blur-md border-b border-[#c3c6d5]/20 shadow-xs h-16 transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Custom SVG Sputnik Satellite Logo matching Image 14/15 */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#00327d] transition-transform group-hover:rotate-12 duration-300">
              {/* Outer Orbit */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="180 50" strokeLinecap="round" />
              {/* Satellite Satellite Core */}
              <circle cx="50" cy="50" r="16" fill="currentColor" />
              <circle cx="50" cy="50" r="8" fill="#ffffff" />
              {/* Satellite Antennas */}
              <line x1="28" y1="28" x2="10" y2="10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <line x1="26" y1="50" x2="6" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <line x1="28" y1="72" x2="10" y2="90" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              {/* Orbital Signal Dot */}
              <circle cx="80" cy="30" r="7" fill="#82c8e5" />
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#00327d]">
            Sputnik
          </span>
        </Link>

        {/* Desktop Navigation Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-semibold py-2 transition-colors relative ${
              isActive('/')
                ? 'text-[#00327d] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00327d]'
                : 'text-[#434653] hover:text-[#0047ab]'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/groups"
            className={`text-sm font-semibold py-2 transition-colors relative ${
              isActive('/groups')
                ? 'text-[#00327d] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00327d]'
                : 'text-[#434653] hover:text-[#0047ab]'
            }`}
          >
            My Groups
          </Link>
          <Link
            to="/history"
            className={`text-sm font-semibold py-2 transition-colors relative ${
              isActive('/history')
                ? 'text-[#00327d] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00327d]'
                : 'text-[#434653] hover:text-[#0047ab]'
            }`}
          >
            Transactions
          </Link>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/create-group"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#00327d] bg-[#d0e5fc]/60 hover:bg-[#d0e5fc] rounded-lg transition-all border border-[#0047ab]/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Pool
          </Link>

          <button
            title="Notifications"
            className="hidden md:flex items-center justify-center p-2 text-[#434653] hover:text-[#00327d] hover:bg-[#e3efff] rounded-full transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            title="Settings"
            className="hidden md:flex items-center justify-center p-2 text-[#434653] hover:text-[#00327d] hover:bg-[#e3efff] rounded-full transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* RainbowKit Wallet Connect Button */}
          <div className="scale-95 sm:scale-100">
            <ConnectButton
              showBalance={false}
              accountStatus="avatar"
              chainStatus="icon"
            />
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#434653] hover:text-[#00327d] rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f7f9ff] border-b border-[#c3c6d5]/30 px-6 py-4 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#00327d] py-2"
          >
            Dashboard
          </Link>
          <Link
            to="/groups"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#434653] hover:text-[#00327d] py-2"
          >
            My Groups
          </Link>
          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#434653] hover:text-[#00327d] py-2"
          >
            Transactions
          </Link>
          <Link
            to="/create-group"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center py-2.5 text-xs font-bold text-white bg-[#0047ab] rounded-lg shadow-xs"
          >
            + Create New Group
          </Link>
        </div>
      )}
    </header>
  );
};
