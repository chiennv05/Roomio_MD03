import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  buttonText?: string;
  containerStyle?: ViewStyle;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Tìm kiếm...',
  value,
  onChangeText,
  onSubmit,
  buttonText = 'Tìm',
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  input: {
    flex: 1,
    height: verticalScale(40),
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: scale(12),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
  },
  button: {
    marginLeft: scale(10),
    backgroundColor: Colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: scale(15),
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
  },
});

export default SearchBar; 