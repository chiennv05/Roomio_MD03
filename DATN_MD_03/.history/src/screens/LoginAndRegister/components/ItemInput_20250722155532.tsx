import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {Icons} from '../../../assets/icons';
import {
  responsiveFont,
  responsiveIcon,
  SCREEN,
  verticalScale,
} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
interface InputProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  isPass?: boolean;
  editable: boolean;
}
const ItemInput = ({
  value,
  placeholder,
  onChangeText,
  isPass,
  editable,
}: InputProps) => {
  const [isShowPass, setIsShowPass] = useState(false);
  console.log('b');
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.containerInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPass ? !isShowPass : false}
        editable={editable}
      />
      {isPass && (
        <TouchableOpacity
          style={styles.buttonIcon}
          onPress={() => setIsShowPass(!isShowPass)}>
          <Image
            source={{uri: isShowPass ? Icons.IconEyesOff : Icons.IconEyesOn}}
            style={styles.styleIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(ItemInput);

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,
    height: verticalScale(50),
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 10,
    marginVertical: verticalScale(10),
  },
  containerInput: {
    width: SCREEN.width * 0.8,
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
