import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
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

interface Tenant {
  username: string;
}

const UpdateTenant = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {contractId, existingTenants} = route.params as {
    contractId: string;
    existingTenants: CoTenant[];
  };

  console.log(route.params, 'params in UpdateTenant');

  console.log(contractId);

  const dispatch = useDispatch<AppDispatch>();
  const {selectedContractLoading} = useAppSelector(state => state.contract);

  const [tenants, setTenants] = useState<Tenant[]>(existingTenants || []);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    alertConfig,
    visible: alertVisible,
    showError,
    showSuccess,
    hideAlert,
    showConfirm,
  } = useCustomAlert();

  const handleAddTenant = () => {
    const username = newUsername.trim();
    if (!username) {
      showError('Vui lòng nhập username', 'Lỗi', true);
      return;
    }

    if (tenants.find(t => t.username === username)) {
      showError('Username này đã tồn tại trong danh sách', 'Lỗi', true);
      return;
    }

    setTenants(prev => [...prev, {username}]);
    setNewUsername('');
  };

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
            },
            style: 'destructive',
          },
        ],
      );
    },
    [hideAlert, showConfirm, tenants],
  );

  const handleSave = async () => {
    console.log('nhấn vào lưu');
    const originalUsernames = existingTenants.map(t => t.username).sort();
    console.log('danh sách người thuê gốc:', originalUsernames);
    const updatedUsernames = tenants.map(t => t.username).sort();

    const hasChanges =
      originalUsernames.length !== updatedUsernames.length ||
      originalUsernames.some(
        (username, index) => username !== updatedUsernames[index],
      );
    console.log('hasChanges', hasChanges);
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
      showError(err?.message || 'Có lỗi xảy ra khi cập nhật', 'Lỗi', true);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}: {item: Tenant}) => (
    <View style={styles.usernameItem}>
      <Text style={styles.usernameText}>@{item.username}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveTenant(item.username)}>
        <Image
          source={{uri: Icons.IconDelete}}
          style={[styles.icon, {tintColor: 'red'}]}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <UIHeader
        title="Cập nhật người thuê"
        iconLeft={Icons.IconArrowLeft}
        onPressLeft={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.inputSection}>
          <ItemInput
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Nhập username..."
            width={SCREEN.width * 0.8}
            editable={!selectedContractLoading}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTenant}
            disabled={selectedContractLoading}>
            <Image source={{uri: Icons.IconAdd}} style={styles.icon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Danh sách người thuê</Text>
        <FlatList
          data={tenants}
          keyExtractor={(item, index) => `tenant-${index}`}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có người thuê nào</Text>
          }
          contentContainerStyle={{paddingBottom: 16}}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}>
            <Text style={styles.buttonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>
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
  icon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  sectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: scale(16),
    marginBottom: verticalScale(8),
  },
  usernameItem: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  usernameText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: verticalScale(20),
    color: Colors.textGray,
  },
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
