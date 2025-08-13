import React, {useState, useCallback, useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';

import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {
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
import {CoTenant} from '../../../types';
import ItemButtonGreen from '../../../components/ItemButtonGreen';
import ModalLoading from '../AddRoom/components/ModalLoading';

interface Tenant {
  username: string;
}

const UpdateTenant = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const {contractId, existingTenants, maxOccupancy} = route.params as {
    contractId: string;
    existingTenants: CoTenant[];
    maxOccupancy: number;
  };

  const dispatch = useDispatch<AppDispatch>();
  const {selectedContractLoading} = useAppSelector(state => state.contract);

  const [tenants, setTenants] = useState<Tenant[]>(existingTenants || []);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);
  console.log(maxOccupancy, 'maxOccupancy');
  const {
    alertConfig,
    visible: alertVisible,
    showError,
    showSuccess,
    hideAlert,
    showConfirm,
  } = useCustomAlert();

  const maxCoTenants = useMemo(() => Math.max(0, maxOccupancy - 1), [maxOccupancy]);
  const canAddMore = useMemo(() => tenants.length < maxCoTenants, [tenants.length, maxCoTenants]);
  const addBtnSize = responsiveIcon(40);
  const inputWidth = useMemo(
    () => SCREEN.width - scale(16) * 2 - scale(12) * 2 - addBtnSize - scale(12),
    [addBtnSize],
  );

  const handleAddTenant = useCallback(() => {
    const username = newUsername.trim();

    if (!username) {
      showError('Vui lòng nhập username', 'Lỗi', true);
      return;
    }

    if (tenants.find(t => t.username === username)) {
      showError('Username này đã tồn tại trong danh sách', 'Lỗi', true);
      return;
    }

    // Validate số lượng người thuê phụ không vượt quá giới hạn
    if (!canAddMore) {
      showError(
        ` Phòng này chỉ cho phép tối đa  ${maxOccupancy} người ở`,
        'Vượt giới hạn',
        true,
      );
      return;
    }

    setTenants(prev => [...prev, {username}]);
    setNewUsername('');
  }, [newUsername, tenants, canAddMore, maxOccupancy, showError]);

  const handleRemoveTenant = useCallback(
    (usernameToRemove: string) => {
      showConfirm(
        'Bạn có chắc chắn muốn xóa người thuê này?',
        () => {
          const newList = tenants.filter(t => t.username !== usernameToRemove);
          setTenants(newList);
        },
        'Xác nhận',
        [
          {text: 'Hủy', onPress: hideAlert, style: 'cancel'},
          {
            text: 'Xóa',
            onPress: () => {
              const newList = tenants.filter(
                t => t.username !== usernameToRemove,
              );
              setTenants(newList);
              hideAlert();
            },
            style: 'destructive',
          },
        ],
      );
    },
    [hideAlert, showConfirm, tenants],
  );

  const handleSave = async () => {
    const originalUsernames = existingTenants.map(t => t.username).sort();

    const updatedUsernames = tenants.map(t => t.username).sort();

    const hasChanges =
      originalUsernames.length !== updatedUsernames.length ||
      originalUsernames.some(
        (username, index) => username !== updatedUsernames[index],
      );
    if (!hasChanges) {
      showError(
        'Danh sách người thuê không thay đổi.',
        'Không có thay đổi',
        true,
      );
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        updateTenants({
          contractId,
          tenants: tenants.map(t => t.username),
        }),
      ).unwrap();

      showSuccess('Cập nhật thành công', 'Thành công', true);
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err: any) {
      showError(err.message || 'Có lỗi xảy ra khi cập nhật', 'Lỗi', true);
    } finally {
      setLoading(false);
    }
  };

  // Không dùng FlatList renderer trong bố cục chips

  const handleCancelUpdate = () => {
    showConfirm(
      'Bạn có chắc chắn muốn hủy cập nhật?',
      () => navigation.goBack(),
      'Hủy cập nhật',
      [
        {text: 'Không', onPress: hideAlert, style: 'cancel'},
        {
          text: 'Có',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ],
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}] }>
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
                {tenants.length}/{Math.max(0, maxOccupancy - 1)} người ở cùng
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressFill,
                {width: `${Math.min(100, (tenants.length / Math.max(1, maxCoTenants)) * 100)}%` as any},
              ]}
            />
          </View>
          <Text style={styles.summaryHint}>
            Tối đa {maxOccupancy} người (bao gồm người đại diện)
          </Text>
        </View>
        <View style={styles.inputCard}>
          <View style={styles.inputSection}>
            <ItemInput
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Nhập username..."
              width={Math.max(scale(180), inputWidth)}
              editable={!selectedContractLoading && canAddMore}
            />
            <TouchableOpacity
              style={[styles.addFab, !canAddMore && styles.addButtonDisabled]}
              onPress={handleAddTenant}
              disabled={selectedContractLoading || !canAddMore}>
              <Image source={{uri: Icons.IconAdd}} style={[styles.icon, !canAddMore && styles.iconDisabled]} />
            </TouchableOpacity>
          </View>
          {!canAddMore && (
            <Text style={styles.limitText}>Đã đạt số người ở cùng tối đa</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Danh sách người ở cùng</Text>
        {tenants.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có người ở cùng</Text>
        ) : (
          <View style={styles.chipContainer}>
            {tenants.map((item, idx) => (
              <TouchableOpacity
                key={`chip-${idx}`}
                style={styles.chip}
                onLongPress={() => handleRemoveTenant(item.username)}
                activeOpacity={0.85}
              >
                <Text style={styles.chipText}>@{item.username}</Text>
                <TouchableOpacity
                  style={styles.chipRemove}
                  onPress={() => handleRemoveTenant(item.username)}
                  hitSlop={{top: 8, right: 8, bottom: 8, left: 8}}
                >
                  <Image source={{uri: Icons.IconDelete}} style={styles.chipRemoveIcon} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ItemButtonGreen onPress={handleSave} title="Lưu" />
        <ItemButtonGreen onPress={handleCancelUpdate} title="Hủy" />

        <ModalLoading visible={loading} loading={true} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: scale(16),
    backgroundColor: Colors.backgroud,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  tipText: {
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
  },
  counterBadge: {
    backgroundColor: Colors.limeGreenOpacityLight,
    borderRadius: 16,
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
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
    marginTop: 8,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: Colors.limeGreen,
    width: responsiveIcon(48),
    height: responsiveIcon(48),
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveSpacing(10),
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
  addButtonDisabled: {
    backgroundColor: Colors.gray200,
  },
  icon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  iconDisabled: {
    tintColor: Colors.grayLight,
  },
  sectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: scale(16),
    marginBottom: verticalScale(8),
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  usernameItem: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  usernamePill: {
    backgroundColor: '#F1F9E6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  usernameText: {
    fontSize: 15,
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
  removeButton: {
    padding: 4,
  },
  iconDelete: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: 'red',
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF2',
    borderWidth: 1,
    borderColor: '#E6F0D8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 22,
    marginBottom: 8,
  },
  chipText: {
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
  chipRemove: {marginLeft: 8},
  chipRemoveIcon: {width: 18, height: 18, tintColor: 'red'},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(20),
  },
  button: {
    flex: 1,
    height: verticalScale(45),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(4),
  },
  cancelButton: {
    backgroundColor: Colors.gray,
  },
  saveButton: {
    backgroundColor: Colors.darkGreen,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: scale(16),
  },
});

export default UpdateTenant;
