// components/ContractMenu.tsx
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {Icons} from '../../../../assets/icons';

interface Props {
  onEdit: () => void;
  onExtend: () => void;
  onTerminate: () => void;
  onUpdateTenants: () => void;
}

const ContractMenu: React.FC<Props> = ({
  onEdit,
  onExtend,
  onTerminate,
  onUpdateTenants,
}) => {
  return (
    <Menu>
      <MenuTrigger>
        <Image source={{uri: Icons.IconMoreVer}} style={styles.menuTrigger} />
      </MenuTrigger>
      <MenuOptions customStyles={menuOptionsStyles}>
        <MenuOption onSelect={onEdit}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Sửa hợp đồng</Text>
          </View>
        </MenuOption>

        <MenuOption onSelect={onExtend}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Gia hạn hợp đồng</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={onUpdateTenants}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Cập nhật người thuê</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={onTerminate}>
          <View style={styles.optionRow}>
            <Text style={[styles.optionText, {color: 'red'}]}>
              Chấm dứt hợp đồng
            </Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  menuTrigger: {
    width: 24,
    height: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});
const menuOptionsStyles = {
  optionsContainer: {
    paddingVertical: 4,
    borderRadius: 8,
    width: 200,
    elevation: 5,
  },
};

export default ContractMenu;
