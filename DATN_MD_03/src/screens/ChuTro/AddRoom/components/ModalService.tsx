import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SCREEN} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';
import {ItemInput} from '../../MyRoom/components';
import DropDownPicker from 'react-native-dropdown-picker';
import {priceTypeList} from '../utils/priceType';
import {ItemSeviceOptions} from '../utils/seviceOptions';

interface ItemModal {
  visible: boolean;
  handleSave: (item: ItemSeviceOptions) => void;
  item: ItemSeviceOptions | undefined;
  handleCancel: () => void;
  handleDelete?: (item: ItemSeviceOptions) => void; // *** THÊM prop handleDelete ***
}

export default function ModalService({
  visible,
  handleSave,
  item,
  handleCancel,
  handleDelete, // *** THÊM param handleDelete ***
}: ItemModal) {
  const isSaved = item?.status === true;
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(0);
  const [priceType, setPriceType] = useState('perRoom');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);
  console.log(item);

  useEffect(() => {
    if (!item) return;
    if (item?.label !== 'Dịch vụ khác') {
      setName(item.label);
      setPrice(item.price ?? 0);
      setPriceType(item.priceType ?? 'perRoom');
      setDescription(item.description ?? '');
    } else {
      setName('');
      setPrice('');
      setPriceType('perRoom');
      setDescription('');
    }
  }, [item]);

  const isEditable = () => {
    if (item?.value === 'electricity' || item?.value === 'water') {
      return true;
    }
    return false;
  };

  // *** THÊM: Function kiểm tra có thể xóa không ***
  const isDeletable = () => {
    if (!item) return false;
    // Chỉ cho phép xóa dịch vụ tùy chọn và không phải template "khác"
    return item.category === 'optional' && item.value !== 'khac';
  };

  const editable = isEditable();
  const canDelete = isDeletable();

  const handleSaveBtn = () => {
    if (!item) return;

    const isNew = item.label === 'Dịch vụ khác';
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Lỗi', 'Tên dịch vụ không được để trống');
      return;
    }

    const newValue = isNew
      ? trimmedName.toLowerCase().replace(/\s+/g, '-')
      : item.value;

    const updatedItem: ItemSeviceOptions = {
      ...item,
      id: item.id ?? -1,
      value: newValue,
      label: trimmedName,
      price: price === '' ? 0 : price,
      priceType: priceType as 'perUsage' | 'perPerson' | 'perRoom',
      description: description || '',
      category: item.category ?? 'optional',
      iconBase: item.iconBase ?? 'IconService',
      status: true,
    };

    handleSave(updatedItem);
    handleCancel();
  };

  // *** THÊM: Function xử lý xóa ***
  const handleDeleteBtn = () => {
    if (!item || !handleDelete) return;

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa dịch vụ "${item.label}" không?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            handleDelete(item);
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.modal}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {item?.label === 'Dịch vụ khác' ? 'Thêm dịch vụ' : 'Sửa dịch vụ'}
          </Text>

          {/* Dropdown chọn loại tính phí */}
          <View style={styles.dropdownWrapper}>
            <DropDownPicker
              open={open}
              value={priceType}
              items={priceTypeList}
              setOpen={setOpen}
              setValue={setPriceType}
              setItems={() => {}}
              placeholder="Chọn loại tính phí"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.placeholder}
              listItemLabelStyle={styles.itemLabel}
            />
          </View>

          {/* Các ô input */}
          <View style={styles.inputGroup}>
            <ItemInput
              placeholder="Tên dịch vụ"
              value={name}
              onChangeText={setName}
              editable={!editable}
              width={SCREEN.width * 0.8}
            />
            <ItemInput
              placeholder="Giá"
              value={price?.toString() || ''}
              onChangeText={text => {
                const value = text.replace(/[^0-9]/g, '');
                setPrice(value === '' ? '' : parseInt(value, 10));
              }}
              keyboardType="numeric"
              editable={true}
              width={SCREEN.width * 0.8}
            />
            {!editable && (
              <ItemInput
                placeholder="Mô tả"
                value={description}
                onChangeText={setDescription}
                editable={true}
                width={SCREEN.width * 0.8}
              />
            )}
          </View>

          {/* *** THÊM: Nút xóa (hiện khi có thể xóa) *** */}
          {canDelete && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteBtn}>
              <Text style={styles.deleteText}>Xóa dịch vụ</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBtn}>
              <Text style={styles.saveText}>{isSaved ? 'Sửa' : 'Lưu'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN.width * 0.9,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownWrapper: {
    zIndex: 1000,
    marginBottom: 16,
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 8,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 1000,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  itemLabel: {
    color: '#333',
  },
  inputGroup: {
    gap: 12,
    zIndex: 10,
  },
  // *** THÊM: Style cho nút xóa ***
  deleteBtn: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignSelf: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  cancelText: {
    color: '#333',
    fontWeight: '500',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
