import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {RootStackParamList} from '../../types/route';
import {RootState} from '../../store';
import {supportService} from '../../store/services/supportService';
import {SupportCategory, SupportPriority} from '../../types/Support';
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';
import {Icons} from '../../assets/icons';
import {SupportHeader} from './components';
import ItemButton from '../LoginAndRegister/components/ItemButton';
import CustomAlertModal from '../../components/CustomAlertModal';
import {useCustomAlert} from '../../hooks/useCustomAlrert';

// Hàm xác định mức ưu tiên theo loại yêu cầu (module-scope, dùng được ở mọi nơi)
function computePriority(cat: SupportCategory): SupportPriority {
  switch (cat) {
    case 'goiDangKy':
    case 'kyThuat':
    case 'thanhToan':
      return 'cao';
    case 'hopDong':
      return 'trungBinh';
    default:
      return 'thap';
  }
}

type AddNewSupportScreenProps = StackNavigationProp<
  RootStackParamList,
  'AddNewSupport'
>;

const AddNewSupport: React.FC = () => {
  const {alertConfig, showError, showSuccess, hideAlert, showConfirm} =
    useCustomAlert();
  const navigation = useNavigation<AddNewSupportScreenProps>();

  // Lấy thông tin user từ Redux store
  const user = useSelector((state: RootState) => state.auth.user);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<SupportCategory>('kyThuat');
  const [priority, setPriority] = useState<SupportPriority>(
    computePriority('kyThuat'),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  // Bỏ lựa chọn mức độ ưu tiên của người dùng: luôn tự động
  // const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  // Kiểm tra xem user có phải là chủ trọ không
  const isLandlord = user?.role === 'chuTro';

  // Danh sách category - chỉ hiển thị "Gói đăng ký" cho chủ trọ
  const allCategories = [
    {value: 'kyThuat' as SupportCategory, label: 'Kỹ thuật'},
    {value: 'thanhToan' as SupportCategory, label: 'Thanh toán'},
    {value: 'hopDong' as SupportCategory, label: 'Hợp đồng'},
    {value: 'goiDangKy' as SupportCategory, label: 'Gói đăng ký'},
    {value: 'khac' as SupportCategory, label: 'Khác'},
  ];

  // Lọc categories dựa trên role của user
  const categories = allCategories.filter(cat => {
    // Nếu không phải chủ trọ, loại bỏ "goiDangKy"
    if (!isLandlord && cat.value === 'goiDangKy') {
      return false;
    }
    return true;
  });

  // Đảm bảo category mặc định hợp lệ cho role hiện tại
  React.useEffect(() => {
    // Nếu user không phải chủ trọ và đang chọn "goiDangKy", chuyển về "kyThuat"
    if (!isLandlord && category === 'goiDangKy') {
      setCategory('kyThuat');
      setPriority(computePriority('kyThuat'));
    }
  }, [isLandlord, category]);

  // Danh sách priority
  const priorities = [
    {value: 'cao' as SupportPriority, label: 'Cao'},
    {value: 'trungBinh' as SupportPriority, label: 'Trung bình'},
    {value: 'thap' as SupportPriority, label: 'Thấp'},
  ];

  // Hiển thị nhãn của giá trị đã chọn
  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || '';
  };

  const getPriorityLabel = (value: string) => {
    return priorities.find(pri => pri.value === value)?.label || '';
  };

  // Hàm gửi yêu cầu hỗ trợ
  const handleSubmit = async () => {
    if (!title.trim()) {
      showError('Vui lòng nhập tiêu đề', 'Lỗi');
      return;
    }

    if (!content.trim()) {
      showError('Vui lòng nhập nội dung', 'Lỗi');
      return;
    }

    setIsLoading(true);

    try {
      const response = await supportService.createSupportRequest({
        title,
        content,
        category,
        priority,
      });

      if ('isError' in response) {
        showError(
          response.message || 'Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ',
          'Lỗi',
        );
      } else {
        showSuccess(
          'Yêu cầu hỗ trợ của bạn đã được gửi thành công',
          'Thành công',
        );
        navigation.goBack();
      }
    } catch (error) {
      showError('Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ', 'Lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
      <View
        style={{
          paddingTop:
            Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        }}>
        <SupportHeader
          title="Tạo yêu cầu hỗ trợ mới"
          backgroundColor={Colors.backgroud}
        />
      </View>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Thông tin cần được hỗ trợ</Text>

        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề yêu cầu hỗ trợ"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={Colors.textGray}
          />
        </View>

        <View style={styles.dropdownRow}>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setIsCategoryOpen(!isCategoryOpen)}>
              <Text style={styles.dropdownText}>
                {getCategoryLabel(category)}
              </Text>
              <Image
                source={{uri: Icons.IconArrowDown as any}}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {isCategoryOpen && (
              <View style={styles.dropdownList}>
                {categories.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      category === item.value && styles.selectedItem,
                    ]}
                    onPress={() => {
                      const selected = item.value as SupportCategory;
                      setCategory(selected);
                      setPriority(computePriority(selected));
                      setIsCategoryOpen(false);
                    }}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        category === item.value && styles.selectedItemText,
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.dropdownContainer}>
            {/* Ưu tiên tự động theo loại, hiển thị chỉ đọc */}
            <View style={[styles.dropdown, {opacity: 0.7}]}>
              <Text style={styles.dropdownText}>
                {getPriorityLabel(priority)}
              </Text>
              <Image
                source={{uri: Icons.IconArrowDown as any}}
                style={[styles.arrowIcon, {opacity: 0.3}]}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Nội dung sự cố</Text>

        <View style={styles.formGroup}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholderTextColor={Colors.textGray}
          />
        </View>
      </ScrollView>

      {/* Bottom Button Container */}
      <View style={styles.bottomBar}>
        <ItemButton onPress={handleSubmit} loading={isLoading} />
      </View>

      {alertConfig && (
        <CustomAlertModal
          visible={true}
          title={alertConfig.title || 'Thông báo'}
          message={alertConfig.message}
          onClose={() => {}}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    paddingTop: responsiveSpacing(5),
  },
  header: {
    height: scale(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(5),
  },
  backButton: {
    padding: responsiveSpacing(4),
  },
  backIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.black,
  },
  headerTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: scale(32),
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(80), // Giảm padding bottom vì đã có SupportButton
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(12),
  },
  formGroup: {
    marginBottom: responsiveSpacing(16),
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: scale(24), // Bo góc nhiều hơn
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: scale(150),
    textAlignVertical: 'top',
    borderRadius: scale(16),
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSpacing(12),
    marginBottom: responsiveSpacing(16),
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: scale(24),
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    flex: 1,
  },
  arrowIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.textGray,
  },
  dropdownList: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: scale(8),
    marginTop: responsiveSpacing(4),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dropdownItem: {
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  selectedItem: {
    backgroundColor: Colors.lightGreenBackground,
  },
  dropdownItemText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
  },
  selectedItemText: {
    color: Colors.figmaGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
  bottomBar: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    backgroundColor: Colors.backgroud,
  },
});

export default AddNewSupport;
