importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

self.addEventListener('push', function(event) {
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
            // Handle FCM specific structure if wrapped
            if (data.notification) {
                // FCM often wraps title/body in 'notification' key
                data = {
                    title: data.notification.title,
                    body: data.notification.body,
                    icon: data.notification.icon,
                    url: data.data ? data.data.url : '/'
                };
            }
        } catch(e) {
            data = { title: 'Notification', body: event.data.text() };
        }
    } else {
        data = { title: 'New Message', body: 'You have a new notification.' };
    }

    const options = {
        body: data.body,
        icon: data.icon || '/web/static/img/logo.png',
        badge: data.badge || '/web/static/img/logo.png',
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});
