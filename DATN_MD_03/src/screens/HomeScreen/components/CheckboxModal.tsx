import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';

interface CheckboxItem {
  id: string;
  label: string;
}

interface CheckboxModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: string[]) => void;
  title: string;
  subtitle: string;
  items: CheckboxItem[];
  selectedItems?: string[];
}

const CheckboxModal: React.FC<CheckboxModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  subtitle,
  items,
  selectedItems = [],
}) => {
  const [selected, setSelected] = useState<string[]>(selectedItems);

  useEffect(() => {
    if (visible) {
      setSelected(selectedItems);
    }
  }, [visible, selectedItems]);

  const handleItemToggle = (itemId: string) => {
    setSelected(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  const handleCancel = () => {
    setSelected(selectedItems);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemContainer}
                onPress={() => handleItemToggle(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemLabel}>{item.label}</Text>
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    selected.includes(item.id) && styles.checkboxSelected
                  ]}>
                    {selected.includes(item.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <ItemButtonConfirm
              title="Xác nhận"
              icon="https://cdn-icons-png.flaticon.com/512/1828/1828665.png"
              onPress={handleConfirm}
              onPressIcon={handleCancel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CheckboxModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkboxContainer: {
    marginLeft: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#BAFD00',
    borderColor: '#BAFD00',
  },
  checkmark: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 