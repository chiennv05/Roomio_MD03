import {
  Image,
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {
  responsiveFont,
  responsiveIcon,
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
  iconRight?: string;
  onPressIcon?: () => void;
  keyboardType?: KeyboardTypeOptions;
}

const ItemInput = ({
  value,
  placeholder,
  onChangeText,
  editable,
  width = SCREEN.width * 0.9, // <-- giá trị mặc định nếu không truyền
  iconRight,
  onPressIcon,
  keyboardType,
}: InputProps) => {
  return (
    <TouchableOpacity
      disabled={editable}
      style={[styles.container, {width}]}
      onPress={onPressIcon}>
      <TextInput
        style={styles.containerInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType || 'default'}
      />
      {iconRight && (
        <TouchableOpacity style={styles.buttonIcon} onPress={onPressIcon}>
          <Image source={{uri: iconRight}} style={styles.styleIcon} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
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
    marginVertical: verticalScale(5),
    alignSelf: 'center', // căn giữa nếu dùng width nhỏ hơn toàn màn hình
  },
  containerInput: {
    flex: 1,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Regular,
    fontWeight: '400',
    color: Colors.black,
  },
  styleIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  buttonIcon: {
    position: 'absolute',
    right: 10,
  },
});
