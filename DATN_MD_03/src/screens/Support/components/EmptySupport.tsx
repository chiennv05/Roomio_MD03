import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';

interface EmptySupportProps {
  message?: string;
}

const EmptySupport: React.FC<EmptySupportProps> = ({
  message = 'Chưa có yêu cầu hỗ trợ',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={{uri: Icons.IconEmptyMessage || (Icons as any).IconWarning}}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subText}>
        Bạn chưa có yêu cầu hỗ trợ nào.{'\n'}
        Nhấn nút + để tạo yêu cầu hỗ trợ mới.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing(24),
    backgroundColor: Colors.backgroud,
  },
  iconContainer: {
    width: scale(84),
    height: scale(84),
    borderRadius: scale(42),
    backgroundColor: Colors.lightOrangeBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  icon: {
    width: scale(42),
    height: scale(42),
    tintColor: Colors.warning,
  },
  message: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
  },
  subText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: responsiveFont(20),
    maxWidth: '85%',
  },
});

export default EmptySupport;
