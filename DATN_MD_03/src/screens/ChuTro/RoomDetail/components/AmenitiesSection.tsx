import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface AmenitiesSectionProps {
  amenities: string[] | undefined;
}

const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({amenities}) => {
  const getAmenityName = (code: string | undefined) => {
    if (!code) return '';
    const amenityMap: {[key: string]: string} = {
      vsKhepKin: 'Vệ sinh khép kín',
      gacXep: 'Gác xép',
      thangMay: 'Thang máy',
      baoVe247: 'Bảo vệ 24/7',
      guiXeDien: 'Gửi xe điện',
      guiXeMay: 'Gửi xe máy',
      wifiTraPhi: 'Wifi trả phí',
      raVaoVanTay: 'Ra vào vân tay',
      banCong: 'Ban công',
      khongChungChu: 'Không chung chủ',
      choDeXeOto: 'Chỗ để xe ô tô',
      sanThuong: 'Sân thượng',
      bep: 'Bếp',
      cctv: 'Camera an ninh',
    };
    return amenityMap[code] || code;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tiện ích</Text>
      <View style={styles.tagContainer}>
        {amenities && amenities.length > 0 ? (
          amenities.map((item: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{getAmenityName(item)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có tiện ích</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: responsiveSpacing(15),
    marginTop: responsiveSpacing(15),
    borderRadius: 10,
    padding: responsiveSpacing(15),
    elevation: 2,
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(10),
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: responsiveSpacing(5),
  },
  tag: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(5),
    borderRadius: 20,
    marginRight: responsiveSpacing(8),
    marginBottom: responsiveSpacing(8),
  },
  tagText: {
    fontSize: responsiveFont(12),
    color: Colors.black,
  },
  emptyText: {
    color: Colors.textGray,
    fontSize: responsiveFont(14),
  },
});

export default AmenitiesSection; 