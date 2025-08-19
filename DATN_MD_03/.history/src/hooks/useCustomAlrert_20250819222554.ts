import {useState, useEffect} from 'react';

interface AlertConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  timestamp?: string;
  icon?: string;
  showIcon?: boolean;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  autoHide?: boolean;
  autoHideTimeout?: number;
  customStyles?: {
    modal?: object;
    title?: object;
    message?: object;
    button?: object;
  };
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  // Thêm useEffect để xử lý tự động ẩn alert
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (visible && alertConfig?.autoHide) {
      timeoutId = setTimeout(() => {
        hideAlert();
      }, alertConfig.autoHideTimeout || 2000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [visible, alertConfig]);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    setAlertConfig(null);
  };

  const showSuccess = (
    message: string,
    title?: string,
    autoHide: boolean = true,
  ) => {
    showAlert({
      title,
      message,
      type: 'success',
      autoHide,
      autoHideTimeout: 5000,
    });
  };

  const showError = (
    message: string,
    title?: string,
    autoHide: boolean = true,
  ) => {
    showAlert({
      title,
      message,
      type: 'error',
      autoHide,
      autoHideTimeout: 5000,
    });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title?: string,
    customButtons?: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
  ) => {
    const buttons = customButtons || [
      {text: 'Hủy', onPress: hideAlert, style: 'cancel' as const},
      {text: 'Xác nhận', onPress: onConfirm, style: 'destructive' as const},
    ];

    showAlert({
      title,
      message,
      type: 'warning',
      buttons,
      autoHide: false,
    });
  };

  // Helper function để tạo notification-style alert
  const showNotificationAlert = (
    title: string,
    message: string,
    timestamp?: string,
    onAction?: () => void,
    actionText: string = 'Xem hỗ trợ',
  ) => {
    const currentTime =
      timestamp ||
      new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    showAlert({
      title,
      message,
      timestamp: `Hôm nay - ${currentTime.split(' ')[1] || '5 giờ trước'}`,
      type: 'info',
      showIcon: false,
      buttons: [
        {text: 'Đóng', onPress: hideAlert, style: 'cancel'},
        ...(onAction
          ? [
              {
                text: actionText,
                onPress: () => {
                  onAction();
                  hideAlert();
                },
                style: 'default' as const,
              },
            ]
          : []),
      ],
      autoHide: false,
    });
  };

  return {
    alertConfig,
    visible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
    showNotificationAlert,
  };
};
