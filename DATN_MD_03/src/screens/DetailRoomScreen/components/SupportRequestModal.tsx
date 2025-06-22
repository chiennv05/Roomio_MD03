import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont, responsiveIcon } from '../../../utils/responsive';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';

interface SupportRequestModalProps {}

const SupportRequestModal = forwardRef<BottomSheet, SupportRequestModalProps>((props, ref) => {
  // Tạo snap points cho bottom sheet
  const snapPoints = useMemo(() => ['25%', '55%'], []);

  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [description, setDescription] = React.useState<string>('');

  const supportOptions = useMemo(() => [
    { id: 'not_match_info', title: 'Thông tin không trùng khớp' },
    { id: 'no_contact_owner', title: 'Không liên hệ được chủ nhà' },
    { id: 'room_not_exist', title: 'Phòng không tồn tại' },
    { id: 'wrong_listing', title: 'Bài đăng bị trùng lặp' },
  ], []);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleSubmit = useCallback(() => {
    // Xử lý gửi yêu cầu hỗ trợ
    Alert.alert(
      'Yêu cầu đã được gửi',
      `Các vấn đề đã chọn: ${selectedOptions.length} mục\nMô tả: ${description || 'Không có'}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedOptions([]);
            setDescription('');
            // Đóng modal
            (ref as React.RefObject<BottomSheet>)?.current?.close();
          }
        }
      ]
    );
  }, [selectedOptions, description, ref]);

  const handleClose = useCallback(() => {
    (ref as React.RefObject<BottomSheet>)?.current?.close();
  }, [ref]);

  // Tạo backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Yêu cầu hỗ trợ</Text>
          <Text style={styles.subtitle}>
            Gửi yêu cầu hỗ trợ bạn có thể hỗ trợ ban
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.itemContainer}
              onPress={() => handleOptionToggle(option.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemLabel}>{option.title}</Text>
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  selectedOptions.includes(option.id) && styles.checkboxSelected
                ]}>
                  {selectedOptions.includes(option.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Description Input */}
          <View style={styles.descriptionContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Mô tả chi tiết vấn đề bạn cần được hỗ trợ (không bắt buộc)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <ItemButtonConfirm
            title="Gửi yêu cầu hỗ trợ"
            icon={Icons.IconRemoveWhite}
            onPress={handleSubmit}
            onPressIcon={handleClose}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

SupportRequestModal.displayName = 'SupportRequestModal';

export default SupportRequestModal;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: responsiveSpacing(20),
    borderTopRightRadius: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: Colors.textGray,
    width: responsiveSpacing(40),
    height: responsiveSpacing(4),
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    padding: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(10),
  },
  title: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemLabel: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    flex: 1,
  },
  checkboxContainer: {
    marginLeft: responsiveSpacing(16),
  },
  checkbox: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    borderRadius: responsiveSpacing(4),
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
  },
  checkmark: {
    color: Colors.black,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
  },
  descriptionContainer: {
    marginTop: responsiveSpacing(20),
    paddingTop: responsiveSpacing(20),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: responsiveSpacing(8),
    padding: responsiveSpacing(12),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    backgroundColor: Colors.white,
    height: responsiveSpacing(100),
    textAlignVertical: 'top',
  },
  footer: {
    padding: responsiveSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 