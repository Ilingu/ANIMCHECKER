importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-messaging.js");
const firebaseConfig = {
  apiKey: "AIzaSyDclxea6ZTVkBX4PJlUJEJhSVbhpsM4PiI",
  authDomain: "anim-checker-be237.firebaseapp.com",
  databaseURL: "https://anim-checker-be237.firebaseio.com",
  projectId: "anim-checker-be237",
  storageBucket: "anim-checker-be237.appspot.com",
  messagingSenderId: "736424928339",
  appId: "1:736424928339:web:41cbf06843ba8d5602d2a6",
  measurementId: "G-QGFPS58K15",
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
messaging.onMessage(function (payload) {
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        windowClient.postMessage(payload);
      }
    })
    .then(() => {
      return registration.showNotification("my notification title");
    });
  return promiseChain;
});
self.addEventListener("notificationclick", function (event) {
  console.log("On notification click: ", event.notification.tag);
  event.notification.close();
});
