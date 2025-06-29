import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../../../utils/responsive';

interface OwnerInfoProps {
  avatar?: string;
  name: string;
  phone: string;
}

const OwnerInfo: React.FC<OwnerInfoProps> = ({ name, phone }) => {
  // Create avatar letter from first letter of name
  const getAvatarLetter = (ownerName: string) => {
    if (!ownerName || ownerName === 'Chủ trọ') return 'C';
    return ownerName.charAt(0).toUpperCase();
  };

  const avatarLetter = getAvatarLetter(name);

  return (
    <View style={styles.container}>
      <View style={styles.ownerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.ownerName}>{name}</Text>
          <Text style={styles.phoneNumber}>{phone}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(16),
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: responsiveSpacing(12),
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.colorAvata,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(12),
  },
  avatarText: {
    fontSize: responsiveFont(20),
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  nameContainer: {
    flex: 1,
  },
  ownerName: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(2),
  },
  phoneNumber: {
    fontSize: responsiveFont(15),
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Regular,
    fontWeight: "bold"
    
  },
});

export default OwnerInfo;
