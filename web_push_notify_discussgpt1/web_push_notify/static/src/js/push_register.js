/** @odoo-module **/
import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";
import { rpc } from "@web/core/network/rpc";

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const pushService = {
    dependencies: ["notification"],
    async start(env, { notification }) {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            console.log("Push messaging is not supported");
            return;
        }

        const subscribeUser = async () => {
            try {
                // 1. Fetch Configuration
                const firebaseConfig = await rpc('/web_push/firebase_config');
                const vapidPublicKey = await rpc('/web_push/vapid_public_key');

                // 2. Try Firebase First
                if (firebaseConfig && firebaseConfig.apiKey) {
                    console.log("Initializing Firebase Messaging...");
                    
                    await loadJS("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
                    await loadJS("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

                    firebase.initializeApp(firebaseConfig);
                    const messaging = firebase.messaging();

                    const registration = await navigator.serviceWorker.register('/web_push_sw.js', { scope: '/' });
                    
                    const currentToken = await messaging.getToken({ 
                        vapidKey: vapidPublicKey, 
                        serviceWorkerRegistration: registration 
                    });

                    if (currentToken) {
                        await rpc('/web_push/subscribe', {
                            endpoint: currentToken, 
                            keys: { p256dh: '', auth: '' },
                            type: 'fcm'
                        });
                        console.log("User subscribed via Firebase");
                        notification.add("Push Notifications Enabled!", { type: 'success' });
                        return;
                    }
                }

                // 3. Fallback to Standard VAPID
                console.log("Falling back to standard VAPID...");
                const registration = await navigator.serviceWorker.register('/web_push_sw.js', { scope: '/' });
                
                if (!vapidPublicKey) {
                    console.log("No VAPID public key configured.");
                    return;
                }
                
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                let subscription = await registration.pushManager.getSubscription();
                
                if (!subscription) {
                     subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedVapidKey
                    });
                }

                if (subscription) {
                     const rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
                     const auth = subscription.getKey ? subscription.getKey('auth') : '';
                     
                     const p256dh = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
                     const authStr = auth ? btoa(String.fromCharCode.apply(null, new Uint8Array(auth))) : '';

                     await rpc('/web_push/subscribe', {
                         endpoint: subscription.endpoint,
                         keys: {
                             p256dh: p256dh,
                             auth: authStr
                         },
                         type: 'web'
                     });
                     console.log("User subscribed via VAPID");
                     notification.add("Push Notifications Enabled!", { type: 'success' });
                }

            } catch (error) {
                console.error("Error in push registration:", error);
                notification.add("Failed to enable notifications. Check console.", { type: 'danger' });
            }
        };

        // Check Permission Status
        if (Notification.permission === 'granted') {
            // Already active, just ensure backend is synced silently
            subscribeUser();
        } else if (Notification.permission === 'default') {
            // Prompt User
            notification.add("Enable notifications to get real-time updates?", {
                title: "Enable Notifications",
                type: "warning",
                sticky: true,
                buttons: [{
                    name: "Enable",
                    primary: true,
                    onClick: async () => {
                         // Request permission triggers browser prompt
                         const permission = await Notification.requestPermission();
                         if (permission === 'granted') {
                             subscribeUser();
                         }
                    }
                }]
            });
        }
    }
};

registry.category("services").add("web_push_service", pushService);