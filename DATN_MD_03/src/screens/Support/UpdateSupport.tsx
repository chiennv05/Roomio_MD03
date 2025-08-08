import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/route';
import {supportService} from '../../store/services/supportService';
import {SupportCategory, SupportPriority} from '../../types/Support';

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
            Alert.alert(
              'Không thể cập nhật',
              'Yêu cầu hỗ trợ đã được hoàn tất, không thể cập nhật.',
              [
                {
                  text: 'Quay lại',
                  onPress: () => navigation.goBack(),
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
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
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
        Alert.alert(
          'Lỗi',
          response.message || 'Đã xảy ra lỗi khi cập nhật yêu cầu hỗ trợ',
        );
      } else {
        Alert.alert(
          'Thành công',
          'Yêu cầu hỗ trợ của bạn đã được cập nhật thành công',
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
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật yêu cầu hỗ trợ');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/icons/icon_arrow_back.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật yêu cầu hỗ trợ</Text>
        <View style={styles.rightPlaceholder} />
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
    backgroundColor: '#f5f5f5',
    marginTop: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightPlaceholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
  },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  selectedItemText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UpdateSupport;
