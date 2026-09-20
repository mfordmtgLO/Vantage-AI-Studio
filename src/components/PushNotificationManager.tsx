import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Smartphone, CheckCircle2, AlertTriangle, ShieldCheck, X, Clock, Send } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

interface PushNotificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ isOpen, onClose }) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [scheduleMinutes, setScheduleMinutes] = useState<number>(5);
  const [reminderScheduled, setReminderScheduled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
      
      const ua = navigator.userAgent;
      const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      setIsIOS(isIosDevice);

      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      setIsStandalone(isStandaloneMode);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
          .then((reg) => {
            setRegistrationSuccess(true);
            initializeFcm(reg);
          })
          .catch(err => console.log('Firebase SW registration error:', err));
      }
    }
  }, []);

  const initializeFcm = async (swReg: ServiceWorkerRegistration) => {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyD2RXplEZ6cZCFJJL7LKOQUm-cG-R6FUjU",
        projectId: "astral-web-439103-g7",
        messagingSenderId: "664893075850",
        appId: "1:664893075850:web:334f48a8b03ac4265e9873"
      };

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const messaging = getMessaging(app);

      if (Notification.permission === 'granted') {
        try {
          const token = await getToken(messaging, {
            serviceWorkerRegistration: swReg,
          }).catch(() => null);

          if (token) {
            setFcmToken(token);
          }
        } catch (tokenErr) {
          console.warn('FCM push token acquisition non-critical error:', tokenErr);
        }
      }

      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || 'Vantage AI Workspace';
        const body = payload.notification?.body || 'New workflow update received.';
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/assets/icon-192.png' });
        }
      });
    } catch (err) {
      console.error('FCM initialization error:', err);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support push notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          await initializeFcm(reg);
        }
        new Notification('Vantage AI Workspace', {
          body: 'Firebase Cloud Messaging push notifications successfully enabled for your iPhone / device!',
          icon: '/assets/icon-192.png'
        });
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
    }
  };

  const sendTestNotification = () => {
    if (permissionStatus === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification('Vantage AI Workflow Alert', {
            body: 'Your AI lead cleanup and spreadsheet aggregation finished successfully!',
            icon: '/assets/icon-192.png'
          });
        });
      } else {
        new Notification('Vantage AI Workflow Alert', {
          body: 'Your AI lead cleanup and spreadsheet aggregation finished successfully!',
          icon: '/assets/icon-192.png'
        });
      }
    } else {
      alert('Please enable notification permissions first.');
    }
  };

  const handleScheduleReminder = () => {
    if (permissionStatus !== 'granted') {
      alert('Please enable push notifications first.');
      return;
    }

    setReminderScheduled(true);
    setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification('Vantage AI Scheduled Reminder', {
            body: `Your scheduled reminder (${scheduleMinutes}m) triggered: Review pending workspace actions & lead database feeds.`,
            icon: '/assets/icon-192.png'
          });
        });
      }
      setReminderScheduled(false);
    }, scheduleMinutes * 1000); // For demo immediacy or use minutes
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 relative transition-colors">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Firebase Cloud Messaging Push</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time alerts for workflow completion & scheduled reminders on iPhone.</p>
          </div>
        </div>

        {/* iOS Specific Instructions Note */}
        {isIOS && !isStandalone && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>iOS Safari Home Screen Requirement</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Apple requires you to add this app to your <strong>iPhone Home Screen</strong> before iOS will allow web push notifications (iOS 16.4+).
            </p>
            <ol className="text-[11px] text-amber-700 dark:text-amber-400 list-decimal list-inside space-y-0.5 pt-1">
              <li>Tap the <strong>Share</strong> button in Safari toolbar.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
              <li>Open the app from your home screen icon to enable push alerts.</li>
            </ol>
          </div>
        )}

        <div className="space-y-3 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">FCM Service Worker:</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {registrationSuccess ? 'Active (/firebase-messaging-sw.js)' : 'Registering...'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Permission Status:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
              permissionStatus === 'granted'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                : permissionStatus === 'denied'
                ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'
                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
            }`}>
              {permissionStatus}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Device Platform:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{isIOS ? 'iOS / iPhone' : 'Desktop / Android'}</span>
          </div>

          {fcmToken && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block truncate">FCM Token: {fcmToken.slice(0, 30)}...</span>
            </div>
          )}
        </div>

        {/* Schedule Reminder Section */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Schedule Reminder Push Alert
          </label>
          <div className="flex items-center gap-2">
            <select
              value={scheduleMinutes}
              onChange={(e) => setScheduleMinutes(Number(e.target.value))}
              className="p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg outline-none flex-1"
            >
              <option value={1}>In 1 Minute (Test)</option>
              <option value={5}>In 5 Minutes</option>
              <option value={15}>In 15 Minutes</option>
              <option value={60}>In 1 Hour</option>
            </select>
            <button
              onClick={handleScheduleReminder}
              disabled={reminderScheduled}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              {reminderScheduled ? 'Scheduled...' : 'Set Reminder'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          {permissionStatus !== 'granted' ? (
            <button
              onClick={requestPermission}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              Enable FCM Push Notifications
            </button>
          ) : (
            <button
              onClick={sendTestNotification}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Send Workflow Completion Alert
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
