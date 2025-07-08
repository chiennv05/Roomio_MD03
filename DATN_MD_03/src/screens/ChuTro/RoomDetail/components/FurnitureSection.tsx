import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface FurnitureSectionProps {
  furniture: string[] | undefined;
}

const FurnitureSection: React.FC<FurnitureSectionProps> = ({furniture}) => {
  const getFurnitureName = (code: string | undefined) => {
    if (!code) return '';
    const furnitureMap: {[key: string]: string} = {
      dieuHoa: 'Điều hòa',
      mayNuocNong: 'Máy nước nóng',
      mayGiat: 'Máy giặt',
      tuLanh: 'Tủ lạnh',
      quatTran: 'Quạt trần',
      giuongNgu: 'Giường ngủ',
      tuQuanAo: 'Tủ quần áo',
      banGhe: 'Bàn ghế',
      tivi: 'Tivi',
      bepDien: 'Bếp điện',
      bepGas: 'Bếp gas',
      bepTu: 'Bếp từ',
    };
    return furnitureMap[code] || code;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nội thất</Text>
      <View style={styles.tagContainer}>
        {furniture && furniture.length > 0 ? (
          furniture.map((item: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{getFurnitureName(item)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có nội thất</Text>
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

export default FurnitureSection; 