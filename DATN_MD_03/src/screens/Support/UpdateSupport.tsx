import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/route';
import {supportService} from '../../store/services/supportService';
import {SupportCategory, SupportPriority} from '../../types/Support';
import {Icons} from '../../assets/icons';
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';
import {SupportHeader} from './components';
import CustomAlertModal from '../../components/CustomAlertModal';
import {useCustomAlert} from '../../hooks/useCustomAlrert';

type UpdateSupportScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UpdateSupport'
>;

type UpdateSupportRouteParams = {
  supportId: string;
};

const UpdateSupport: React.FC = () => {
  const {alertConfig, showError, showSuccess, showConfirm, hideAlert} =
    useCustomAlert();
  const navigation = useNavigation<UpdateSupportScreenNavigationProp>();
  const route =
    useRoute<RouteProp<Record<string, UpdateSupportRouteParams>, string>>();
  const {supportId} = route.params || {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<SupportCategory>('kyThuat');
  const [priority, setPriority] = useState<SupportPriority>('trungBinh');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Danh sách category
  const categories = [
    {value: 'kyThuat' as SupportCategory, label: 'Kỹ thuật'},
    {value: 'thanhToan' as SupportCategory, label: 'Thanh toán'},
    {value: 'hopDong' as SupportCategory, label: 'Hợp đồng'},
    {value: 'goiDangKy' as SupportCategory, label: 'Gói đăng ký'},
    {value: 'khac' as SupportCategory, label: 'Khác'},
  ];

  // Danh sách priority
  const priorities = [
    {value: 'cao' as SupportPriority, label: 'Cao'},
    {value: 'trungBinh' as SupportPriority, label: 'Trung bình'},
    {value: 'thap' as SupportPriority, label: 'Thấp'},
  ];

  // Fetch support request data
  useEffect(() => {
    const fetchSupportDetail = async () => {
      if (!supportId) {
        setError('Không tìm thấy ID yêu cầu hỗ trợ');
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        const response = await supportService.getSupportRequestById(supportId);
        if ('isError' in response) {
          setError(response.message);
        } else {
          const supportData = response.data.data;
          // Populate form with existing data
          setTitle(supportData.title || '');
          setContent(supportData.content || '');
          setCategory(supportData.category || 'kyThuat');
          setPriority(supportData.priority || 'trungBinh');

          // Check if the request is already completed
          if (supportData.status === 'hoanTat') {
            showConfirm(
              'Yêu cầu hỗ trợ đã được hoàn tất, không thể cập nhật.',
              () => navigation.goBack(),
              'Không thể cập nhật',
              [
                {
                  text: 'Quay lại',
                  onPress: () => navigation.goBack(),
                  style: 'cancel',
                },
              ],
            );
          }
        }
      } catch (err) {
        setError('Không thể tải thông tin yêu cầu hỗ trợ');
        console.error('Error fetching support detail:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchSupportDetail();
  }, [supportId, navigation]);

  // Hiển thị nhãn của giá trị đã chọn
  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || '';
  };

  const getPriorityLabel = (value: string) => {
    return priorities.find(pri => pri.value === value)?.label || '';
  };

  // Hàm cập nhật yêu cầu hỗ trợ
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
      const response = await supportService.updateSupportRequest(supportId, {
        title,
        content,
        category,
        priority,
      });

      if ('isError' in response) {
        showError(
          response.message || 'Đã xảy ra lỗi khi cập nhật yêu cầu hỗ trợ',
          'Lỗi',
        );
      } else {
        showSuccess(
          'Yêu cầu hỗ trợ của bạn đã được cập nhật thành công',
          'Thành công',
        );
        navigation.goBack();
      }
    } catch (error) {
      showError('Đã xảy ra lỗi khi cập nhật yêu cầu hỗ trợ', 'Lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.info} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.submitButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
      <View
        style={{
          paddingTop:
            Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        }}>
        <SupportHeader
          title="Cập nhật yêu cầu hỗ trợ"
          backgroundColor={Colors.backgroud}
        />
      </View>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tiêu đề</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề yêu cầu hỗ trợ (tối thiểu 5 ký tự)"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nội dung</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết vấn đề của bạn (tối thiểu 10 ký tự)"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Danh mục</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsCategoryOpen(!isCategoryOpen)}>
            <Text style={styles.dropdownText}>
              {getCategoryLabel(category)}
            </Text>
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
                    setCategory(item.value as SupportCategory);
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mức độ ưu tiên</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsPriorityOpen(!isPriorityOpen)}>
            <Text style={styles.dropdownText}>
              {getPriorityLabel(priority)}
            </Text>
          </TouchableOpacity>
          {isPriorityOpen && (
            <View style={styles.dropdownList}>
              {priorities.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    priority === item.value && styles.selectedItem,
                  ]}
                  onPress={() => {
                    setPriority(item.value as SupportPriority);
                    setIsPriorityOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      priority === item.value && styles.selectedItemText,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Cập nhật</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    paddingTop: responsiveSpacing(5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
  },
  loadingText: {
    marginTop: responsiveSpacing(8),
    fontSize: responsiveFont(16),
    color: Colors.textGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    padding: responsiveSpacing(20),
  },
  errorText: {
    fontSize: responsiveFont(16),
    color: Colors.figmaRed,
    textAlign: 'center',
    marginBottom: responsiveSpacing(16),
  },
  header: {
    height: scale(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
  },
  backButton: {
    padding: responsiveSpacing(4),
  },
  headerTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
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
    paddingBottom: responsiveSpacing(24),
  },
  formGroup: {
    marginBottom: responsiveSpacing(16),
  },
  label: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    marginBottom: responsiveSpacing(8),
    color: Colors.textGray,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: scale(24),
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
  submitButton: {
    backgroundColor: Colors.figmaGreen,
    borderRadius: scale(24),
    paddingVertical: responsiveSpacing(12),
    alignItems: 'center',
    marginTop: responsiveSpacing(12),
  },
  submitButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
  },
});

// Global alert modal on this screen
// (Place near root return if desired – but we only need the hook-driven modal when called)

export default UpdateSupport;
