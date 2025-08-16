import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  KeyboardTypeOptions,
} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {
  responsiveFont,
  scale,
  verticalScale,
} from '../../../utils/responsive';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';

interface EditModalProps {
  visible: boolean;
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  title,
  value,
  onChangeText,
  onSave,
  onCancel,
  placeholder,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'sentences',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onCancel}>
              <Image source={{uri: Icons.IconClose}} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#B0B0B0"
            keyboardType={keyboardType}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            selectionColor="#BAFD00"
            underlineColorAndroid="transparent"
            autoCorrect={false}
          />
          <View style={styles.buttonContainer}>
            <ItemButtonConfirm
              title="Lưu thay đổi"
              icon={Icons.IconRemoveWhite}
              onPress={onSave}
              onPressIcon={onCancel}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  closeIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.mediumGray,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: scale(12),
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(15),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    backgroundColor: '#F8F8F8',
    marginBottom: verticalScale(20),
    outlineStyle: 'none' as any, // Loại bỏ outline trên web
    outlineWidth: 0,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
});

export default EditModal;
