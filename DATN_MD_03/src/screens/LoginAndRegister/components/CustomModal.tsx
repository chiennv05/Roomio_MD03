import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
  SCREEN,
} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';

interface ModalProps {
  icon: any;
  visible: boolean;
  onPress: () => void;
  title: string;
}

const CustomModal = ({visible, onPress, title}: ModalProps) => {
  return (
    <Modal animationType="slide" visible={visible} transparent={true}>
      <View style={styles.modal}>
        <View style={styles.container}>
          <Text style={styles.title}>Thông báo</Text>
          <Text style={styles.textTitle}>{title}</Text>
          <View style={styles.containerButton}>
            <TouchableOpacity style={styles.button} onPress={onPress}>
              <Text style={styles.textButton}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: SCREEN.width * 0.9,
    minHeight: 100,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
  },
  styleIcon: {
    width: responsiveIcon(100),
    height: responsiveIcon(100),
  },
  textTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    textAlign: 'left',
    lineHeight: responsiveFont(22),
    marginTop: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(20),
  },
  textButton: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  button: {
    paddingVertical: responsiveSpacing(8),
    borderRadius: responsiveSpacing(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerButton: {
    width: SCREEN.width * 0.8,
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginTop: responsiveSpacing(12),
    textAlign: 'left',
  },
});
