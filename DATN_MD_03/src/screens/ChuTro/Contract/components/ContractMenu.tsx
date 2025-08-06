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
import {responsiveIcon} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';

interface Props {
  onEdit: () => void;
  onExtend: () => void;
  onTerminate: () => void;
  onDeleteContract: () => void;
  onUpdateTenant: () => void; // Uncomment if needed
}

const ContractMenu: React.FC<Props> = ({
  onEdit,
  onExtend,
  onTerminate,
  onDeleteContract,
  onUpdateTenant, // Uncomment if needed
}) => {
  return (
    <Menu>
      <MenuTrigger style={styles.containerMenu}>
        <Image source={{uri: Icons.IconMoreVer}} style={styles.menuTrigger} />
      </MenuTrigger>
      <MenuOptions customStyles={menuOptionsStyles}>
        <MenuOption onSelect={onEdit}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Sửa hợp đồng</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={onUpdateTenant}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Cập nhật người ở cùng</Text>
          </View>
        </MenuOption>

        <MenuOption onSelect={onExtend}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Gia hạn hợp đồng</Text>
          </View>
        </MenuOption>

        <MenuOption onSelect={onTerminate}>
          <View style={styles.optionRow}>
            <Text style={[styles.optionText, {color: 'red'}]}>
              Chấm dứt hợp đồng
            </Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={onDeleteContract}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Xóa hợp đồng</Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  menuTrigger: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  containerMenu: {
    width: responsiveIcon(36),
    height: responsiveIcon(36),
    borderRadius: responsiveIcon(36) / 2,
    backgroundColor: Colors.backgroud,
    justifyContent: 'center',
    alignItems: 'center',
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
