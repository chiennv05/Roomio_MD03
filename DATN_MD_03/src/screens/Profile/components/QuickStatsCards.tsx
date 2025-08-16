import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
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
  isVerified?: boolean;
}

const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({email, username}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.statCard, styles.usernameCard]}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, styles.usernameIconCircle]}>
            <Image
              source={{uri: Icons.IconPerson}}
              style={[styles.iconImage, {tintColor: Colors.darkGreen}]}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.statLabel]}>Username</Text>
            <Text
              style={[styles.statValue, styles.usernameValue]}
              numberOfLines={1}>
              @{username || 'username'}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.statCard, styles.emailCard]}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, styles.emailIconCircle]}>
            <Image
              source={{uri: Icons.IconEmail}}
              style={[styles.iconImage, {tintColor: Colors.darkGreen}]}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.statLabel]}>Email</Text>
            <Text
              style={[styles.statValue, styles.emailValue]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {email || 'Chưa có'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: responsiveSpacing(20),
    marginBottom: verticalScale(16),
    gap: scale(12),
  },
  statCard: {
    flex: 1,
    padding: scale(16),
    borderRadius: scale(16),
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  usernameCard: {
    backgroundColor: Colors.white,
    borderBottomWidth: 3,
    borderBottomColor: Colors.darkGreen,
  },
  emailCard: {
    backgroundColor: Colors.white,
    borderBottomWidth: 3,
    borderBottomColor: Colors.darkGreen,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
    flexShrink: 0,
  },
  usernameIconCircle: {
    backgroundColor: 'rgba(94, 182, 0, 0.15)',
  },
  emailIconCircle: {
    backgroundColor: 'rgba(94, 182, 0, 0.15)',
  },
  iconImage: {
    tintColor: Colors.darkGreen,
    width: scale(20),
    height: scale(20),
  },
  statLabel: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.gray60,
    marginBottom: scale(4),
    letterSpacing: 0.2,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
  },
  usernameValue: {
    color: Colors.darkGreen,
  },
  emailValue: {
    color: Colors.darkGreen,
  },
});

export default QuickStatsCards;
