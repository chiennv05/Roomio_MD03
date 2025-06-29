import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Icons } from '../../../assets/icons';
import { 
  responsiveFont, 
  responsiveIcon, 
  responsiveSpacing 
} from '../../../utils/responsive';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onUserPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearchPress, 
  onNotificationPress,
  onUserPress 
}) => {
  // Get user info from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Get display name and avatar
  const displayName = user?.username || 'Guest';
  const isGuest = !user;
  
  // Create avatar from first letter
  const getAvatarLetter = (name: string) => {
    if (name === 'Guest') return 'G';
    return name.charAt(0).toUpperCase();
  };
  
  const avatarLetter = getAvatarLetter(displayName);
  
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={onUserPress}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={styles.userText}>
              <Text style={styles.label}>
                {isGuest ? 'Chào mừng bạn' : 'Xin chào'}
              </Text>
              <Text style={styles.name}>{displayName}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={onNotificationPress}
          >
            <Image 
              source={{ uri: Icons.IconNotification }}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchRow}>
          <TouchableOpacity 
            style={styles.searchInputContainer}
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <Text style={styles.searchPlaceholder}>
              Tìm kiếm trọ dễ dàng...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={onSearchPress}
          >
            <Image 
              source={{ uri: Icons.IconSearch }}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(12),
    paddingBottom: responsiveSpacing(16),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveIcon(45),
    flex: 0.6,
    backgroundColor: Colors.white,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarContainer: {
    width: responsiveIcon(50),
    height: responsiveIcon(50),
    borderRadius: responsiveIcon(25),
    marginRight: responsiveSpacing(12),
    backgroundColor: Colors.limeGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    fontWeight: 'bold',
  },
  userText: {
    flex: 1,
  },
  label: {
    color: Colors.darkGray,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    marginBottom: responsiveSpacing(2),
  },
  name: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(17),
    color: Colors.black,
  },
  notificationButton: {
    width: responsiveIcon(50),
    height: responsiveIcon(50),
    borderRadius: responsiveIcon(25),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationIcon: {
    width: responsiveIcon(25),
    height: responsiveIcon(25),
    tintColor: '#333',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(25),
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(12),
    marginRight: responsiveSpacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: responsiveFont(14),
    color: '#999',
    fontFamily: Fonts.Roboto_Regular,
  },
  searchButton: {
    width: responsiveIcon(48),
    height: responsiveIcon(48),
    borderRadius: responsiveIcon(24),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    tintColor: '#666',
  },
});
