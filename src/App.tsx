import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { PopularView } from './views/PopularView';
import { FavoritesView } from './views/FavoritesView';
import { CompareView } from './views/CompareView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { ProfileView } from './views/ProfileView';
import { AdminLoginView } from './views/AdminLoginView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { NameDetailModal } from './components/NameDetailModal';
import { RandomNameModal } from './components/RandomNameModal';
import { BabyName } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [searchOptions, setSearchOptions] = useState<any>(undefined);
  const [selectedNameForModal, setSelectedNameForModal] = useState<BabyName | null>(null);
  const [randomModalOpen, setRandomModalOpen] = useState(false);

  useEffect(() => {
    // Check initial hash
    if (window.location.hash === '#admin' || window.location.hash === '#admin_login') {
      setCurrentTab('admin_login');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret admin access shortcut: Alt + A or Ctrl + Shift + A
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setCurrentTab('admin_login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigateToSearch = (options?: any) => {
    if (options) setSearchOptions(options);
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDetails = (name: BabyName) => {
    setSelectedNameForModal(name);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* NAVBAR */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRandomModal={() => setRandomModalOpen(true)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        {currentTab === 'home' && (
          <HomeView
            onNavigateToSearch={handleNavigateToSearch}
            onOpenDetails={handleOpenDetails}
            onOpenRandom={() => setRandomModalOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'search' && (
          <SearchView
            initialOptions={searchOptions}
            onOpenDetails={handleOpenDetails}
            onOpenRandom={() => setRandomModalOpen(true)}
          />
        )}

        {currentTab === 'popular' && (
          <PopularView
            onOpenDetails={handleOpenDetails}
          />
        )}

        {currentTab === 'favorites' && (
          <FavoritesView
            onOpenDetails={handleOpenDetails}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'compare' && (
          <CompareView
            onOpenDetails={handleOpenDetails}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'login' && (
          <LoginView
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'register' && (
          <RegisterView
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'forgot_password' && (
          <ForgotPasswordView
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            setCurrentTab={setCurrentTab}
            onNavigateToSearch={handleNavigateToSearch}
          />
        )}

        {currentTab === 'admin_login' && (
          <AdminLoginView
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboardView
            setCurrentTab={setCurrentTab}
            onOpenDetails={handleOpenDetails}
          />
        )}
      </main>

      {/* DETAIL MODAL */}
      <NameDetailModal
        name={selectedNameForModal}
        onClose={() => setSelectedNameForModal(null)}
      />

      {/* RANDOM NAME MODAL */}
      <RandomNameModal
        isOpen={randomModalOpen}
        onClose={() => setRandomModalOpen(false)}
        onSelectName={handleOpenDetails}
      />

      {/* FOOTER */}
      <Footer
        setCurrentTab={setCurrentTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
