import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Icons } from '../../../assets/icons';
import { 
  responsiveFont, 
  responsiveIcon, 
  responsiveSpacing 
} from '../../../utils/responsive';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';

const Header: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/40' }}
              style={styles.avatar}
            />
            <View style={styles.userText}>
              <Text style={styles.label}>Chào mừng bạn</Text>
              <Text style={styles.name}>Việt Tùng</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Image 
              source={{ uri: Icons.IconNotification }}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <TextInput
              placeholder="Tìm kiếm trọ dễ dàng..."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.searchButton}>
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
    borderRadius: responsiveIcon(25),
    flex: 0.6,
    backgroundColor: Colors.white,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: responsiveSpacing(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: responsiveIcon(50),
    height: responsiveIcon(50),
    borderRadius: responsiveIcon(25),
    marginRight: responsiveSpacing(12),
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
    marginRight: responsiveSpacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    paddingVertical: responsiveSpacing(12),
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
