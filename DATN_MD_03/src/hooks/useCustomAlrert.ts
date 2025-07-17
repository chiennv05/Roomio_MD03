import {useState} from 'react';

interface AlertConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    setAlertConfig(null);
  };

  const showSuccess = (message: string, title?: string) => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [{text: 'OK', onPress: () => {}}],
    });
  };

  const showError = (message: string, title?: string) => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [{text: 'OK', onPress: () => {}}],
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
      {text: 'Hủy', onPress: () => {}, style: 'cancel' as const},
      {text: 'Xác nhận', onPress: onConfirm, style: 'destructive' as const},
    ];

    showAlert({
      title,
      message,
      type: 'warning',
      buttons,
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
