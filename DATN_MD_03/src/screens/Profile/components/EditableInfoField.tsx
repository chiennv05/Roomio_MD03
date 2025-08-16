import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {
  responsiveFont,
  scale,
  verticalScale,
} from '../../../utils/responsive';

interface EditableInfoFieldProps {
  icon: string | undefined;
  iconBgColor?: string;
  label: string;
  value?: string;
  onPress: () => void;
}

const EditableInfoField: React.FC<EditableInfoFieldProps> = React.memo(({
  icon,
  iconBgColor = '#F5FFF5',
  label,
  value,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, {backgroundColor: iconBgColor}]}>
          <Image source={{uri: icon || ''}} style={styles.icon} />
        </View>
        <View style={styles.textContent}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value || 'Nhấn để thêm'}</Text>
        </View>
      </View>
      <View style={styles.editIndicator}>
        <Image source={{uri: Icons.IconEditBlack}} style={styles.editIcon} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: scale(14),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F5F5F5',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  containerPressed: {
    backgroundColor: '#FAFAFA',
    opacity: 0.95,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(14),
  },
  icon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#5EB600',
  },
  textContent: {
    flex: 1,
  },
  label: {
    fontSize: responsiveFont(12),
    color: Colors.mediumGray,
    fontFamily: Fonts.Roboto_Regular,
    marginBottom: scale(4),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: responsiveFont(15),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Medium,
  },
  editIndicator: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#BAFD00',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scale(10),
  },
  editIcon: {
    width: scale(18),
    height: scale(18),
    tintColor: Colors.black,
  },
});

export default EditableInfoField;
