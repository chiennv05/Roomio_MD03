import React from 'react';
import {View, Text, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  scale,
  SCREEN,
  verticalScale,
} from '../../../../utils/responsive';
import {Images} from '../../../../assets/images';

interface EmptyRoomProps {
  loading?: boolean;
  isSearching?: boolean;
  isFiltering?: boolean;
}

const EmptyRoom: React.FC<EmptyRoomProps> = ({
  loading = false,
  isSearching = false,
  isFiltering = false,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.limeGreen} />
        <Text style={[styles.description, {marginTop: verticalScale(12)}]}>
          Đang tải dữ liệu...
        </Text>
      </View>
    );
  }

  let title = 'Chưa có phòng';
  let description =
    'Bạn chưa có phòng nào. Phòng sẽ hiển thị ở đây sau khi bạn tạo phòng.';

  if (isSearching) {
    title = 'Không tìm thấy phòng';
    description = 'Hãy thử từ khóa khác hoặc bỏ bộ lọc để xem tất cả phòng.';
  } else if (isFiltering) {
    title = 'Không có phòng trong trạng thái này';
    description = 'Hãy thử chọn trạng thái khác để xem danh sách phòng.';
  }

  return (
    <View style={styles.container}>
      <Image source={{uri: Images.ImageRoomOutline}} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  icon: {
    width: scale(160),
    height: scale(160),
    tintColor: Colors.gray150,
    marginBottom: verticalScale(16),
  },
  title: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(20),
    color: Colors.black,
    marginBottom: verticalScale(8),
    textAlign: 'center',
    fontWeight: '700',
  },
  description: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.gray60,
    textAlign: 'center',
    lineHeight: verticalScale(22),
    width: SCREEN.width * 0.7,
  },
});

export default EmptyRoom;
