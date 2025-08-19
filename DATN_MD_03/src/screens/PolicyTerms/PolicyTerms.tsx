import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/color';
import { Fonts } from '../../theme/fonts';
import { Icons } from '../../assets/icons';
import { responsiveFont, responsiveSpacing } from '../../utils/responsive';
import UIHeader from '../ChuTro/MyRoom/components/UIHeader';

const PolicyTerms = () => {
  const navigation = useNavigation();
  
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.backgroud}
        barStyle="dark-content"
        translucent
      />
      <View style={[styles.headerContainer, {marginTop: statusBarHeight + 5}]}>
        <UIHeader
          title="Điều khoản & Chính sách"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
          color={Colors.backgroud}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Terms Sections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>1</Text>
            </View>
            <View >
              <Text >Điều khoản sử dụng</Text>
              <Text >Terms of Use</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Khi sử dụng ứng dụng Roomio, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây.
              </Text>
            </View>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Chúng tôi có thể cập nhật hoặc thay đổi các điều khoản này bất kỳ lúc nào mà không cần thông báo trước.
              </Text>
            </View>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Việc bạn tiếp tục sử dụng ứng dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>2</Text>
            </View>
            <View >
              <Text style={styles.sectionTitle}>Quy định đăng tin</Text>
              <Text >Posting Regulations</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Người dùng chịu trách nhiệm về tính chính xác và đầy đủ của thông tin đăng tải.
              </Text>
            </View>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Chúng tôi có quyền từ chối hoặc gỡ bỏ bất kỳ bài đăng nào vi phạm quy định của pháp luật.
              </Text>
            </View>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Nghiêm cấm đăng thông tin sai sự thật, gây hiểu nhầm hoặc có nội dung phân biệt đối xử.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>3</Text>
            </View>
            <View >
              <Text style={styles.sectionTitle}>Chính sách bảo mật</Text>
              <Text >Privacy Policy</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <View >
              <View  />
              <Text style={styles.paragraph}>
                Chúng tôi thu thập thông tin cá nhân của bạn như tên, email, số điện thoại.
              </Text>
            </View>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Chúng tôi cam kết không chia sẻ thông tin của bạn với bên thứ ba mà không có sự đồng ý.
              </Text>
            </View>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Bạn có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân bất kỳ lúc nào.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>4</Text>
            </View>
            <View >
              <Text style={styles.sectionTitle}>Quyền sở hữu trí tuệ</Text>
              <Text >Intellectual Property</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <View >
              <View  />
              <Text style={styles.paragraph}>
                Tất cả các nội dung trong ứng dụng Roomio như logo, biểu tượng, hình ảnh, văn bản là tài sản của chúng tôi.
              </Text>
            </View>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Bạn không được sao chép, sửa đổi, phân phối hoặc sử dụng lại bất kỳ nội dung nào.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>5</Text>
            </View>
            <View >
              <Text style={styles.sectionTitle}>Giới hạn trách nhiệm</Text>
              <Text >Limitation of Liability</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <View >
              <View />
              <Text style={styles.paragraph}>
                Chúng tôi nỗ lực cung cấp thông tin chính xác nhưng không chịu trách nhiệm về bất kỳ thiệt hại nào.
              </Text>
            </View>
            <View >
              <View  />
              <Text style={styles.paragraph}>
                Người dùng tự chịu trách nhiệm khi tương tác với các bên khác trong ứng dụng.
              </Text>
            </View>
            <View >
              <View  />
              <Text style={styles.paragraph}>
                Chúng tôi khuyến nghị người dùng kiểm tra kỹ thông tin trước khi đưa ra quyết định.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  headerContainer: {
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(40),
  },
  introCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: responsiveSpacing(24),
    marginBottom: responsiveSpacing(24),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  introTitle: {
    fontSize: responsiveFont(22),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
    marginBottom: responsiveSpacing(8),
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: responsiveFont(24),
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: responsiveSpacing(24),
    marginBottom: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(20),
  },
  sectionNumber: {
    width: responsiveSpacing(32),
    height: responsiveSpacing(32),
    borderRadius: responsiveSpacing(16),
    backgroundColor: Colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(16),
  },
  sectionNumberText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
    flex: 1,
  },
  sectionContent: {
    paddingLeft: responsiveSpacing(48),
  },
  paragraph: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    lineHeight: responsiveFont(26),
    marginBottom: responsiveSpacing(16),
  },
  footer: {
    backgroundColor: Colors.lightGreenBackground,
    borderRadius: 20,
    padding: responsiveSpacing(24),
    marginTop: responsiveSpacing(16),
    alignItems: 'center',
  },
  footerText: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
  },
  footerSubtext: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.gray60,
    textAlign: 'center',
  },
});

export default PolicyTerms;
