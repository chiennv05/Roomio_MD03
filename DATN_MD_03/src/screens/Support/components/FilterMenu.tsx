import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../utils/responsive';

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
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}>
        <Text style={styles.selectorText}>{selectedOption.label}</Text>
        <Image
          source={require('../../../assets/icons/icon_arrowdown.png')}
          style={styles.arrowIcon}
          resizeMode="contain"
        />
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
                {option.key === selectedValue && (
                  <Image
                    source={require('../../../assets/icons/icon_check.png')}
                    style={styles.checkIcon}
                    resizeMode="contain"
                  />
                )}
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
    marginVertical: responsiveSpacing(8),
    flex: 0.48, // Make each filter take up almost half the width
  },
  title: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(6),
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: scale(8),
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(10),
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectorText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    flex: 1,
  },
  arrowIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.textGray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    borderRadius: scale(6),
    marginBottom: responsiveSpacing(2),
  },
  optionText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    flex: 1,
  },
  selectedOption: {
    backgroundColor: Colors.lightGreenBackground,
  },
  selectedOptionText: {
    color: Colors.primaryGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
  checkIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.primaryGreen,
  },
});

export default FilterMenu;
