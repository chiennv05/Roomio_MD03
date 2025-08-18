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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {RootStackParamList} from '../../types/route';
import {supportService} from '../../store/services/supportService';
import {SupportCategory, SupportPriority} from '../../types/Support';
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';
import {Icons} from '../../assets/icons';
import {CustomAlertModal, useCustomAlert} from './components';

type UpdateSupportScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UpdateSupport'
>;

type UpdateSupportRouteParams = {
  supportId: string;
};

const UpdateSupport: React.FC = () => {
  const navigation = useNavigation<UpdateSupportScreenNavigationProp>();
  const route =
    useRoute<RouteProp<Record<string, UpdateSupportRouteParams>, string>>();
  const {supportId} = route.params || {};

  // Custom Alert Hook
  const {
    alertConfig,
    visible: alertVisible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  } = useCustomAlert();

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
                  style: 'primary',
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
  }, [supportId, navigation, showConfirm]);

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
      showError('Vui lòng nhập tiêu đề');
      return;
    }

    if (!content.trim()) {
      showError('Vui lòng nhập nội dung');
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
        );
      } else {
        showSuccess(
          'Yêu cầu hỗ trợ của bạn đã được cập nhật thành công',
          'Thành công',
          false,
          () => {
            // Navigate back to refresh the list
            navigation.goBack();
          },
        );
      }
    } catch (err) {
      showError('Đã xảy ra lỗi khi cập nhật yêu cầu hỗ trợ');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          backgroundColor={Colors.limeGreen}
          barStyle="light-content"
        />
        <ActivityIndicator size="large" color={Colors.limeGreen} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar
          backgroundColor={Colors.limeGreen}
          barStyle="light-content"
        />
        <Image
          source={{uri: Icons.IconError}}
          style={styles.errorIcon}
          resizeMode="contain"
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorBackButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorBackButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.limeGreen} barStyle="light-content" />

      {/* Beautiful Header with Gradient */}
      <LinearGradient
        colors={[Colors.limeGreen, '#8BC34A']}
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
          <Text style={styles.headerTitle}>Cập nhật yêu cầu hỗ trợ</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}>
          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>📝 Tiêu đề</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề yêu cầu hỗ trợ (tối thiểu 5 ký tự)"
                placeholderTextColor={Colors.textGray}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>📄 Nội dung</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chi tiết vấn đề của bạn (tối thiểu 10 ký tự)"
                placeholderTextColor={Colors.textGray}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>🏷️ Danh mục</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsCategoryOpen(!isCategoryOpen)}>
                <Text style={styles.dropdownText}>
                  {getCategoryLabel(category)}
                </Text>
                <Image
                  source={{
                    uri: isCategoryOpen
                      ? Icons.IconArrowDown
                      : Icons.IconArrowDown,
                  }}
                  style={[
                    styles.dropdownIcon,
                    isCategoryOpen && styles.dropdownIconRotated,
                  ]}
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
                      {category === item.value && (
                        <Image
                          source={{uri: Icons.IconCheck}}
                          style={styles.checkIcon}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>⚡ Mức độ ưu tiên</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsPriorityOpen(!isPriorityOpen)}>
                <Text style={styles.dropdownText}>
                  {getPriorityLabel(priority)}
                </Text>
                <Image
                  source={{
                    uri: isPriorityOpen
                      ? Icons.IconArrowDown
                      : Icons.IconArrowDown,
                  }}
                  style={[
                    styles.dropdownIcon,
                    isPriorityOpen && styles.dropdownIconRotated,
                  ]}
                  resizeMode="contain"
                />
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
                      {priority === item.value && (
                        <Image
                          source={{uri: Icons.IconCheck}}
                          style={styles.checkIcon}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Image
                  source={{uri: Icons.IconEditWhite}}
                  style={styles.buttonIcon}
                  resizeMode="contain"
                />
                <Text style={styles.submitButtonText}>Cập nhật yêu cầu</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertConfig?.title}
        message={alertConfig?.message || ''}
        onClose={hideAlert}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  keyboardView: {
    flex: 1,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
  },
  loadingText: {
    marginTop: responsiveSpacing(10),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
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
    marginTop: responsiveSpacing(10),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
  },
  errorBackButton: {
    marginTop: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(24),
    backgroundColor: Colors.limeGreen,
    borderRadius: scale(8),
  },
  errorBackButtonText: {
    color: Colors.white,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
  },
  errorIcon: {
    width: scale(60),
    height: scale(60),
    tintColor: Colors.figmaRed,
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
  headerRight: {
    width: scale(40),
  },
  // Form Layout
  formContainer: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  formContent: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(100),
  },

  // Form Card
  formCard: {
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

  formGroup: {
    marginBottom: responsiveSpacing(20),
  },
  label: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    marginBottom: responsiveSpacing(8),
    color: Colors.black,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: scale(12),
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: scale(120),
    textAlignVertical: 'top',
  },
  // Dropdown Styles
  dropdown: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: scale(12),
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    flex: 1,
  },
  dropdownIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.textGray,
  },
  dropdownIconRotated: {
    transform: [{rotate: '180deg'}],
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
    paddingVertical: responsiveSpacing(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: Colors.limeGreen + '10',
  },
  dropdownItemText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    flex: 1,
  },
  selectedItemText: {
    color: Colors.limeGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
  checkIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.limeGreen,
  },
  // Submit Button
  submitButton: {
    backgroundColor: Colors.limeGreen,
    borderRadius: scale(12),
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveSpacing(20),
    shadowColor: Colors.limeGreen,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: Colors.textGray,
    opacity: 0.6,
  },
  buttonIcon: {
    width: scale(20),
    height: scale(20),
    marginRight: responsiveSpacing(8),
    tintColor: Colors.white,
  },
  submitButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
  },
});

export default UpdateSupport;
