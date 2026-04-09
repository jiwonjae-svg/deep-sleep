import { useEffect, useState, useCallback } from 'react';

// expo-notifications lazy require (SDK 53+ 사이드이펙트 회피)
function getNotifications() {
  return require('expo-notifications') as typeof import('expo-notifications');
}

/**
 * 알림 권한 요청/확인 훅.
 */
export function usePermissions() {
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const Notifications = getNotifications();
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationGranted(status === 'granted');
      setChecked(true);
    });
  }, []);

  const requestNotification = useCallback(async () => {
    const Notifications = getNotifications();
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationGranted(status === 'granted');
    return status === 'granted';
  }, []);

  return { notificationGranted, checked, requestNotification };
}
