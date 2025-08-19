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
  ToastAndroid,
  StatusBar,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {supportService} from '../../store/services/supportService';
import {Support, SupportMessage} from '../../types/Support';

import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../utils/responsive';
import {SupportHeader} from './components';
import {Icons} from '../../assets/icons';
import CustomAlertModal from '../../components/CustomAlertModal';
import {useCustomAlert} from '../../hooks/useCustomAlrert';
type SupportDetailRouteParams = {
  supportId: string;
};

const SupportDetail: React.FC = () => {
  const route =
    useRoute<RouteProp<Record<string, SupportDetailRouteParams>, string>>();
  const navigation = useNavigation();
  const {supportId} = route.params || {};

  // Không cần lấy token vì supportService đã tự xử lý token
  const [supportData, setSupportData] = useState<Support | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const {alertConfig, showError, showSuccess, hideAlert} = useCustomAlert();

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
        setSupportData(data);
      }
    } catch (err) {
      setError('Không thể tải thông tin yêu cầu hỗ trợ');
      console.error('Error fetching support detail:', err);
    } finally {
      setLoading(false);
    }
  }, [supportId]);

  // Lần đầu tải dữ liệu
  useEffect(() => {
    fetchSupportDetail();
  }, [fetchSupportDetail]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status styles (match Admin UI)
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'mo':
        return {color: Colors.statusOpen, textColor: Colors.white, text: 'Mở'};
      case 'dangXuLy':
        return {
          color: Colors.warning,
          textColor: Colors.white,
          text: 'Đang xử lý',
        };
      case 'hoanTat':
        return {
          color: Colors.figmaGreen,
          textColor: Colors.white,
          text: 'Hoàn tất',
        };
      default:
        return {
          color: Colors.textGray,
          textColor: Colors.white,
          text: 'Không xác định',
        };
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
      case 'goiDangKy':
        return 'Gói đăng ký';
      case 'khac':
        return 'Khác';
      default:
        return 'Không xác định';
    }
  };

  // Get priority styles (match Admin UI)
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'thap':
        return {
          bgColor: Colors.statusLow,
          textColor: Colors.white,
          text: 'Thấp',
        };
      case 'trungBinh':
        return {
          bgColor: Colors.statusMedium,
          textColor: Colors.white,
          text: 'Trung bình',
        };
      case 'cao':
        return {
          bgColor: Colors.statusHigh,
          textColor: Colors.white,
          text: 'Cao',
        };
      default:
        return {
          bgColor: Colors.statusLow,
          textColor: Colors.white,
          text: 'Không xác định',
        };
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Hiển thị thông báo dựa vào platform
  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      // Dùng modal chung
      showSuccess(msg, 'Thông báo');
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!message.trim()) {
      showError('Vui lòng nhập nội dung tin nhắn', 'Lỗi');
      return;
    }

    if (!supportId) {
      showError('Không tìm thấy ID yêu cầu hỗ trợ', 'Lỗi');
      return;
    }

    try {
      setSendingMessage(true);

      // Gọi API gửi tin nhắn qua supportService để tự xử lý token
      const response = await supportService.replyToSupport(
        supportId,
        message.trim(),
      );

      if ('isError' in response) {
        showError(response.message || 'Không thể gửi tin nhắn', 'Lỗi');
      } else {
        // Hiển thị thông báo thành công
        showToast('Gửi tin nhắn thành công');

        // Ở lại màn chi tiết, thêm tin nhắn mới vào danh sách và cuộn xuống
        setSupportData(prev => {
          if (!prev) return prev;
          const newMsg: SupportMessage = {
            sender: 'user',
            message: message.trim(),
            createdAt: new Date().toISOString(),
          } as any;
          return {...prev, messages: [...(prev.messages || []), newMsg]};
        });
        setMessage('');
        setTimeout(
          () => scrollViewRef.current?.scrollToEnd({animated: true}),
          100,
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showError('Đã xảy ra lỗi khi gửi tin nhắn', 'Lỗi');
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
        <Image
          source={{uri: Icons.IconError as any}}
          style={{width: 60, height: 60}}
        />
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
      <View
        style={{
          paddingTop:
            Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        }}>
        <SupportHeader
          title="Chi tiết yêu cầu"
          backgroundColor={Colors.backgroud}
        />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>{supportData.title}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <View
                  style={[
                    styles.statusContainer,
                    {backgroundColor: statusInfo.color},
                  ]}>
                  <Text
                    style={[styles.statusText, {color: statusInfo.textColor}]}>
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
                    {backgroundColor: priorityInfo.bgColor},
                  ]}>
                  <Text
                    style={[
                      styles.priorityText,
                      {color: priorityInfo.textColor},
                    ]}>
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
                {supportData.messages.map(
                  (msg: SupportMessage, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.messageContainer,
                        msg.sender === 'admin'
                          ? styles.adminMessage
                          : styles.userMessage,
                      ]}>
                      <View style={styles.messageHeader}>
                        <Text
                          style={[
                            styles.messageSender,
                            msg.sender === 'admin'
                              ? styles.adminSender
                              : styles.userSender,
                          ]}>
                          {msg.sender === 'admin' ? 'Admin' : 'Khách hàng'}
                        </Text>
                        <Text style={styles.messageTime}>
                          {formatDate(msg.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.messageContent}>{msg.message}</Text>
                    </View>
                  ),
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Message input section - only show if status is not "hoanTat" */}
        {supportData.status !== 'hoanTat' ? (
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
              style={[
                styles.sendButton,
                !message.trim() && styles.disabledButton,
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim() || sendingMessage}>
              {sendingMessage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.sendText}>Gửi</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.completedMessageContainer}>
            <Text style={styles.completedMessageText}>
              Yêu cầu hỗ trợ đã hoàn tất. Không thể gửi thêm tin nhắn.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    marginTop: responsiveSpacing(5),
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
    backgroundColor: Colors.backgroud,
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(5),
  },
  headerTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  backIcon: {
    padding: responsiveSpacing(4),
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: responsiveSpacing(16),
  },
  contentContainer: {
    paddingBottom: responsiveSpacing(20),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(12),
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
    fontSize: responsiveFont(12),
    color: Colors.textGray,
    marginBottom: responsiveSpacing(4),
  },
  infoValue: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
  statusContainer: {
    borderRadius: 20,
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(6),
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
  priorityContainer: {
    borderRadius: 20,
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(6),
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
  contentSection: {
    marginTop: responsiveSpacing(16),
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(8),
  },
  contentBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: Colors.divider,
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
    borderRadius: 16,
    padding: responsiveSpacing(10),
    marginBottom: responsiveSpacing(8),
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
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#f1f8e9',
    borderColor: '#dcedc8',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing(12),
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    borderRadius: 24,
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    borderWidth: 1,
    borderColor: Colors.divider,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.figmaGreen,
    borderRadius: 24,
    paddingHorizontal: responsiveSpacing(16),
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveSpacing(8),
  },
  sendText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  disabledButton: {
    backgroundColor: Colors.gray150,
  },
  completedMessageContainer: {
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedMessageText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SupportDetail;
