import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, ScrollView, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Contract, CustomService} from '../../../types';
import {Colors} from '../../../theme/color';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {updateContractFrom} from '../../../store/slices/contractSlice';
import ServiceItem from './components/ServiceItem';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {
  moderateScale,
  responsiveFont,
  responsiveSpacing,
  SCREEN,
} from '../../../utils/responsive';
import {Fonts} from '../../../theme/fonts';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import CustomAlertModal from '../../../components/CustomAlertModal';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import ModalLoading from '../AddRoom/components/ModalLoading';

export default function UpdateContract() {
  const {
    alertConfig,
    visible: alertVisible,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  } = useCustomAlert();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {contract} = route.params as {contract: Contract};
  const customServiceRoom = contract?.roomId?.location?.customServices || [];
  const dispatch = useDispatch<AppDispatch>();

  const [rules, setRules] = useState(contract?.contractInfo?.rules || '');
  const [additionalTerms, setAdditionalTerms] = useState(
    contract?.contractInfo?.additionalTerms || '',
  );
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (!contract || !contract.contractInfo) {
      showError('Thông tin hợp đồng không đầy đủ', 'Lỗi', true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    }
  }, [contract, navigation, showError]);

  // Chỉ chứa dịch vụ có thay đổi
  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  // Kiểm tra 1 dịch vụ đang bật hay không
  const isServiceEnabled = (service: CustomService) => {
    if (!service || !service.name) {
      return false;
    }

    const changed = customServices.find(item => item.name === service.name);
    if (changed) {
      return !changed._delete;
    }

    // nếu chưa thay đổi thì kiểm tra trong hợp đồng gốc
    return (
      contract.contractInfo.customServices &&
      contract.contractInfo.customServices.some(
        item => item && item.name === service.name,
      )
    );
  };

  const toggleService = (service: CustomService) => {
    setCustomServices(prev => {
      const exists = prev.find(item => item.name === service.name);

      if (exists) {
        if (!exists._id) {
          // Dịch vụ mới chưa lưu trên server, chỉ cần xoá khỏi danh sách
          return prev.filter(item => item.name !== service.name);
        } else {
          // Dịch vụ cũ → toggle _delete
          return prev.map(item =>
            item.name === service.name
              ? {...item, _delete: !item._delete}
              : item,
          );
        }
      } else {
        // Chưa có → kiểm tra xem là dịch vụ cũ hay mới
        const isOld = contract.contractInfo.customServices?.find(
          item => item.name === service.name,
        );

        if (isOld && isOld._id) {
          return [...prev, {...isOld, _delete: true}]; // mặc định toggle về false
        } else {
          // Là dịch vụ mới từ room → thêm
          const newService = {
            name: service.name,
            price: service.price,
            priceType: service.priceType,
            description: service.description || '',
          };
          return [...prev, newService];
        }
      }
    });
  };

  const handleUpdate = async () => {
    if (!contract || !contract.contractInfo) {
      showError(
        'Thông tin hợp đồng không đầy đủ. Vui lòng quay lại và thử lại.',
        'Lỗi',
        true,
      );
      return;
    }
    if (rules.trim() === '') {
      showError('Vui lòng nhập nội quy', 'Lỗi', true);
      return;
    }
    if (additionalTerms.trim() === '') {
      showError('Vui lòng nhập điều khoản bổ sung', 'Lỗi', true);
      return;
    }

    try {
      // 1. Cập nhật thông tin hợp đồng (dịch vụ, rules, additionalTerms)
      const original = contract.contractInfo.customServices || [];

      const removed = original
        .filter(
          ori =>
            !customServices.find(item => item.name === ori.name) &&
            !isServiceEnabled(ori),
        )
        .map(item => ({
          _id: item._id!,
          name: item.name,
          price: item.price,
          priceType: item.priceType,
          description: item.description || '',
          _delete: true,
        }));

      const updatedList = [...customServices, ...removed];

      const finalList = updatedList.map(service => {
        const base = {
          name: service.name,
          price: service.price,
          priceType: service.priceType,
          description: service.description || '',
        };

        if (service._id && service._delete) {
          return {
            _id: service._id,
            ...base,
            _delete: true,
          };
        } else if (service._id) {
          return {
            _id: service._id,
            ...base,
          };
        } else {
          return base;
        }
      });

      const contractPayload = {
        rules,
        additionalTerms,
        customServices: finalList,
      };
      const contractResult = await dispatch(
        updateContractFrom({contractId: contract._id, data: contractPayload}),
      );

      if (!updateContractFrom.fulfilled.match(contractResult)) {
        const errorMessage =
          (contractResult.payload as string) || 'Đã xảy ra lỗi';
        showError(`Không thể cập nhật hợp đồng: ${errorMessage}`, 'Lỗi', true);
        return;
      }

      setIsUpdated(true);
      showSuccess('Cập nhật hợp đồng thành công', 'Thành công', true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Update error:', error);
      showError(
        `Lỗi không xác định: ${error.message || 'Không có thông tin chi tiết'}`,
        'Lỗi',
        true,
      );
    }
  };

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
          style: 'default',
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.containerScrollview}
        contentContainerStyle={styles.containerScroll}
        showsVerticalScrollIndicator={false}>
        <UIHeader
          title="Cập nhật hợp đồng"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleCancelUpdate}
        />

        <Text style={styles.label}>Nội quy</Text>
        <ItemInput
          placeholder="Điều khoản nội quy"
          value={rules}
          height={moderateScale(100)}
          onChangeText={setRules}
          editable={true}
          borderRadius={10}
        />

        <Text style={styles.label}>Điều khoản bổ sung</Text>
        <ItemInput
          placeholder="Mô tả"
          value={additionalTerms}
          onChangeText={setAdditionalTerms}
          editable={true}
          height={moderateScale(100)}
          borderRadius={10}
        />

        <Text style={styles.label}>Dịch vụ bổ sung</Text>
        {!Array.isArray(customServiceRoom) ? (
          <Text style={styles.noServicesText}>Dịch vụ không hợp lệ</Text>
        ) : customServiceRoom.length === 0 ? (
          <Text style={styles.noServicesText}>Không có dịch vụ nào</Text>
        ) : (
          customServiceRoom.map(service => (
            <ServiceItem
              key={service?.name ?? Math.random().toString()} // fallback nếu name undefined
              service={service}
              enabled={isServiceEnabled(service)}
              onToggle={toggleService}
            />
          ))
        )}

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

        <ModalLoading loading={true} visible={isUpdated} />
      </ScrollView>
      <View style={styles.containerButton}>
        <ItemButtonConfirm
          icon={Icons.IconDelete}
          title="Cập nhật hợp đồng"
          onPress={handleUpdate}
          onPressIcon={handleCancelUpdate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  containerScrollview: {
    flex: 1,
    backgroundColor: Colors.white,
    marginBottom: responsiveSpacing(100),
  },
  containerScroll: {
    paddingBottom: responsiveSpacing(50),
    alignItems: 'center',
  },
  title: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    marginTop: 20,
    color: Colors.black,
    textAlign: 'center',
  },
  label: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    marginTop: responsiveSpacing(20),
    color: Colors.black,
    width: SCREEN.width * 0.9,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    width: SCREEN.width * 0.9,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceDesc: {
    fontSize: 13,
    color: '#555',
  },
  noServicesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
  button: {
    marginTop: responsiveSpacing(30),
    backgroundColor: Colors.limeGreen,
    padding: responsiveSpacing(12),
    borderRadius: responsiveSpacing(36),
    alignItems: 'center',
    width: SCREEN.width * 0.8,
  },
  buttonText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  // Tenant management styles

  containerButton: {
    position: 'absolute',
    bottom: responsiveSpacing(30),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
