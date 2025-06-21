import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../../../utils/responsive';

interface OwnerInfoProps {
  avatar: string;
  name: string;
  phone: string;
}

const OwnerInfo: React.FC<OwnerInfoProps> = ({ avatar, name, phone }) => {
  return (
    <View style={styles.container}>
      <View style={styles.ownerRow}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
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
