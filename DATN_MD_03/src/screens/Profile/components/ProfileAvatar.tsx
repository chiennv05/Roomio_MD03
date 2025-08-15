import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
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

interface ProfileAvatarProps {
  avatar?: string;
  fullName?: string;
  username?: string;
  role?: string;
  isVerified?: boolean;
  onChangeAvatar: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = React.memo(({
  avatar,
  fullName,
  role,
  isVerified = false,
  onChangeAvatar,
}) => {
  const getRoleBadge = () => {
    switch (role) {
      case 'chuTro':
        return {
          icon: Icons.IconHome,
          text: 'Chủ trọ',
          color: '#4CAF50',
          bgColor: 'rgba(76, 175, 80, 0.1)',
        };
      case 'nguoiThue':
        return {
          icon: Icons.IconRoom,
          text: 'Người thuê',
          color: '#2196F3',
          bgColor: 'rgba(33, 150, 243, 0.1)',
        };
      default:
        return {
          icon: Icons.IconPerson,
          text: 'Người dùng',
          color: '#9E9E9E',
          bgColor: 'rgba(158, 158, 158, 0.1)',
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{uri: avatar}} style={styles.avatarImage} />
        ) : (
          <LinearGradient
            colors={['#7B9EFF', '#9B7BFF']}
            style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {fullName ? fullName[0]?.toUpperCase() : 'U'}
            </Text>
          </LinearGradient>
        )}
        <TouchableOpacity style={styles.cameraButton} onPress={onChangeAvatar}>
          <LinearGradient
            colors={['#BAFD00', '#9FE600']}
            style={styles.cameraGradient}>
            <Image
              source={{uri: Icons.IconEditWhite}}
              style={styles.cameraIcon}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.nameContainer}>
        <View style={styles.nameWrapper}>
          <Text style={styles.userName}>{fullName || 'Người dùng'}</Text>
          {/* Verification Badge - positioned next to name */}
          <View style={[styles.verificationBadge, isVerified ? styles.verifiedBadge : styles.unverifiedBadge]}>
            <Image
              source={{uri: isVerified ? Icons.IconSecuritySelectd : Icons.IconWarning}}
              style={[styles.verificationIcon, isVerified ? styles.verifiedIcon : styles.unverifiedIcon]}
            />
            <Text style={[styles.verificationText, isVerified ? styles.verifiedText : styles.unverifiedText]}>
              {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.userBadge, {backgroundColor: roleInfo.bgColor}]}>
        <View style={[styles.badgeIconContainer, {backgroundColor: roleInfo.color}]}>
                  <Image
          source={{uri: roleInfo.icon}}
          style={styles.badgeIcon}
        />
        </View>
        <Text style={[styles.userBadgeText, {color: roleInfo.color}]}>
          {roleInfo.text}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: verticalScale(0),  // Giảm margin top
    marginBottom: verticalScale(10),  // Thêm margin bottom nhỏ
    paddingHorizontal: responsiveSpacing(20),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: verticalScale(8),
  },
  avatarImage: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    borderWidth: 4,
    borderColor: Colors.white,
  },
  avatarPlaceholder: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
  },
  avatarText: {
    fontSize: responsiveFont(40),
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  cameraButton: {
    position: 'absolute',
    bottom: scale(5),
    right: scale(5),
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
  },
  cameraGradient: {
    width: '100%',
    height: '100%',
    borderRadius: scale(17),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cameraIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.white,
  },
  userName: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
    marginBottom: scale(2),
    textAlign: 'center',
  },
  userRole: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.mediumGray,
    textAlign: 'center',
  },
  userBadge: {
    marginTop: verticalScale(4),
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  badgeIconContainer: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
  },
  badgeIcon: {
    width: scale(14),
    height: scale(14),
    tintColor: Colors.white,
  },
  userBadgeText: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Bold,
    letterSpacing: 0.3,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(4),
  },
  nameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(12),
    marginLeft: scale(8),
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
  },
  unverifiedBadge: {
    backgroundColor: '#FFF3E0',
    borderWidth: 0.5,
    borderColor: '#FF9800',
  },
  verificationIcon: {
    width: scale(12),
    height: scale(12),
    marginRight: scale(4),
  },
  verificationText: {
    fontSize: responsiveFont(10),
    fontFamily: Fonts.Roboto_Medium,
    letterSpacing: 0.2,
  },
  verifiedIcon: {
    tintColor: '#4CAF50',
  },
  unverifiedIcon: {
    tintColor: '#FF9800',
  },
  verifiedText: {
    color: '#2E7D32',
  },
  unverifiedText: {
    color: '#E65100',
  },
});

export default ProfileAvatar;
