import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Icons } from '../../../assets/icons';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { 
  responsiveFont, 
  responsiveIcon, 
  responsiveSpacing 
} from '../../../utils/responsive';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearchPress: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearchPress,
  placeholder = "Tìm kiếm tin đăng..."
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textGray}
          style={styles.searchInput}
        />
      </View>
      <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
        <Image 
          source={{ uri: Icons.IconSearch }}
          style={styles.searchIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    backgroundColor: Colors.white,
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
    tintColor: Colors.black,
  },
}); 