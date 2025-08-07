import {useState, useEffect} from 'react';

interface AlertConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  autoHide?: boolean;
  autoHideTimeout?: number;
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
      buttons: [{text: 'OK', onPress: hideAlert}],
      autoHide,
      autoHideTimeout: 2000,
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
      autoHideTimeout: 2000,
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

  return {
    alertConfig,
    visible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  };
};
