import {StyleSheet, TextInput, View} from 'react-native';
import React from 'react';
import {
  responsiveFont,
  SCREEN,
  verticalScale,
} from '../../../../utils/responsive';
import {Fonts} from '../../../../theme/fonts';
import {Colors} from '../../../../theme/color';

interface InputProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  width?: number; // <-- thêm tham số width (tùy chọn)
}

const ItemInput = ({
  value,
  placeholder,
  onChangeText,
  editable,
  width = SCREEN.width * 0.9, // <-- giá trị mặc định nếu không truyền
}: InputProps) => {
  return (
    <View style={[styles.container, {width}]}>
      <TextInput
        style={styles.containerInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
    </View>
  );
};

export default React.memo(ItemInput);

const styles = StyleSheet.create({
  container: {
    height: verticalScale(50),
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 10,
    marginVertical: verticalScale(10),
    alignSelf: 'center', // căn giữa nếu dùng width nhỏ hơn toàn màn hình
  },
  containerInput: {
    flex: 1,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Regular,
    fontWeight: '400',
    color: Colors.black,
  },
});
