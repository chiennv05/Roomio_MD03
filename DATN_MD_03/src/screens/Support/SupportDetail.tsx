import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {supportService} from '../../store/services/supportService';
import {Support, SupportMessage} from '../../types/Support';
import {useAppSelector} from '../../hooks/redux';

type SupportDetailRouteParams = {
  supportId: string;
};

const SupportDetail: React.FC = () => {
  const route =
    useRoute<RouteProp<Record<string, SupportDetailRouteParams>, string>>();
  const navigation = useNavigation();
  const {supportId} = route.params || {};
  
  // Lấy token từ Redux store
  const {token} = useAppSelector(state => state.auth);

  const [supportData, setSupportData] = useState<Support | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  // Lưu ID tin nhắn cuối cùng để kiểm tra tin nhắn mới
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  // Thêm state để theo dõi việc polling
  const [isPolling, setIsPolling] = useState(true);
  // Khoảng thời gian polling (mỗi 3 giây)
  const POLLING_INTERVAL = 3000;

  const fetchSupportDetail = useCallback(async () => {
    if (!supportId) {
      setError('Không tìm thấy ID yêu cầu hỗ trợ');
      setLoading(false);
      return;
    }

    try {
      const response = await supportService.getSupportRequestById(supportId);
      if ('isError' in response) {
        setError(response.message);
      } else {
        const data = response.data.data;
        console.log('Support data:', JSON.stringify(data));
        setSupportData(data);
        
        // Cập nhật lastMessageId nếu có tin nhắn mới
        if (data.messages && data.messages.length > 0) {
          const newestMessage = data.messages[data.messages.length - 1];
          if (newestMessage._id && newestMessage._id !== lastMessageId) {
            setLastMessageId(newestMessage._id || null);
            // Cuộn xuống tin nhắn mới nhất
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({animated: true});
            }, 200);
          }
        }
      }
    } catch (err) {
      setError('Không thể tải thông tin yêu cầu hỗ trợ');
      console.error('Error fetching support detail:', err);
    } finally {
      setLoading(false);
    }
  }, [supportId, lastMessageId]);

  // Lần đầu tải dữ liệu
  useEffect(() => {
    fetchSupportDetail();
  }, [fetchSupportDetail]);

  // Thiết lập polling để cập nhật tin nhắn mới
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    if (isPolling && supportId) {
      pollingInterval = setInterval(() => {
        // Chỉ fetch khi không trong quá trình gửi tin nhắn
        if (!sendingMessage) {
          fetchSupportDetail();
        }
      }, POLLING_INTERVAL);
    }

    // Dừng polling khi component unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [fetchSupportDetail, isPolling, supportId, sendingMessage]);

  // Dừng polling khi rời khỏi màn hình
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setIsPolling(false);
    });

    return unsubscribe;
  }, [navigation]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'mo':
        return {color: '#f44336', text: 'Mở'};
      case 'dangXuLy':
        return {color: '#ff9800', text: 'Đang xử lý'};
      case 'hoanTat':
        return {color: '#4caf50', text: 'Hoàn tất'};
      default:
        return {color: '#9e9e9e', text: 'Không xác định'};
    }
  };

  // Get category text
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'kyThuat':
        return 'Kỹ thuật';
      case 'thanhToan':
        return 'Thanh toán';
      case 'hopDong':
        return 'Hợp đồng';
      case 'khac':
        return 'Khác';
      default:
        return 'Không xác định';
    }
  };

  // Get priority text and color
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'thap':
        return {color: '#4caf50', text: 'Thấp'};
      case 'trungBinh':
        return {color: '#ff9800', text: 'Trung bình'};
      case 'cao':
        return {color: '#f44336', text: 'Cao'};
      case 'khanan':
        return {color: '#d32f2f', text: 'Khẩn cấp'};
      default:
        return {color: '#9e9e9e', text: 'Không xác định'};
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung tin nhắn');
      return;
    }

    if (!supportId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID yêu cầu hỗ trợ');
      return;
    }

    try {
      setSendingMessage(true);
      
      // Gọi API gửi tin nhắn qua supportService để tự xử lý token
      const response = await supportService.replyToSupport(supportId, message.trim());
      
      if ('isError' in response) {
        Alert.alert('Lỗi', response.message || 'Không thể gửi tin nhắn');
      } else {
        // Clear the input field
        setMessage('');
        
        // Cập nhật lại danh sách tin nhắn sau khi gửi
        fetchSupportDetail();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (error || !supportData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error-outline" size={60} color="#f44336" />
        <Text style={styles.errorText}>
          {error || 'Không tìm thấy dữ liệu'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(supportData.status);
  const priorityInfo = getPriorityInfo(supportData.priority);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={handleGoBack}>
          <Image source={require('../../assets/icons/icon_arrow_back.png')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết yêu cầu</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{supportData.title}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <View
                  style={[
                    styles.statusContainer,
                    {borderColor: statusInfo.color},
                  ]}>
                  <Text style={[styles.statusText, {color: statusInfo.color}]}>
                    {statusInfo.text}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Danh mục:</Text>
                <Text style={styles.infoValue}>
                  {getCategoryText(supportData.category)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Mức độ ưu tiên:</Text>
                <View
                  style={[
                    styles.priorityContainer,
                    {borderColor: priorityInfo.color},
                  ]}>
                  <Text
                    style={[styles.priorityText, {color: priorityInfo.color}]}>
                    {priorityInfo.text}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ngày tạo:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(supportData.createdAt)}
                </Text>
              </View>
            </View>

            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>Nội dung yêu cầu</Text>
              <View style={styles.contentBox}>
                <Text style={styles.contentText}>{supportData.content}</Text>
              </View>
            </View>

    
            
            {/* Hiển thị tin nhắn trao đổi */}
            {supportData.messages && supportData.messages.length > 0 && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Tin nhắn trao đổi</Text>
                {supportData.messages.map((msg: SupportMessage, index: number) => (
                  <View 
                    key={index} 
                    style={[
                      styles.messageContainer,
                      msg.sender === 'admin' ? styles.adminMessage : styles.userMessage,
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      <Text style={[
                        styles.messageSender,
                        msg.sender === 'admin' ? styles.adminSender : styles.userSender
                      ]}>
                        {msg.sender === 'admin' ? 'Admin' : 'Khách hàng'}
                      </Text>
                      <Text style={styles.messageTime}>
                        {formatDate(msg.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.messageContent}>{msg.message}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        
        {/* Message input section - always show regardless of status */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Nhập tin nhắn để gửi cho Admin"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.disabledButton]} 
            onPress={handleSendMessage}
            disabled={!message.trim() || sendingMessage}>
            {sendingMessage ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.sendText}>Gửi</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 5,
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  backIcon: {
    padding: 5,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  statusContainer: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityContainer: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contentBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  responseBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  contentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  messageContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    maxWidth: '85%',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminSender: {
    color: '#0277BD',
  },
  userSender: {
    color: '#558B2F',
  },
  messageContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 8,
  },
  adminMessage: {
    backgroundColor: '#e3f2fd',
    borderColor: '#bbdefb',
    alignSelf: 'flex-start', // Admin bên trái
  },
  userMessage: {
    backgroundColor: '#f1f8e9',
    borderColor: '#dcedc8',
    alignSelf: 'flex-end', // Khách hàng bên phải
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#bdbdbd',
  },
});

export default SupportDetail;
