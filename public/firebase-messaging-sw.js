importScripts('https://www.gstatic.com5/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD2RXplEZ6cZCFJJL7LKOQUm-cG-R6FUjU",
  projectId: "astral-web-439103-g7",
  messagingSenderId: "664893075850",
  appId: "1:664893075850:web:334f48a8b03ac4265e9873"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Vantage AI Workspace';
  const notificationOptions = {
    body: payload.notification?.body || 'Workflow completed or schedule reminder triggered.',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    data: payload.data || { url: '/' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
