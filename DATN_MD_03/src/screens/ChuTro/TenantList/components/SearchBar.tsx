import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChangeText,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#9F9F9F"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSubmit}>
          <Image source={{uri: Icons.IconSearch}} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: Colors.backgroud,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(50),
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingHorizontal: responsiveSpacing(21),
    height: responsiveSpacing(44),
  },
  textInput: {
    flex: 1,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    paddingVertical: 0,
  },
  searchButton: {
    marginLeft: responsiveSpacing(8),
  },
  searchIcon: {
    width: responsiveSpacing(24),
    height: responsiveSpacing(24),
    tintColor: Colors.black,
  },
});

export default SearchBar; 