import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Province,
  District,
  Ward,
  SelectedAddress,
} from '../../../../types/Address';
import {Colors} from '../../../../theme/color';
import {
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../../utils/responsive';

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: SelectedAddress) => void;
  selectedAddress?: SelectedAddress;
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedAddress,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    'province' | 'district' | 'ward'
  >('province');
  const [tempSelected, setTempSelected] = useState<SelectedAddress>({});

  // Fetch provinces when modal opens
  useEffect(() => {
    if (visible) {
      fetchProvinces();
      setTempSelected(selectedAddress || {});
      setCurrentStep('province');
    }
  }, [visible, selectedAddress]);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://provinces.open-api.vn/api/');
      const data = await response.json();

      // Filter to only include the 3 main cities
      const mainCities = data.filter((province: Province) => {
        return (
          province.code === 1 || // Thành phố Hà Nội
          province.code === 48 || // Thành phố Đà Nẵng
          province.code === 79
        ); // Thành phố Hồ Chí Minh
      });

      setProvinces(mainCities);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh thành');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (provinceCode: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
      );
      const data = await response.json();
      setDistricts(data.districts || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách quận huyện');
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async (districtCode: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
      );
      const data = await response.json();
      setWards(data.wards || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách phường xã');
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceSelect = (province: Province) => {
    setTempSelected({province});
    fetchDistricts(province.code);
    setCurrentStep('district');
  };

  const handleDistrictSelect = (district: District) => {
    setTempSelected(prev => ({...prev, district}));
    fetchWards(district.code);
    setCurrentStep('ward');
  };

  const handleWardSelect = (ward: Ward) => {
    const finalSelection = {...tempSelected, ward};
    setTempSelected(finalSelection);
    onSelect(finalSelection);
    onClose();
  };

  const handleConfirmSelection = () => {
    onSelect(tempSelected);
    onClose();
  };

  const goBack = () => {
    if (currentStep === 'district') {
      setCurrentStep('province');
      setTempSelected(prev => ({province: prev.province}));
    } else if (currentStep === 'ward') {
      setCurrentStep('district');
      setTempSelected(prev => ({
        province: prev.province,
        district: prev.district,
      }));
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case 'province':
        return 'Chọn Tỉnh/Thành phố';
      case 'district':
        return 'Chọn Quận/Huyện';
      case 'ward':
        return 'Chọn Phường/Xã';
      default:
        return 'Chọn địa chỉ';
    }
  };

  const getCurrentData = () => {
    switch (currentStep) {
      case 'province':
        return provinces;
      case 'district':
        return districts;
      case 'ward':
        return wards;
      default:
        return [];
    }
  };

  const handleItemSelect = (item: Province | District | Ward) => {
    switch (currentStep) {
      case 'province':
        handleProvinceSelect(item as Province);
        break;
      case 'district':
        handleDistrictSelect(item as District);
        break;
      case 'ward':
        handleWardSelect(item as Ward);
        break;
    }
  };

  const renderBreadcrumb = () => {
    const breadcrumbs = [];

    if (tempSelected.province) {
      breadcrumbs.push(tempSelected.province.name);
    }
    if (tempSelected.district) {
      breadcrumbs.push(tempSelected.district.name);
    }
    if (tempSelected.ward) {
      breadcrumbs.push(tempSelected.ward.name);
    }

    return breadcrumbs.length > 0 ? (
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>{breadcrumbs.join(' > ')}</Text>
      </View>
    ) : null;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {currentStep !== 'province' && (
              <TouchableOpacity onPress={goBack} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Breadcrumb */}
          {renderBreadcrumb()}

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.limeGreen} />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : (
              <ScrollView style={styles.list}>
                {getCurrentData().map((item: any) => (
                  <TouchableOpacity
                    key={item.code}
                    style={styles.listItem}
                    onPress={() => handleItemSelect(item)}>
                    <Text style={styles.listItemText}>{item.name}</Text>
                    <Text style={styles.arrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    padding: responsiveSpacing(8),
    width: moderateScale(40),
  },
  backText: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  title: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: Colors.darkGray,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: responsiveSpacing(8),
    width: moderateScale(40),
    alignItems: 'center',
  },
  closeText: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    color: Colors.unselectedText,
  },
  breadcrumb: {
    padding: responsiveSpacing(12),
    backgroundColor: Colors.lightGray,
  },
  breadcrumbText: {
    fontSize: responsiveFont(14),
    color: Colors.unselectedText,
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing(40),
  },
  loadingText: {
    marginTop: responsiveSpacing(10),
    fontSize: responsiveFont(14),
    color: Colors.unselectedText,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listItemText: {
    fontSize: responsiveFont(16),
    color: Colors.darkGray,
    flex: 1,
  },
  arrow: {
    fontSize: responsiveFont(16),
    color: Colors.limeGreen,
    fontWeight: 'bold',
  },
  footer: {
    padding: responsiveSpacing(16),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  confirmButton: {
    backgroundColor: Colors.limeGreen,
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(24),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  confirmText: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
});
