import React, { useEffect } from 'react';
import { useAppStore, AppPage } from './stores/appStore';
import { WindowFrame } from './components/layout/WindowFrame';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/Toast';

import { Dashboard } from './pages/Dashboard';
import { Camera } from './pages/Camera';
import { Audio } from './pages/Audio';
import { Recorder } from './pages/Recorder';
import { Recordings } from './pages/Recordings';
import { Settings } from './pages/Settings';

export default function App() {
  const { activePage, setActivePage } = useAppStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.onMenuAction) {
      const unsubscribe = window.electronAPI.onMenuAction((action: string) => {
        if (action.startsWith('navigate:')) {
          const targetPage = action.replace('navigate:', '') as AppPage;
          if (['dashboard', 'camera', 'audio', 'recorder', 'recordings', 'settings'].includes(targetPage)) {
            setActivePage(targetPage);
          }
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [setActivePage]);

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'camera':
        return <Camera />;
      case 'audio':
        return <Audio />;
      case 'recorder':
        return <Recorder />;
      case 'recordings':
        return <Recordings />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <WindowFrame>
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-[#0b0d10] relative flex flex-col">
        {renderCurrentPage()}
      </main>
      <ToastContainer />
    </WindowFrame>
  );
}
