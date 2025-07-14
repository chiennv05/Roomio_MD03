// components/ContractMenu.tsx
import React from 'react';
import {Image, StyleSheet} from 'react-native';
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
}

const ContractMenu: React.FC<Props> = ({onEdit, onExtend, onTerminate}) => {
  return (
    <Menu>
      <MenuTrigger>
        <Image
          source={{uri: Icons.IconRemoveFilter}}
          style={styles.menuTrigger}
        />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={onEdit} text="Sửa hợp đồng" />
        <MenuOption onSelect={onExtend} text="Gia hạn hợp đồng" />
        <MenuOption onSelect={onTerminate} text="Chấm dứt hợp đồng" />
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  menuTrigger: {
    width: 24,
    height: 24,
  },
});

export default ContractMenu;
