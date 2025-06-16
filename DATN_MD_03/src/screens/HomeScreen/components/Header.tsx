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
              source={require('../../../assets/icons/icon_notification.png')}
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
              source={require('../../../assets/icons/icon_search.png')}
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    flex: 0.6,
    backgroundColor: '#fff',
    borderWidth: 0.6,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 12,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  label: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#000',
  },
  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
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
    width: 25,
    height: 25,
    tintColor: '#333',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 12,
    marginRight: 8,
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
    fontSize: 14,
    color: '#000',
    paddingVertical: 12,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
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
    width: 20,
    height: 20,
    tintColor: '#666',
  },
});
