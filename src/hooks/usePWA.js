/**
 * PWA Install Hook — Mengelola prompt install dan register service worker
 */
import { useState, useEffect } from 'react';

let deferredPrompt = null;

export function usePWA() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches
      || navigator.standalone === true;
  });

  useEffect(() => {
    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      deferredPrompt = null;
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setCanInstall(false);
    return outcome === 'accepted';
  };

  return { canInstall, isInstalled, installApp };
}

/** Register Service Worker */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[MAOSANI] SW registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[MAOSANI] SW registration failed:', err);
        });
    });
  }
}
