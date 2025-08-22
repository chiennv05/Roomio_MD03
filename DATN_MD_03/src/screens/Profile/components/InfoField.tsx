import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {
  responsiveFont,
  scale,
  verticalScale,
} from '../../../utils/responsive';

interface InfoFieldProps {
  icon?: string;
  iconBgColor?: string;
  label: string;
  value?: string;
  isEmpty?: boolean;
  isVerified?: boolean;
  isClickable?: boolean;
  isLocked?: boolean;
  hideIcon?: boolean;
  onPress?: () => void;
}

const InfoField: React.FC<InfoFieldProps> = ({
  icon,
  iconBgColor = '#F5FFF5',
  label,
  value,
  isEmpty = false,
  isVerified = false,
  isClickable = false,
  isLocked = false,
  hideIcon = false,
  onPress,
}) => {
  const Component = isClickable ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        isEmpty && styles.emptyContainer,
        isClickable && styles.clickableContainer,
      ]}
      onPress={isClickable ? onPress : undefined}>
      {!hideIcon && icon && (
        <View style={[styles.iconContainer, {backgroundColor: iconBgColor}]}>
          <Image source={{uri: icon}} style={styles.icon} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, (isEmpty || !value) && styles.emptyValue]}>
          {value || (isClickable ? 'Nhấn để thêm' : 'Chưa cập nhật')}
        </Text>
      </View>

      {isVerified && (
        <View style={styles.verifiedBadge}>
          <Image
            source={{uri: Icons.IconCheck}}
            style={styles.verifiedIcon}
          />
        </View>
      )}

      {isLocked && (
        <View style={styles.lockedBadge}>
          <Image
            source={{uri: Icons.IconWarning}}
            style={styles.lockedIcon}
          />
        </View>
      )}

      {isEmpty && isClickable && (
        <View style={styles.addButton}>
          <Image
            source={{uri: Icons.IconAdd}}
            style={styles.addIcon}
          />
        </View>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: scale(14),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyContainer: {
    borderColor: '#FFE0B2',
    backgroundColor: '#FFFBF0',
  },
  clickableContainer: {
    // Add any specific styles for clickable items
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
  content: {
    flex: 1,
  },
  label: {
    fontSize: responsiveFont(13),
    color: Colors.gray60,
    fontFamily: Fonts.Roboto_Regular,
    marginBottom: scale(4),
    letterSpacing: 0.2,
  },
  value: {
    fontSize: responsiveFont(15),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Medium,
  },
  emptyValue: {
    color: Colors.mediumGray,
    fontFamily: Fonts.Roboto_Regular,
  },
  verifiedBadge: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.white,
  },
  addButton: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: '#BAFD00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    width: scale(14),
    height: scale(14),
    tintColor: Colors.white,
  },
  lockedBadge: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIcon: {
    width: scale(14),
    height: scale(14),
    tintColor: '#E65100',
  },
});

export default InfoField;
