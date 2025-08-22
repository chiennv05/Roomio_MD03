import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';
import { Colors } from '../../../theme/color';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';

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
  const insets = useSafeAreaInsets();
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

  const handleReset = () => {
    // Reset về rỗng (xóa tất cả filter)
    onConfirm([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
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
                    selected.includes(item.id) && styles.checkboxSelected,
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
              icon={Icons.IconRemoveWhite}
              onPress={handleConfirm}
              onPressIcon={handleReset}
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
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    padding: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(10),
  },
  title: {
    fontSize: responsiveFont(24),
    fontWeight: 'bold',
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(4),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemLabel: {
    fontSize: responsiveFont(16),
    color: Colors.darkGray,
    flex: 1,
  },
  checkboxContainer: {
    marginLeft: responsiveSpacing(16),
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(4),
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
  },
  checkmark: {
    color: Colors.darkGray,
    fontSize: responsiveFont(14),
    fontWeight: 'bold',
  },
  footer: {
    padding: responsiveSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
