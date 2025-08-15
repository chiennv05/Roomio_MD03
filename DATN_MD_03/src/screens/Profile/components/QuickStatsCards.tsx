import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {
  responsiveFont,
  scale,
  verticalScale,
  responsiveSpacing,
} from '../../../utils/responsive';

interface QuickStatsCardsProps {
  email?: string;
  username?: string;
}

const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({
  email,
  username,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7B9EFF', '#9B7BFF']}
        style={styles.statCard}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Image source={{uri: Icons.IconPerson}} style={styles.iconImage}
            />
          </View>
        </View>
        <Text style={styles.statLabel}>Username</Text>
        <Text style={styles.statValue} numberOfLines={1}>
          @{username || 'username'}
        </Text>
      </LinearGradient>

      <LinearGradient
        colors={['#BAFD00', '#9FE600']}
        style={styles.statCard}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Image source={{uri: Icons.IconContract}} style={styles.iconImage}
            />
          </View>
        </View>
        <Text style={styles.statLabel}>Email</Text>
        <Text style={styles.statValue} numberOfLines={1}>
          {email || 'Chưa có'}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: responsiveSpacing(20),
    marginBottom: verticalScale(12),
    gap: scale(12),
  },
  statCard: {
    flex: 1,
    padding: scale(14),
    borderRadius: scale(14),
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: scale(8),
  },
  iconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: scale(22),
    height: scale(22),
    tintColor: Colors.white,
  },
  statLabel: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Regular,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: scale(4),
  },
  statValue: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    textAlign: 'center',
  },
});

export default QuickStatsCards;
