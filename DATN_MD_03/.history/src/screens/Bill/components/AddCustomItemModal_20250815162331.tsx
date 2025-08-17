import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../../../theme/color';

type Category = 'rent' | 'utility' | 'service' | 'maintenance' | 'other';

export interface AddCustomItemData {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: Category;
  isRecurring: boolean;
}

interface AddCustomItemModalProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (data: AddCustomItemData) => void;
  defaultValues?: Partial<AddCustomItemData>;
}

const getCategoryText = (category: Category) => {
  switch (category) {
    case 'rent': return 'Tiền phòng';
    case 'utility': return 'Tiện ích';
    case 'service': return 'Dịch vụ';
    case 'maintenance': return 'Bảo trì/khác';
    default: return 'Khác';
  }
};

const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({ visible, loading = false, onClose, onSave, defaultValues }) => {
  const [name, setName] = useState<string>(defaultValues?.name || '');
  const [description, setDescription] = useState<string>(defaultValues?.description || '');
  const [quantityStr, setQuantityStr] = useState<string>(defaultValues?.quantity?.toString() || '1');
  const [unitPriceStr, setUnitPriceStr] = useState<string>(defaultValues?.unitPrice?.toString() || '0');
  const [category, setCategory] = useState<Category>((defaultValues?.category as Category) || 'service');
  const [isRecurring, setIsRecurring] = useState<boolean>(defaultValues?.isRecurring ?? true);
  const [nameError, setNameError] = useState<string | null>(null);
  const [unitPriceError, setUnitPriceError] = useState<string | null>(null);

  const categories: Category[] = useMemo(() => ['service', 'utility', 'rent', 'maintenance', 'other'], []);

  const validate = (): boolean => {
    let ok = true;
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setNameError('Vui lòng nhập tên khoản mục');
      ok = false;
    } else {
      setNameError(null);
    }

    const unit = parseInt(unitPriceStr, 10);
    if (!unit || unit <= 0) {
      setUnitPriceError('Đơn giá phải lớn hơn 0');
      ok = false;
    } else {
      setUnitPriceError(null);
    }
    return ok;
  };

  const isSaveDisabled = useMemo(() => {
    if (loading) {return true;}
    if (!name.trim()) {return true;}
    const unit = parseInt(unitPriceStr, 10);
    if (!unit || unit <= 0) {return true;}
    return false;
  }, [loading, name, unitPriceStr]);

  const handleSave = () => {
    if (!validate()) {return;}
    const quantity = parseInt(quantityStr, 10) || 1;
    const unitPrice = parseInt(unitPriceStr, 10) || 0;

    onSave({
      name: name.trim(),
      description: description.trim(),
      quantity,
      unitPrice,
      category,
      isRecurring,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            <Text style={styles.modalTitle}>Thêm khoản mục</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên khoản mục</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên khoản mục"
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Nhập mô tả"
                multiline
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flexItem]}>
                <Text style={styles.inputLabel}>Số lượng</Text>
                <TextInput
                  style={styles.modalInput}
                  value={quantityStr}
                  onChangeText={(t) => setQuantityStr(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, styles.flexItem]}>
                <Text style={styles.inputLabel}>Đơn giá (VND)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={unitPriceStr}
                  onChangeText={(t) => setUnitPriceStr(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
                {unitPriceError ? <Text style={styles.errorText}>{unitPriceError}</Text> : null}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Loại khoản mục</Text>
              <View style={styles.categoryButtons}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.categoryButton, category === c && styles.categoryButtonActive]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.categoryButtonText, category === c && styles.categoryButtonTextActive]}>
                      {getCategoryText(c)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tính định kỳ</Text>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[styles.categoryButton, isRecurring && styles.categoryButtonActive]}
                  onPress={() => setIsRecurring(true)}
                >
                  <Text style={[styles.categoryButtonText, isRecurring && styles.categoryButtonTextActive]}>Có</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.categoryButton, !isRecurring && styles.categoryButtonActive]}
                  onPress={() => setIsRecurring(false)}
                >
                  <Text style={[styles.categoryButtonText, !isRecurring && styles.categoryButtonTextActive]}>Không</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, isSaveDisabled && { opacity: 0.6 }]} onPress={handleSave} disabled={isSaveDisabled}>
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu khoản mục</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 12,
  },
  inputGroup: { marginBottom: 12 },
  inputLabel: { color: Colors.mediumGray, marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.black,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  flexItem: { flex: 1 },
  categoryButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.35)',
  },
  categoryButtonText: { color: Colors.dearkOlive, fontWeight: '600' },
  categoryButtonTextActive: { color: Colors.primaryGreen, fontWeight: '700' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: { color: Colors.black, fontWeight: '600' },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: { color: Colors.white, fontWeight: '700' },
  errorText: { color: Colors.red, marginTop: 4, fontSize: 12 },
});

export default AddCustomItemModal;


