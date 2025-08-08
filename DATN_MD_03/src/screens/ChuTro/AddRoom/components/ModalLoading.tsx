import React from 'react';
import {Image, Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
// hoặc Lottie nếu bạn dùng animation Lottie
import {responsiveIcon, SCREEN} from '../../../../utils/responsive';
import {LoadingAnimation} from '../../../../components';
import {Icons} from '../../../../assets/icons';
import {Colors} from '../../../../theme/color';

interface ModalLoadingProps {
  visible?: boolean;
  loading?: boolean;
  image?: string;
  onPressVisible?: () => void;
}

const ModalLoading = ({
  visible,
  loading,
  image,
  onPressVisible,
}: ModalLoadingProps) => {
  console.log(image);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.overlay}>
        {!loading && (
          <TouchableOpacity onPress={onPressVisible} style={styles.button}>
            <Image
              source={{uri: Icons.IconDelete}}
              style={styles.styleIconDelete}
            />
          </TouchableOpacity>
        )}
        {loading && <LoadingAnimation size="medium" color={Colors.limeGreen} />}
        {image && image.trim() !== '' && (
          <Image
            source={{uri: image}}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
};

export default ModalLoading;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // nền mờ
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN.width * 0.3,
    height: SCREEN.width * 0.3,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN.width,
    height: SCREEN.height * 0.7,
  },
  styleIconDelete: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  button: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    backgroundColor: Colors.darkGray,
    borderRadius: responsiveIcon(32) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '6%',
    right: '5%',
  },
});
