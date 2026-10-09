import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { pageVariants, pageVariantsReduced } from '../animations/variants';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LayoutProps {
  isBackendConnected: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ isBackendConnected }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] text-slate-900 font-sans antialiased flex flex-col">
      {/* Persistent Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-60 transition-[padding] duration-250 ease-in-out">
        {/* Sticky Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isBackendConnected={isBackendConnected}
        />

        {/* Global Page Transition on route changes */}
        <div className="flex-1 p-4 md:p-6 w-full">
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              variants={reducedMotion ? pageVariantsReduced : pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-5"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Layout;
