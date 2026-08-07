import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { wagmiConfig } from './config/wagmi';
import { GroupProvider } from './context/GroupContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DesktopSidebar, MobileBottomBar } from './components/SidebarNav';

import { Home } from './pages/Home';
import { MyGroups } from './pages/MyGroups';
import { GroupDetail } from './pages/GroupDetail';
import { CreateGroup } from './pages/CreateGroup';
import { HistoryPage } from './pages/History';

const queryClient = new QueryClient();

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#0047ab',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
          })}
        >
          <GroupProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-[#f7f9ff] flex flex-col font-sans selection:bg-[#d0e5fc]">
                <Header />

                <div className="flex-1 flex">
                  <DesktopSidebar />

                  <main className="flex-1 w-full lg:pl-64 transition-all">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/groups" element={<MyGroups />} />
                      <Route path="/group/:id" element={<GroupDetail />} />
                      <Route path="/create-group" element={<CreateGroup />} />
                      <Route path="/history" element={<HistoryPage />} />
                    </Routes>
                  </main>
                </div>

                <MobileBottomBar />
                <Footer />
              </div>
            </BrowserRouter>
          </GroupProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
