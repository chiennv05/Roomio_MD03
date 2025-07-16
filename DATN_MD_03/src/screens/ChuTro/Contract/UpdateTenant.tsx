import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../../theme/color';
import {ItemInput, UIHeader} from '../MyRoom/components';

import {updateTenants} from '../../../store/slices/contractSlice';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../../hooks';
import {Icons} from '../../../assets/icons';
import {
  responsiveIcon,
  responsiveSpacing,
  SCREEN,
} from '../../../utils/responsive';

interface RouteParams {
  contractId: string;
  currentUsernames?: string[];
}

type UpdateTenantRouteProp = RouteProp<
  {UpdateTenant: RouteParams},
  'UpdateTenant'
>;

export default function UpdateTenant() {
  const route = useRoute<UpdateTenantRouteProp>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const {contractId, currentUsernames} = route.params;
  const {selectedContractLoading} = useAppSelector(state => state.contract);

  const [usernames, setUsernames] = useState<string[]>(currentUsernames || []);
  const [newUsername, setNewUsername] = useState('');

  console.log(usernames, 'Current usernames');

  const handleAddUsername = () => {
    if (!newUsername.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập username');
      return;
    }

    if (usernames.includes(newUsername.trim())) {
      Alert.alert('Lỗi', 'Username này đã tồn tại trong danh sách');
      return;
    }

    setUsernames([...usernames, newUsername.trim()]);
    setNewUsername('');
  };

  const handleRemoveUsername = (username: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa "${username}" khỏi danh sách?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setUsernames(usernames.filter(u => u !== username));
          },
        },
      ],
    );
  };

  const handleSaveChanges = async () => {
    // So sánh xem có thay đổi gì không
    const original = (currentUsernames || []).slice().sort();
    const updated = usernames.slice().sort();

    const isSame =
      original.length === updated.length &&
      original.every((username, index) => username === updated[index]);

    if (isSame) {
      Alert.alert('Không có thay đổi', 'Danh sách người thuê không thay đổi.');
      return;
    }

    try {
      const resultAction = await dispatch(
        updateTenants({
          contractId,
          tenants: usernames, // Gửi mảng username, có thể rỗng
        }),
      );

      if (updateTenants.fulfilled.match(resultAction)) {
        Alert.alert('Thành công', 'Cập nhật danh sách người thuê thành công', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Lỗi', resultAction.payload as string);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderUsernameItem = ({item}: {item: string}) => (
    <View style={styles.usernameItem}>
      <Text style={styles.usernameText}>@{item}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveUsername(item)}>
        <Image
          source={{uri: Icons.IconDelete}}
          style={[styles.styleIcon, {tintColor: 'red'}]}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <UIHeader
        title="Cập nhật người thuê"
        iconLeft={Icons.IconArrowLeft}
        onPressLeft={handleBack}
      />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Danh sách Username ({usernames.length})
        </Text>

        {/* Input thêm username */}
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
            onPress={handleAddUsername}>
            <Image source={{uri: Icons.IconAdd}} style={styles.styleIcon} />
          </TouchableOpacity>
        </View>

        {/* Danh sách username */}
        {usernames.length > 0 ? (
          <FlatList
            data={usernames}
            keyExtractor={(item, index) => `${item}_${index}`}
            renderItem={renderUsernameItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Danh sách trống - API sẽ xóa tất cả người thuê
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedContractLoading && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveChanges}
          disabled={selectedContractLoading}>
          {selectedContractLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  inputSection: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.black,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: Colors.limeGreen,
    width: responsiveIcon(48),
    height: responsiveIcon(48),
    borderRadius: responsiveIcon(48) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveSpacing(10),
  },
  listContainer: {
    paddingBottom: 20,
  },
  usernameItem: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  styleIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
});
