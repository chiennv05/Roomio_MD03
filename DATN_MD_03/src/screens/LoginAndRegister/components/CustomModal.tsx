import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {
  responsiveFont,
  responsiveIcon,
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

const CustomModal = ({visible, onPress, title, icon}: ModalProps) => {
  return (
    <Modal animationType="slide" visible={visible} transparent={true}>
      <View style={styles.modal}>
        <View style={styles.container}>
          <Image source={{uri: icon}} style={styles.styleIcon} />
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
    minHeight: 200,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  styleIcon: {
    width: responsiveIcon(100),
    height: responsiveIcon(100),
  },
  textTitle: {
    width: SCREEN.width * 0.8,
    fontSize: responsiveFont(19),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginVertical: 10,
    textAlign: 'center',
  },
  textButton: {
    fontSize: responsiveFont(19),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  button: {
    width: 100,
    height: 50,
    backgroundColor: Colors.limeGreen,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerButton: {
    width: SCREEN.width * 0.8,
    alignItems: 'flex-end',
    marginBottom: 10,
  },
});
