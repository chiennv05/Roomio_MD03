import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';

import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
  scale,
  SCREEN,
  verticalScale,
} from '../../../utils/responsive';
import {AppDispatch} from '../../../store';
import {updateTenants} from '../../../store/slices/contractSlice';
import CustomAlertModal from '../../../components/CustomAlertModal';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import {useAppSelector} from '../../../hooks';

import ModalLoading from '../AddRoom/components/ModalLoading';
import ItemCotenants from './components/ItemCotenants';
import ItemHelpText from './components/ItemHelpText';

const UpdateTenant = () => {
  const navigation = useNavigation();

  const dispatch = useDispatch<AppDispatch>();
  const {selectedContractLoading, selectedContract} = useAppSelector(
    state => state.contract,
  );
  const cotenants = useMemo(() => {
    return selectedContract?.contractInfo?.coTenants || [];
  }, [selectedContract]);

  const maxOccupancy = selectedContract?.contractInfo?.maxOccupancy || 0;

  const contractId = selectedContract?._id || '';
  const [usernameTenants, setUsernameTenants] = useState<string[]>(
    cotenants.map(t => t.username),
  );
  const [newUsername, setNewUsername] = useState('');
  const {
    alertConfig,
    visible: alertVisible,
    showError,
    showSuccess,
    hideAlert,
    showConfirm,
  } = useCustomAlert();

  const maxCoTenants = useMemo(
    () => Math.max(0, maxOccupancy - 1),
    [maxOccupancy],
  );
  const canAddMore = useMemo(
    () => cotenants.length < maxCoTenants,
    [cotenants.length, maxCoTenants],
  );
  const handleAddTenant = useCallback(async () => {
    try {
      const usernames = newUsername
        .split(',') // tách theo dấu phẩy
        .map(u => u.trim()) // bỏ khoảng trắng thừa
        .filter(u => u.length > 0); // bỏ chuỗi rỗng

      if (usernames.length === 0) {
        showError('Vui lòng nhập username', 'Lỗi', true);
        return;
      }

      // Check từng username
      const repUsername = selectedContract?.tenantId.username;
      if (repUsername && usernames.includes(repUsername)) {
        showError(
          `Username "${repUsername}" đang là người đại diện`,
          'Lỗi',
          true,
        );
        return;
      }

      // 2) Check trùng với danh sách hiện tại
      const duplicated = usernames.find(
        u =>
          usernameTenants.includes(u) || cotenants.some(t => t.username === u),
      );
      if (duplicated) {
        showError(
          `Username "${duplicated}" đã tồn tại trong danh sách`,
          'Lỗi',
          true,
        );
        return;
      }

      // Check giới hạn
      if (usernameTenants.length + usernames.length > maxCoTenants) {
        showError(
          `Phòng này chỉ cho phép tối đa ${maxOccupancy} người ở`,
          'Vượt giới hạn',
          true,
        );
        return;
      }

      const newList = [...usernameTenants, ...usernames];
      setUsernameTenants(newList);

      const addTenant = await dispatch(
        updateTenants({
          contractId,
          usernames: newList,
          apply: true,
        }),
      ).unwrap();

      if (addTenant.success) {
        showSuccess('Thêm người ở cùng thành công', 'Thành công', true);
      } else {
        setUsernameTenants(usernameTenants);
        showError(addTenant.message || 'Có lỗi xảy ra', 'Lỗi', true);
      }

      setNewUsername('');
    } catch (error: any) {
      setUsernameTenants(usernameTenants);
      setNewUsername('');
      showError(error, 'Lỗi', true);
    }
  }, [
    newUsername,
    usernameTenants,
    cotenants,
    maxCoTenants,
    dispatch,
    contractId,
    maxOccupancy,
    showError,
    showSuccess,
    selectedContract?.tenantId.username,
  ]);

  // Hàm xử lý khi nhấn nút "Xóa"
  const handleConfirmRemoveTenant = useCallback(
    async (usernameToRemove: string) => {
      const newList = usernameTenants.filter(t => t !== usernameToRemove);

      try {
        const result = await dispatch(
          updateTenants({
            contractId,
            usernames: newList,
            apply: true,
          }),
        ).unwrap();
        if (result.success) {
          setUsernameTenants(newList);
          if (result.data?.status === 'needs_resigning') {
            showSuccess(
              'Xóa người ở cùng thành công. Hợp đồng cần ký lại, vui lòng thực hiện bước "Ký lại hợp đồng".',
              'Thành công',
              true,
            );
          } else {
            showSuccess('Xóa người ở cùng thành công', 'Thành công', true);
          }
        } else {
          showError(result.message || 'Có lỗi xảy ra', 'Lỗi', true);
        }
      } catch (error) {
        console.error('❌ Lỗi khi xóa người thuê:', error);
      }
    },
    [usernameTenants, dispatch, contractId, showSuccess, showError],
  );

  // Hàm chính hiển thị confirm
  const handleRemoveTenant = useCallback(
    (usernameToRemove: string) => {
      showConfirm(
        'Bạn có chắc chắn muốn xóa người thuê này?',
        () => handleConfirmRemoveTenant(usernameToRemove),
        'Xác nhận',
        [
          {text: 'Hủy', onPress: hideAlert, style: 'cancel'},
          {
            text: 'Xóa',
            onPress: () => handleConfirmRemoveTenant(usernameToRemove),
            style: 'destructive',
          },
        ],
      );
    },
    [showConfirm, hideAlert, handleConfirmRemoveTenant],
  );
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.headerContainer, { paddingTop: statusBarHeight }]}>
          <UIHeader
        title="Cập nhật người thuê"
        iconLeft={Icons.IconArrowLeft}
        onPressLeft={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>Sức chứa</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {cotenants.length}/{Math.max(0, maxOccupancy - 1)} người ở cùng
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    100,
                    (cotenants.length / Math.max(1, maxCoTenants)) * 100,
                  )}%` as any,
                },
              ]}
            />
          </View>
          <Text style={styles.summaryHint}>
            Tối đa {maxOccupancy} người (bao gồm người đại diện)
          </Text>
        </View>
        <View style={styles.containerTextLabel}>
          <Text style={styles.sectionTitle}>Thêm người ở cùng</Text>
        </View>
        <View style={styles.inputCard}>
          <View style={styles.inputSection}>
            <ItemInput
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Nhập username..."
              width={SCREEN.width * 0.8}
              editable={!selectedContractLoading && canAddMore}
            />
            <TouchableOpacity
              style={[styles.addFab, !canAddMore && styles.addButtonDisabled]}
              onPress={handleAddTenant}
              disabled={selectedContractLoading || !canAddMore}>
              <Image
                source={{uri: Icons.IconAdd}}
                style={[styles.icon, !canAddMore && styles.iconDisabled]}
              />
            </TouchableOpacity>
          </View>
          {!canAddMore ? (
            <Text style={styles.limitText}>Đã đạt số người ở cùng tối đa</Text>
          ) : (
            <ItemHelpText text="Bạn có thể thêm nhiều username cùng lúc. Ngăn cách mỗi tên bằng dấu phẩy." />
          )}
        </View>
        <View style={styles.containerTextLabel}>
          <Text style={styles.sectionTitle}>Danh sách người ở cùng</Text>
        </View>
        {cotenants.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có người ở cùng</Text>
        ) : (
          <View style={styles.chipContainer}>
            {cotenants.map((item, idx) => (
              <ItemCotenants
                key={`chip-${idx}`}
                item={item}
                onRemove={handleRemoveTenant}
              />
            ))}
          </View>
        )}

        <ModalLoading visible={selectedContractLoading} loading={true} />
      </View>

      {alertConfig && (
        <CustomAlertModal
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
        />
      )}
      </View>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    width: '100%',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  counterBadge: {
    backgroundColor: Colors.limeGreenOpacityLight,
    borderRadius: 16,
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
  },
  containerTextLabel: {
    width: SCREEN.width,
    backgroundColor: Colors.white,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: responsiveSpacing(16),
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryTitle: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    fontSize: responsiveFont(16),
  },
  summaryHint: {
    marginTop: 6,
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    fontSize: scale(12),
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.limeGreen,
  },
  counterText: {
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: scale(12),
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addFab: {
    backgroundColor: Colors.limeGreen,
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveSpacing(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonDisabled: {backgroundColor: Colors.gray200},
  icon: {width: responsiveIcon(24), height: responsiveIcon(24)},
  iconDisabled: {tintColor: Colors.grayLight},
  sectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: scale(16),
    marginBottom: verticalScale(8),
    color: Colors.black,
    marginStart: responsiveSpacing(20),
    marginTop: responsiveSpacing(16),
  },
  inputCard: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: verticalScale(20),
    color: Colors.textGray,
  },
  limitText: {
    marginTop: 6,
    color: Colors.red,
    fontFamily: Fonts.Roboto_Regular,
    fontSize: scale(12),
  },
  chipContainer: {flexWrap: 'wrap', gap: 8, width: SCREEN.width * 0.9},
});

export default UpdateTenant;
