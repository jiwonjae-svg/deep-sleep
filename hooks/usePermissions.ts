import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';

/**
 * 알림 권한 요청/확인 훅.
 */
export function usePermissions() {
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationGranted(status === 'granted');
      setChecked(true);
    });
  }, []);

  const requestNotification = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationGranted(status === 'granted');
    return status === 'granted';
  }, []);

  return { notificationGranted, checked, requestNotification };
}
