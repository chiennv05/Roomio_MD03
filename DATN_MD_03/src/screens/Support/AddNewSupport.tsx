import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {RootStackParamList} from '../../types/route';
import {RootState} from '../../store';
import {supportService} from '../../store/services/supportService';
import {SupportCategory, SupportPriority} from '../../types/Support';
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';
import {Icons} from '../../assets/icons';
import ItemButton from '../LoginAndRegister/components/ItemButton';

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

  // Danh sách priority với màu đồng bộ admin
  const priorities = [
    {
      value: 'cao' as SupportPriority,
      label: 'Cao',
      color: Colors.statusHigh,
      bgColor: Colors.statusHighBg,
    },
    {
      value: 'trungBinh' as SupportPriority,
      label: 'Trung bình',
      color: Colors.statusMedium,
      bgColor: Colors.statusMediumBg,
    },
    {
      value: 'thap' as SupportPriority,
      label: 'Thấp',
      color: Colors.statusLow,
      bgColor: Colors.statusLowBg,
    },
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
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
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
        Alert.alert(
          'Lỗi',
          response.message || 'Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ',
        );
      } else {
        Alert.alert(
          'Thành công',
          'Yêu cầu hỗ trợ của bạn đã được gửi thành công',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to refresh the list
                navigation.goBack();
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.limeGreen} barStyle="light-content" />

      {/* Beautiful Header with Gradient */}
      <LinearGradient
        colors={[Colors.limeGreen, Colors.limeGreen]}
        style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={{uri: Icons.IconArrowBack}}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo yêu cầu hỗ trợ mới</Text>
          <View style={styles.rightPlaceholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}>
        {/* Support Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image
              source={{uri: Icons.IconReport}}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>Thông tin cần được hỗ trợ</Text>
          </View>

          <View style={styles.inputContainer}>
            <Image
              source={{uri: Icons.IconEditBlack}}
              style={styles.inputIcon}
              resizeMode="contain"
            />
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
              <View style={styles.dropdownWrapper}>
                <Image
                  source={{uri: Icons.IconReport}}
                  style={styles.dropdownIcon}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setIsCategoryOpen(!isCategoryOpen)}>
                  <Text style={styles.dropdownText}>
                    {getCategoryLabel(category)}
                  </Text>
                  <Image
                    source={{uri: Icons.IconArrowDown}}
                    style={styles.arrowIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
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
              <View style={styles.dropdownWrapper}>
                <Image
                  source={{uri: Icons.IconWarning}}
                  style={styles.dropdownIcon}
                  resizeMode="contain"
                />
                <View style={styles.dropdownDisabled}>
                  <Text style={styles.dropdownText}>
                    {getPriorityLabel(priority)}
                  </Text>
                  <Image
                    source={{uri: Icons.IconArrowDown}}
                    style={styles.arrowIconDisabled}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image
              source={{uri: Icons.IconEditBlack}}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>Nội dung sự cố</Text>
          </View>

          <View style={styles.textAreaContainer}>
            <Image
              source={{uri: Icons.IconEditBlack}}
              style={styles.textAreaIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.textArea}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              placeholderTextColor={Colors.textGray}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button Container */}
      <View style={styles.bottomBar}>
        <ItemButton onPress={handleSubmit} loading={isLoading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },

  // Beautiful Header
  headerGradient: {
    paddingBottom: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  header: {
    height: scale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(8),
  },

  backButton: {
    padding: responsiveSpacing(8),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  backIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.white,
  },

  headerTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },

  rightPlaceholder: {
    width: scale(40),
  },
  // Form Container
  formContainer: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },

  formContent: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(100),
  },

  // Beautiful Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: scale(16),
    padding: responsiveSpacing(20),
    marginBottom: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },

  cardIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.limeGreen,
    marginRight: responsiveSpacing(12),
  },

  cardTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
  },
  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    borderRadius: scale(12),
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(4),
    borderWidth: 1,
    borderColor: Colors.divider,
  },

  inputIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.limeGreen,
    marginRight: responsiveSpacing(12),
  },

  input: {
    flex: 1,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    paddingVertical: responsiveSpacing(12),
  },

  // Text Area
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroud,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'flex-start',
  },

  textAreaIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.limeGreen,
    marginRight: responsiveSpacing(12),
    marginTop: responsiveSpacing(2),
  },

  textArea: {
    flex: 1,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    minHeight: scale(120),
    textAlignVertical: 'top',
  },
  // Dropdown Styles
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSpacing(12),
  },

  dropdownContainer: {
    flex: 1,
  },

  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    borderRadius: scale(12),
    paddingLeft: responsiveSpacing(16),
    borderWidth: 1,
    borderColor: Colors.divider,
  },

  dropdownIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.limeGreen,
    marginRight: responsiveSpacing(12),
  },

  dropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(12),
    paddingRight: responsiveSpacing(16),
  },

  dropdownDisabled: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(12),
    paddingRight: responsiveSpacing(16),
    opacity: 0.6,
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

  arrowIconDisabled: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.textGray,
    opacity: 0.5,
  },

  dropdownList: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: scale(12),
    marginTop: responsiveSpacing(8),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },

  dropdownItem: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(14),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  selectedItem: {
    backgroundColor: Colors.limeGreenLight,
  },

  dropdownItemText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
  },

  selectedItemText: {
    color: Colors.limeGreen,
    fontFamily: Fonts.Roboto_Bold,
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default AddNewSupport;
