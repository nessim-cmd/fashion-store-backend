import { useRegisterSW } from 'virtual:pwa-register/react';

export const ReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-black text-white rounded-lg shadow-2xl max-w-sm animate-in slide-in-from-bottom-5">
      <div className="mb-2">
        {offlineReady ? (
          <span className="font-medium">App ready to work offline</span>
        ) : (
          <span className="font-medium">New content available, click on reload button to update.</span>
        )}
      </div>
      <div className="flex gap-2">
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-4 py-2 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            Reload
          </button>
        )}
        <button
          onClick={close}
          className="px-4 py-2 border border-white/30 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
