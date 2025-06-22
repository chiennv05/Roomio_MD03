import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveSpacing } from '../../../utils/responsive';
import { Colors } from '../../../theme/color';
import { Icons } from '../../../assets/icons';

const Header: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Image 
          source={{ uri: Icons.IconArrowLeft }} 
          style={styles.icon2}
        />
      </TouchableOpacity>
      <View style={styles.rightButtons}>
        <TouchableOpacity style={styles.button}>
          <Image 
            source={{ uri: Icons.IconFavourite }} 
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.shareButton]}>
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
  icon2: {
    width: 12,
    height: 24,
    tintColor: Colors.black,
  }
});

export default Header;
