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
    case 'utility': return 'Tiện ích';
    case 'service': return 'Dịch vụ';
    case 'maintenance': return 'Bảo trì';
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

  
  const categories: Category[] = useMemo(() => ['service', 'maintenance', 'other'], []);

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
          <View style={styles.dragIndicator} />
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.modalTitle}>Thêm khoản mục tùy chỉnh</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên khoản mục *</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên khoản mục"
                placeholderTextColor={Colors.mediumGray}
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.noteWrapper}>
              <View style={styles.noteBox}>
                <View style={styles.noteAccent} />
                <Text style={styles.noteText}>Lưu ý: Các khoản mục tùy chỉnh có thể chỉnh sửa hoặc xóa sau khi tạo</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea, styles.textAreaInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Nhập mô tả"
                placeholderTextColor={Colors.mediumGray}
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
                <Text style={styles.inputLabel}>Đơn giá (VNĐ) *</Text>
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
              <Text style={styles.inputLabel}>Danh mục</Text>
              <View style={styles.categoryButtons}>
                {categories.map((c, idx) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.categoryButton,
                      styles.categoryButtonHalf,
                      category === c && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.categoryButtonText, category === c && styles.categoryButtonTextActive]}>
                      {getCategoryText(c)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsRecurring(!isRecurring)} activeOpacity={0.8}>
              <View style={[styles.checkboxBox, isRecurring && styles.checkboxBoxChecked]}>
                {isRecurring ? <Text style={styles.checkboxTick}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxLabel}>Tính định kỳ của khoản mục</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.bottomBar}>
            <View style={styles.bottomBarInner}>
              <TouchableOpacity style={styles.closeCircle} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryCTA, (isSaveDisabled || loading) && { opacity: 0.7 }]}
                disabled={isSaveDisabled || loading}
                onPress={handleSave}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.black} />
                ) : (
                  <Text style={styles.primaryCTAText}>Lưu khoản mục</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    marginBottom: -10,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
    marginVertical: 12,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: Colors.dearkOlive, marginBottom: 6, fontWeight: '700' },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: Colors.black,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  flexItem: { flex: 1 },
  categoryButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonHalf: { width: '47%', marginBottom: 12 },
  categoryButtonActive: {
    backgroundColor: '#BAFD00',
    borderWidth: 0,
  },
  categoryButtonText: { color: Colors.dearkOlive, fontWeight: '600', textAlign: 'center' },
  categoryButtonTextActive: { color: Colors.black, fontWeight: '800' },
  categoryButtonFullWidth: { width: '100%' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { display: 'none' },
  cancelButtonText: { color: Colors.black, fontWeight: '600' },
  saveButton: { display: 'none' },
  saveButtonText: { color: Colors.white, fontWeight: '700' },
  errorText: { color: Colors.red, marginTop: 4, fontSize: 12 },
  noteWrapper: { marginBottom: 16 },
  noteAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, backgroundColor: Colors.limeGreen },
  noteBox: { position: 'relative', backgroundColor: '#EFEFEF', borderRadius: 12, padding: 12, paddingLeft: 18 },
  noteText: { color: Colors.black, lineHeight: 20 },
  textAreaInput: { borderRadius: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gray150,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: { backgroundColor: '#BAFD00', borderColor: 'transparent' },
  checkboxTick: { color: Colors.black, fontWeight: '900', fontSize: 16 },
  checkboxLabel: { color: Colors.black, fontSize: 16 },
  bottomBar: { paddingHorizontal: 16, paddingVertical: 6 },
  bottomBarInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.black, borderRadius: 50, padding: 6 },
  closeCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.darkGray || '#222', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  primaryCTA: { flex: 1, marginLeft: 12, backgroundColor: '#BAFD00', borderRadius: 26, paddingVertical: 12, alignItems: 'center' },
  primaryCTAText: { color: Colors.black, fontSize: 18, fontWeight: '800' },
  dragIndicator: { alignSelf: 'center', width: 120, height: 6, borderRadius: 3, backgroundColor: Colors.gray200, marginTop: 4, marginBottom: 6 },
});

export default AddCustomItemModal;


