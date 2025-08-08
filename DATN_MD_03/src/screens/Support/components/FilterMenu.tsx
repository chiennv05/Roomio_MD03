import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';

interface FilterOption {
  key: string;
  label: string;
}

interface FilterMenuProps {
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(
    option => option.key === selectedValue,
  ) || {label: 'Tất cả'};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.selectorText}>{selectedOption.label}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            {options.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionItem,
                  option.key === selectedValue && styles.selectedOption,
                ]}
                onPress={() => {
                  onSelect(option.key);
                  setModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.optionText,
                    option.key === selectedValue && styles.selectedOptionText,
                  ]}>
                  {option.label}
                </Text>
                {option.key === selectedValue}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    flex: 0.48, // Make each filter take up almost half the width
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOption: {
    backgroundColor: '#e8f5e9',
  },
  selectedOptionText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default FilterMenu;
