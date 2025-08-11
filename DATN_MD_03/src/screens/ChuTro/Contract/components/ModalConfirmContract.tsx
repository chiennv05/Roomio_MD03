import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';
import {Fonts} from '../../../../theme/fonts';

interface Props {
  visible: boolean;
  onClose: () => void;
  action: 'extend' | 'terminate' | null;
  value: string;
  setValue: (text: string) => void;
  onSubmit: () => void;
}

const ModalConfirmContract = ({
  visible,
  onClose,
  action,
  value,
  setValue,
  onSubmit,
}: Props) => {
  if (!action) {return null;}

  const isExtend = action === 'extend';

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {isExtend ? 'Gia hạn hợp đồng' : 'Chấm dứt hợp đồng'}
          </Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={
              isExtend
                ? 'Nhập số tháng muốn gia hạn (ví dụ: 3)'
                : 'Nhập lý do chấm dứt hợp đồng'
            }
            multiline={!isExtend}
            keyboardType={isExtend ? 'numeric' : 'default'}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onSubmit}>
              <Text style={styles.confirmText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalConfirmContract;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    height: 100,
    borderColor: Colors.gray,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  button: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    borderRadius: responsiveSpacing(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.black,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
  },
  confirmText: {
    color: Colors.success,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
  },
});
