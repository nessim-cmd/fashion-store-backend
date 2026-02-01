import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if dismissed recently (within 7 days)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 7) return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS instructions after 3 seconds
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Handle beforeinstallprompt for Android/Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  if (!showPrompt) return null;

  // iOS Instructions Modal
  if (isIOS && showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">Install on iOS</h3>
            <button onClick={handleDismiss} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <p>Tap the <strong>Share</strong> button at the bottom of Safari</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <p>Tap <strong>"Add"</strong> to install the app</p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full mt-6 py-3 bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  // Main Install Banner
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm animate-slide-up">
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={16} className="text-gray-400" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="text-white" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-1">Install Fashion Store</h3>
            <p className="text-xs text-gray-500 mb-3">
              Add to home screen for quick access & offline browsing
            </p>
            
            {isIOS ? (
              <button
                onClick={() => setShowIOSInstructions(true)}
                className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={14} />
                How to Install
              </button>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={14} />
                Install App
              </button>
            ) : (
              <p className="text-xs text-gray-400">Open in Chrome to install</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
