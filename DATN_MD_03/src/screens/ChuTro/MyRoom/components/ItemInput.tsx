import {
  Image,
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
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
  width?: number;
  iconRight?: string;
  onPressIcon?: () => void;
  keyboardType?: KeyboardTypeOptions;
  height?: number;
  borderRadius?: number;
}

const ItemInput = ({
  value,
  placeholder,
  onChangeText,
  editable,
  width = SCREEN.width * 0.9,
  iconRight,
  onPressIcon,
  keyboardType,
  height = verticalScale(50),
  borderRadius = 24,
}: InputProps) => {
  const isMultiline = placeholder === 'Mô tả' || placeholder === 'Địa chỉ chi tiết';
  const [inputHeight, setInputHeight] = useState(height);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          width,
          borderRadius,
          minHeight: isMultiline ? inputHeight : height,
          alignItems: isMultiline ? 'flex-start' : 'center',
        },
      ]}>
      <TextInput
        style={[
          styles.containerInput,
          isMultiline && styles.multilineInput,
          {
            minHeight: height,
            height: isMultiline ? inputHeight : height,
          },
        ]}
        multiline={isMultiline}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType || 'default'}
        textAlignVertical={isMultiline ? 'top' : 'center'}
        onContentSizeChange={e => {
          if (isMultiline) {
            setInputHeight(e.nativeEvent.contentSize.height + 10);
          }
        }}
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
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: verticalScale(5),
    alignSelf: 'center',
  },
  containerInput: {
    flex: 1,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Regular,
    fontWeight: '400',
    color: Colors.black,
  },
  multilineInput: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  styleIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  buttonIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
});
