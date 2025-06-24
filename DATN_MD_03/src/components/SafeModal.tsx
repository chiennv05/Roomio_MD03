import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ModalProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeModalProps extends ModalProps {
  children: React.ReactNode;
  containerStyle?: any;
}

const SafeModal: React.FC<SafeModalProps> = ({
  children,
  containerStyle,
  ...modalProps
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal {...modalProps}>
      <View style={[styles.container, { paddingBottom: insets.bottom }, containerStyle]}>
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeModal; 