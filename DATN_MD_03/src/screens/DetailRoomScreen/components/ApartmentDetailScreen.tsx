import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../../../theme/color';
import Header from '../components/Header';
import ImageCarousel from '../components/ImageCarousel';
import RoomInfo from '../components/RoomInfo';
import ServiceFees from '../components/ServiceFees';
import Amenities from '../components/Amenities';
import OwnerInfo from '../components/OwnerInfo';
import Description from '../components/Description';
import RelatedPosts from '../components/RelatedPosts';

const ApartmentDetailScreen: React.FC = () => {
  const images = ['https://images.unsplash.com/photo-1506744038136-46273834b3fb'];
  const info = { floor: 4, area: '50m²', people: 3, deposit: '6 tháng' };
  const fees = { wifi: '3.500/kWh', electricity: '100.000/người', service: '100.000/người', water: '80.000/người' };
  const posts = [
    {
      image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
      title: 'Phòng trọ khép kín tại Louis City',
      price: '3.600.000đ/tháng',
      address: 'Hoàng Mai, Hà Nội',
    },
    {
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
      title: 'Căn hộ cao cấp full đồ',
      price: '5.000.000đ/tháng',
      address: 'Tây Hồ, Hà Nội',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroud }}>
      <Header />
      <ScrollView>
        <ImageCarousel images={images} />
        <View style={styles.content}>
          <RoomInfo
            name="Chung cư mini giá tốt tại Tạ Quang Bửu"
            price="3.200.000đ"
            address="337/42 phố Bạch Mai, Tạ Quang Bửu, Hà Nội"
            roomCode="P108"
            selectedType={0}
            info={info}
          />
          <ServiceFees fees={fees} />
          <Amenities />
          <OwnerInfo
            avatar="https://randomuser.me/api/portraits/men/41.jpg"
            name="Đặng Việt Dũng"
            posts={19}
          />
          <Description text="Phòng trọ khép kín 40m2 mới xây hoàn thiện bàn giao 10/2/2025 tại louis city Hoàng mai khu đô thị mới văn minh hiện đại, nội thất gồm điều hòa, nóng lạnh, tủ lạnh, máy giặt, giường, bếp, rèm cửa, ban ghế y hình ... cửa khóa vân tay, giờ giấc tự do, không chung chủ. Hỗ trợ về làm thêm bán thời gian cho sinh viên và người có thu nhập kèm. Trân trọng" />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Xem điều khoản và điều kiện</Text>
          </TouchableOpacity>
          <RelatedPosts posts={posts} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: 14, paddingTop: 6 },
  button: {
    backgroundColor: Colors.limeGreenLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.limeGreen,
  },
  buttonText: { 
    color: Colors.limeGreen, 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

export default ApartmentDetailScreen;
