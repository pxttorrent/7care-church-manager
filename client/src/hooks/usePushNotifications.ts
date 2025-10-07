import { useState, useEffect } from 'react';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribe = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Permission denied for notifications');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key
      const vapidPublicKey = 'BD6cS7ooCOhh1lfv-D__PNYDv3S_S9EyR4bpowVJHcBxYIl5gtTFs8AThEO-MZnpzsKIZuRY3iR2oOMBDAOH2wY';
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      setSubscription(sub);
      setIsSubscribed(true);
      
      // Here you would send the subscription to your server
      console.log('Push subscription:', sub);
      
      return sub;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  };

  const sendLocalNotification = async (options: NotificationOptions) => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Permission denied for notifications');
      }

      const registration = await navigator.serviceWorker.ready;
      
      registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/pwa-192x192.png',
        badge: options.badge || '/pwa-192x192.png',
        tag: options.tag,
        data: options.data,
      } as NotificationOptions);
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendLocalNotification,
  };
};