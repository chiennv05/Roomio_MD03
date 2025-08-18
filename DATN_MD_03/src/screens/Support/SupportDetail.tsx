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
  ToastAndroid,
  StatusBar,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {supportService} from '../../store/services/supportService';
import {Support, SupportMessage} from '../../types/Support';

import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';
import {Icons} from '../../assets/icons';
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

  // Format date for messages (Facebook style)
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days} ngày`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  // Format full date for info cards
  const formatFullDate = (dateString?: string) => {
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

  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'mo':
        return {
          color: Colors.figmaRed,
          text: 'Mở',
          bgColor: Colors.lightOrangeBackground,
        };
      case 'dangXuLy':
        return {
          color: Colors.warning,
          text: 'Đang xử lý',
          bgColor: Colors.lightYellowBackground,
        };
      case 'hoanTat':
        return {
          color: Colors.limeGreen,
          text: 'Hoàn tất',
          bgColor: Colors.lightGreenBackground,
        };
      default:
        return {
          color: Colors.ashGray,
          text: 'Không xác định',
          bgColor: Colors.lightGray,
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

  // Get priority text and color
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'thap':
        return {color: Colors.limeGreen, text: 'Thấp'};
      case 'trungBinh':
        return {color: Colors.warning, text: 'Trung bình'};
      case 'cao':
        return {color: Colors.figmaRed, text: 'Cao'};
      default:
        return {color: Colors.ashGray, text: 'Không xác định'};
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Hiển thị thông báo dựa vào platform
  const showToast = (toastMessage: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
    } else {
      Alert.alert('Thông báo', toastMessage, [{text: 'OK'}], {
        cancelable: true,
      });
    }
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
      const response = await supportService.replyToSupport(
        supportId,
        message.trim(),
      );

      if ('isError' in response) {
        Alert.alert('Lỗi', response.message || 'Không thể gửi tin nhắn');
      } else {
        // Hiển thị thông báo thành công
        showToast('Gửi tin nhắn thành công');

        // Clear message input
        setMessage('');

        // Refresh support detail để hiển thị tin nhắn mới
        await fetchSupportDetail();

        // Scroll to bottom để hiển thị tin nhắn mới
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: true});
        }, 300);
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
        <TouchableOpacity style={styles.errorBackButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(supportData.status);
  const priorityInfo = getPriorityInfo(supportData.priority);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.limeGreen} barStyle="light-content" />

      {/* Beautiful Header with Gradient */}
      <LinearGradient
        colors={[Colors.limeGreen, '#8BC34A']}
        style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Image
              source={{uri: Icons.IconArrowBack}}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết yêu cầu</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {/* Support Info Card */}
          <View style={styles.card}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>{supportData.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: statusInfo.bgColor},
                ]}>
                <Text style={[styles.statusText, {color: statusInfo.color}]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Danh mục</Text>
                <Text style={styles.infoValue}>
                  {getCategoryText(supportData.category)}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Mức độ</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    {backgroundColor: priorityInfo.color + '20'},
                  ]}>
                  <Text
                    style={[styles.priorityText, {color: priorityInfo.color}]}>
                    {priorityInfo.text}
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Ngày tạo</Text>
                <Text style={styles.infoValue}>
                  {formatFullDate(supportData.createdAt)}
                </Text>
              </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>📝 Nội dung yêu cầu</Text>
              <View style={styles.contentBox}>
                <Text style={styles.contentText}>{supportData.content}</Text>
              </View>
            </View>
          </View>

          {/* Messages Section - Facebook Messenger Style */}
          {supportData.messages && supportData.messages.length > 0 && (
            <View style={styles.messagesCard}>
              <Text style={styles.sectionTitle}>💬 Tin nhắn trao đổi</Text>
              <View style={styles.messagesContainer}>
                {supportData.messages.map(
                  (msg: SupportMessage, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.messageRow,
                        msg.sender === 'user' && styles.userMessageRow,
                      ]}>
                      {/* Avatar chỉ hiển thị cho admin */}
                      {msg.sender === 'admin' && (
                        <View style={styles.adminAvatar}>
                          <Text style={styles.avatarText}>A</Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.messageContent,
                          msg.sender === 'user' && styles.userMessageContent,
                        ]}>
                        <View
                          style={[
                            styles.messageBubble,
                            msg.sender === 'admin'
                              ? styles.adminMessageBubble
                              : styles.userMessageBubble,
                          ]}>
                          <Text
                            style={[
                              styles.messageText,
                              msg.sender === 'user' && styles.userMessageText,
                            ]}>
                            {msg.message}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.messageInfo,
                            msg.sender === 'user' && styles.userMessageInfo,
                          ]}>
                          <Text style={styles.messageSender}>
                            {msg.sender === 'admin' ? 'Admin' : 'Bạn'}
                          </Text>
                          <Text style={styles.messageTime}>
                            {formatDate(msg.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ),
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Message input section - only show if status is not "hoanTat" */}
        {supportData.status !== 'hoanTat' ? (
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Nhập tin nhắn để gửi cho Admin..."
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                placeholderTextColor={Colors.textGray}
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
                  <Text style={styles.sendText}>➤</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>
              💡 Mô tả chi tiết vấn đề để được hỗ trợ tốt nhất
            </Text>
          </View>
        ) : (
          <View style={styles.completedContainer}>
            <View style={styles.completedIcon}>
              <Text style={styles.completedEmoji}>✅</Text>
            </View>
            <Text style={styles.completedTitle}>Yêu cầu đã hoàn tất</Text>
            <Text style={styles.completedMessage}>
              Cảm ơn bạn đã sử dụng dịch vụ hỗ trợ của chúng tôi
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
  backButtonText: {
    color: Colors.white,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
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
  // Content Layout
  content: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  contentContainer: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(100),
  },

  // Beautiful Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: scale(16),
    padding: responsiveSpacing(20),
    marginBottom: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },

  // Title Section
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsiveSpacing(20),
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
    marginRight: responsiveSpacing(12),
  },
  statusBadge: {
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(6),
    borderRadius: scale(20),
  },
  statusText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsiveSpacing(12),
  },
  infoCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.backgroud,
    borderRadius: scale(12),
    padding: responsiveSpacing(12),
  },
  infoLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(4),
  },
  infoValue: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  priorityBadge: {
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(4),
    borderRadius: scale(12),
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
  // Content Section
  contentSection: {
    marginTop: responsiveSpacing(20),
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(12),
  },
  contentBox: {
    backgroundColor: Colors.backgroud,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    borderLeftWidth: 4,
    borderLeftColor: Colors.limeGreen,
  },
  contentText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    lineHeight: responsiveFont(20),
  },

  // Messages Card
  messagesCard: {
    backgroundColor: Colors.white,
    borderRadius: scale(16),
    padding: responsiveSpacing(20),
    marginBottom: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  messagesContainer: {
    gap: responsiveSpacing(16),
  },

  // Facebook Messenger Style Messages
  messageRow: {
    flexDirection: 'row',
    marginBottom: responsiveSpacing(12),
    alignItems: 'flex-end',
  },
  userMessageRow: {
    flexDirection: 'row-reverse', // Avatar bên phải cho user
  },

  // Avatars
  adminAvatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#42A5F5', // Light blue for admin
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(8),
  },
  userAvatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#66BB6A', // Light green for user
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveSpacing(8), // Margin bên trái khi avatar ở bên phải
  },
  avatarText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },

  // Message Content Container
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  userMessageContent: {
    alignItems: 'flex-end', // Căn tin nhắn user về bên phải
  },

  // Message Bubbles
  messageBubble: {
    borderRadius: scale(18),
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(10),
    marginBottom: responsiveSpacing(4),
  },
  adminMessageBubble: {
    backgroundColor: '#F0F0F0', // Light gray for admin messages
    alignSelf: 'flex-start',
    borderBottomLeftRadius: scale(4),
  },
  userMessageBubble: {
    backgroundColor: '#007AFF', // Blue for user messages (like iOS Messages)
    alignSelf: 'flex-end',
    borderBottomRightRadius: scale(4),
  },

  // Message Text
  messageText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    lineHeight: responsiveFont(20),
    color: Colors.black, // Default color for admin messages
  },
  userMessageText: {
    color: Colors.white, // White text for user messages on blue background
  },

  // Message Info (sender name and time)
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: responsiveSpacing(4),
    marginTop: responsiveSpacing(2),
  },
  userMessageInfo: {
    flexDirection: 'row',
    marginLeft: 0,
    marginRight: responsiveSpacing(4),
    justifyContent: 'flex-end', // Căn phải cho thông tin user
  },
  messageSender: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.textGray,
    marginRight: responsiveSpacing(6),
  },
  messageTime: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  // Input Section
  inputSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.backgroud,
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
  },
  messageInput: {
    flex: 1,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    maxHeight: scale(100),
    minHeight: scale(40),
  },
  sendButton: {
    width: scale(44),
    height: scale(44),
    backgroundColor: Colors.limeGreen,
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveSpacing(8),
  },
  sendText: {
    fontSize: responsiveFont(18),
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  disabledButton: {
    backgroundColor: Colors.textGray,
    opacity: 0.5,
  },
  inputHint: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginTop: responsiveSpacing(8),
    textAlign: 'center',
  },

  // Completed State
  completedContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(24),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  completedIcon: {
    width: scale(60),
    height: scale(60),
    backgroundColor: Colors.limeGreen + '20',
    borderRadius: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  completedEmoji: {
    fontSize: responsiveFont(24),
  },
  completedTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  completedMessage: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
  },
});

export default SupportDetail;
