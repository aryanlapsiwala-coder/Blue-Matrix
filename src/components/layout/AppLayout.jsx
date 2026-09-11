import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { KnowBotDrawer } from '../common/KnowBotDrawer';
import { CommandPalette } from '../common/CommandPalette';
import { InteractiveDotBackground } from '../ui/interactive-dot-background';
import { ErrorBoundary } from '../common/ErrorBoundary';
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [knowBotOpen, setKnowBotOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Interactive Animated Dot Pattern Background */}
      <InteractiveDotBackground />

      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenKnowBot={() => setKnowBotOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />
      
      <div className="flex flex-1 relative z-10">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Global Spotlight Search / Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenKnowBot={() => setKnowBotOpen(true)}
      />

      {/* Slide-out Global KnowBot Assistant Drawer */}
      <KnowBotDrawer
        isOpen={knowBotOpen}
        onClose={() => setKnowBotOpen(false)}
      />
    </div>
  );
}
