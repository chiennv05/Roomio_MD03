import React from 'react';
import {View, Text, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  scale,
  verticalScale,
} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';

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
      <Image source={{uri: Icons.IconRoomOutline}} style={styles.icon} />
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
    width: scale(80),
    height: scale(80),
    tintColor: Colors.gray150,
    marginBottom: verticalScale(16),
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.textGray,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  description: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: verticalScale(22),
  },
});

export default EmptyRoom;
