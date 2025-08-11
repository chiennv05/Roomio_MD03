import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/color';
import { Fonts } from '../../theme/fonts';
import { Icons } from '../../assets/icons';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../utils/responsive';

const PolicyTerms = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={{uri: Icons.IconOut}}
            style={{width: responsiveFont(24), height: responsiveFont(24)}}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều khoản & Chính sách</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Điều khoản sử dụng</Text>
          <Text style={styles.paragraph}>
            Khi sử dụng ứng dụng Roomio, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây.
            Chúng tôi có thể cập nhật hoặc thay đổi các điều khoản này bất kỳ lúc nào mà không cần thông báo trước.
            Việc bạn tiếp tục sử dụng ứng dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Quy định đăng tin</Text>
          <Text style={styles.paragraph}>
            Người dùng chịu trách nhiệm về tính chính xác và đầy đủ của thông tin đăng tải.
            Chúng tôi có quyền từ chối hoặc gỡ bỏ bất kỳ bài đăng nào vi phạm quy định của pháp luật hoặc không phù hợp với cộng đồng.
            Nghiêm cấm đăng thông tin sai sự thật, gây hiểu nhầm hoặc có nội dung phân biệt đối xử.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Chính sách bảo mật</Text>
          <Text style={styles.paragraph}>
            Chúng tôi thu thập thông tin cá nhân của bạn như tên, email, số điện thoại nhằm mục đích cung cấp dịch vụ tốt hơn.
            Chúng tôi cam kết không chia sẻ thông tin của bạn với bên thứ ba mà không có sự đồng ý.
            Bạn có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân bất kỳ lúc nào.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Quyền sở hữu trí tuệ</Text>
          <Text style={styles.paragraph}>
            Tất cả các nội dung trong ứng dụng Roomio như logo, biểu tượng, hình ảnh, văn bản là tài sản của chúng tôi.
            Bạn không được sao chép, sửa đổi, phân phối hoặc sử dụng lại bất kỳ nội dung nào mà không có sự đồng ý trước bằng văn bản.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Giới hạn trách nhiệm</Text>
          <Text style={styles.paragraph}>
            Chúng tôi nỗ lực cung cấp thông tin chính xác nhưng không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng ứng dụng.
            Người dùng tự chịu trách nhiệm khi tương tác với các bên khác trong ứng dụng.
            Chúng tôi khuyến nghị người dùng kiểm tra kỹ thông tin trước khi đưa ra quyết định.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(16),
    height: moderateScale(56),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    padding: responsiveSpacing(8),
  },
  backIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  headerTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  placeholder: {
    width: moderateScale(40),
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(40),
  },
  section: {
    marginBottom: responsiveSpacing(24),
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(12),
  },
  paragraph: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    lineHeight: responsiveFont(22),
  },
});

export default PolicyTerms;
