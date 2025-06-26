import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { responsiveSpacing } from '../../../utils/responsive';
import { Colors } from '../../../theme/color';
import { Icons } from '../../../assets/icons';

interface HeaderProps {
  onGoBack: () => void;
  onFavoritePress?: () => void;
  onSharePress?: () => void;
  isFavorited?: boolean;
  favoriteLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onGoBack, 
  onFavoritePress, 
  onSharePress,
  isFavorited = false,
  favoriteLoading = false
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onGoBack}>
        <Image 
          source={{ uri: Icons.IconArrowLeft }} 
          style={styles.icon2}
        />
      </TouchableOpacity>
      <View style={styles.rightButtons}>
        <TouchableOpacity 
          style={[styles.button, favoriteLoading && styles.loadingButton]} 
          onPress={onFavoritePress}
          disabled={favoriteLoading}
        >
          <Image 
            source={{ uri: isFavorited ? Icons.IconHeartFavourite : Icons.IconFavourite }} 
            style={[
              isFavorited ? styles.favoriteIcon : styles.icon, 
              favoriteLoading && styles.loadingIcon
            ]}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.shareButton]} 
          onPress={onSharePress}
        >
          <Image 
            source={{ uri: Icons.IconShare }} 
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    top: responsiveSpacing(50), 
    left: 0, 
    right: 0,
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(16), 
    zIndex: 10,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  button: {
    width: 40,
    height: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    marginLeft: responsiveSpacing(12),
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: Colors.black,
  },
  favoriteIcon: {
    width: 20,
    height: 20,
    // Không có tintColor để giữ màu gốc của icon đỏ
  },
  icon2: {
    width: 12,
    height: 24,
    tintColor: Colors.black,
  },
  loadingButton: {
    opacity: 0.6,
  },
  loadingIcon: {
    opacity: 0.5,
  }
});

export default Header;
