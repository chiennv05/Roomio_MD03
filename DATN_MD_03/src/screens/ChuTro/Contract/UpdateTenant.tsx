import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {UIHeader} from '../MyRoom/components';
import {scale, verticalScale} from '../../../utils/responsive';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {updateTenants} from '../../../store/slices/contractSlice';
import CustomAlertModal from '../../../components/CustomAlertModal';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';

interface Tenant {
  username: string;
}

const UpdateTenant = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {contractId, existingTenants} = route.params as {
    contractId: string;
    existingTenants: Tenant[];
  };

  const dispatch = useDispatch<AppDispatch>();
  const [tenants, setTenants] = useState<Tenant[]>(existingTenants || []);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    alertConfig,
    visible: alertVisible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  } = useCustomAlert();

  const handleAddTenant = () => {
    if (!newUsername.trim()) {
      showError('Vui lòng nhập username', 'Lỗi', true);
      return;
    }

    // Kiểm tra trùng lặp
    if (tenants.some(tenant => tenant.username === newUsername.trim())) {
      showError('Username này đã tồn tại trong danh sách', 'Lỗi', true);
      return;
    }

    // Thêm tenant mới
    const newTenant: Tenant = {username: newUsername.trim()};
    setTenants([...tenants, newTenant]);
    setNewUsername('');
  };

  const handleRemoveTenant = (index: number) => {
    showConfirm(
      'Bạn có chắc chắn muốn xóa người thuê này?',
      () => {
        const newTenants = [...tenants];
        newTenants.splice(index, 1);
        setTenants(newTenants);
      },
      'Xác nhận',
      [
        {text: 'Hủy', onPress: hideAlert, style: 'cancel'},
        {
          text: 'Xóa',
          onPress: () => {
            const newTenants = [...tenants];
            newTenants.splice(index, 1);
            setTenants(newTenants);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSave = async () => {
    // Kiểm tra xem danh sách có thay đổi không
    const originalUsernames = existingTenants.map(t => t.username).sort();
    const newUsernames = tenants.map(t => t.username).sort();

    const hasChanges =
      originalUsernames.length !== newUsernames.length ||
      originalUsernames.some((username, idx) => username !== newUsernames[idx]);

    if (!hasChanges) {
      showError('Danh sách người thuê không thay đổi.', 'Không có thay đổi', true);
      return;
    }

    try {
      setLoading(true);
      const resultAction = await dispatch(
        updateTenants({
          contractId,
          tenants: tenants.map(t => t.username),
        }),
      ).unwrap();

      showSuccess('Cập nhật danh sách người thuê thành công', 'Thành công', true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      showError(error || 'Có lỗi xảy ra khi cập nhật', 'Lỗi', true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <UIHeader
        title="Cập nhật người thuê"
        iconLeft={Icons.IconArrowLeft}
        onPressLeft={handleCancel}
      />

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập username người thuê"
            value={newUsername}
            onChangeText={setNewUsername}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTenant}>
            <Text style={styles.addButtonText}>Thêm</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Danh sách người thuê</Text>

        <FlatList
          data={tenants}
          keyExtractor={(item, index) => `tenant-${index}`}
          renderItem={({item, index}) => (
            <View style={styles.tenantItem}>
              <Text style={styles.tenantUsername}>{item.username}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveTenant(index)}>
                <Text style={styles.removeButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có người thuê nào</Text>
          }
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}>
            <Text style={styles.buttonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
  },
  input: {
    flex: 1,
    height: verticalScale(40),
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: scale(10),
    marginRight: scale(8),
  },
  addButton: {
    backgroundColor: Colors.darkGreen,
    paddingHorizontal: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  sectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: scale(16),
    marginBottom: verticalScale(8),
  },
  tenantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  tenantUsername: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: scale(14),
  },
  removeButton: {
    backgroundColor: Colors.red,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 4,
  },
  removeButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Regular,
    fontSize: scale(12),
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
