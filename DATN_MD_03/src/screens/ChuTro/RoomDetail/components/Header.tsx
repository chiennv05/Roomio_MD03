import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {Icons} from '../../../../assets/icons';
import {responsiveFont, responsiveIcon, responsiveSpacing} from '../../../../utils/responsive';

interface HeaderProps {
  onGoBack: () => void;
  onEdit: () => void;
}

const Header: React.FC<HeaderProps> = ({onGoBack, onEdit}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onGoBack}>
        <Image source={{uri: Icons.IconArrowLeft}} style={styles.icon} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chi tiết phòng</Text>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Image source={{uri: Icons.IconEditWhite}} style={styles.icon} />
        <Text style={styles.editButtonText}>Sửa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(15),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    elevation: 2,
  },
  headerTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  icon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.limeGreen,
    paddingHorizontal: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(5),
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    marginLeft: responsiveSpacing(5),
  },
});

export default Header; 