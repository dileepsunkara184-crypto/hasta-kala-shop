import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, IndianRupee, History, PlusSquare, User, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ChatAssistant from './ChatAssistant';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    // Reset state on navigation to ensure bar is visible
    setIsVisible(true);
    mainElement.scrollTo(0, 0);

    const handleTap = (e: MouseEvent | TouchEvent) => {
      // Don't toggle if clicking a button, a link, or inside the nav bar/chat
      const target = e.target as HTMLElement;
      if (
        target.closest('button') || 
        target.closest('a') || 
        target.closest('nav') || 
        target.closest('#chat-container')
      ) {
        return;
      }
      
      setIsVisible(prev => !prev);
    };

    window.addEventListener('click', handleTap);
    
    return () => {
      window.removeEventListener('click', handleTap);
    };
  }, [location.pathname]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: IndianRupee, label: 'Income', path: '/income' },
    { icon: PlusSquare, label: 'Record', path: '/record' },
    { icon: History, label: 'History', path: '/history' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white font-sans selection:bg-orange-500/30">
      <main ref={mainRef} className="flex-1 pb-24 overflow-y-auto scroll-smooth">
        <div className="max-w-md mx-auto min-h-screen bg-neutral-900 shadow-2xl relative">
          <Outlet />
          
          {/* Chat Toggle */}
          <motion.button
            animate={{ 
              y: isVisible ? 0 : 80,
              opacity: isVisible ? 1 : 0 
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed right-6 bottom-28 w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-900/20 active:scale-95 transition-transform z-40 lg:right-[calc(50%-200px)]"
            title="Chat Assistant"
            id="chat-toggle"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <motion.nav 
        initial={false}
        animate={{ y: isVisible ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 h-20 bg-neutral-900/80 backdrop-blur-md border-t border-white/5 z-50 flex items-center justify-around px-4"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsVisible(true);
              }}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 relative group",
                isActive ? "text-orange-500 scale-110" : "text-neutral-500 hover:text-neutral-400"
              )}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]")} />
              <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute -bottom-2 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" 
                />
              )}
            </button>
          );
        })}
      </motion.nav>

      {/* Chat Assistant Component */}
      <ChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
