import React from 'react';
import {View, TextInput, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, responsiveIcon, responsiveSpacing} from '../../../utils/responsive';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Image source={{uri: Icons.IconSeachBlack}} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Tìm kiếm phòng trọ..."
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={Colors.grayLight}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Image source={{uri: Icons.IconFilter}} style={styles.filterIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(25),
    paddingHorizontal: responsiveSpacing(16),
    height: responsiveSpacing(50),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    tintColor: Colors.grayLight,
  },
  input: {
    flex: 1,
    marginLeft: responsiveSpacing(8),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    padding: 0,
  },
  filterButton: {
    marginLeft: responsiveSpacing(12),
    width: responsiveSpacing(50),
    height: responsiveSpacing(50),
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(25),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: Colors.darkGreen,
  },
});

export default SearchBar;
