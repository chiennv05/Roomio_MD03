import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';
import { Colors } from '../../../theme/color';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';

interface City {
  name: string;
  code: number;
}

interface District {
  name: string;
  code: number;
  cityCode: number;
  cityName: string;
}

interface RegionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedDistricts: District[]) => void;
  selectedRegions: District[];
}

const RegionModal: React.FC<RegionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedRegions,
}) => {
  const insets = useSafeAreaInsets();
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelected, setTempSelected] = useState<District[]>([]);
  const [currentView, setCurrentView] = useState<'cities' | 'districts'>('cities');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [citiesFetched, setCitiesFetched] = useState(false);
  const [districtsCache, setDistrictsCache] = useState<{[cityCode: number]: District[]}>({});

  // Fetch cities only once when modal opens
  useEffect(() => {
    if (visible && !citiesFetched) {
      fetchCities();
      setCitiesFetched(true);
    }
  }, [visible, citiesFetched]);

  // Reset modal state when opening
  useEffect(() => {
    if (visible) {
      setTempSelected([...selectedRegions]);
      setCurrentView('cities');
      setSelectedCity(null);
    }
  }, [visible, selectedRegions]);

  const fetchCities = async () => {
    console.log('call');
    setLoading(true);
    try {
      const response = await fetch('https://provinces.open-api.vn/api/');
      const data = await response.json();
      // Filter to only include the 3 main cities
      const mainCities = data.filter((province: any) => {
        return province.code === 1 ||  // Thành phố Hà Nội
               province.code === 48 || // Thành phố Đà Nẵng
               province.code === 79;   // Thành phố Hồ Chí Minh
      });
      const cityList: City[] = mainCities.map((city: any) => ({
        name: city.name,
        code: city.code,
      }));
      setCities(cityList);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách thành phố');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (cityCode: number, cityName: string) => {
    // Check if districts for this city are already cached
    if (districtsCache[cityCode] && districtsCache[cityCode].length > 0) {
      console.log('call cache');
      setDistricts(districtsCache[cityCode]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${cityCode}?depth=2`);
      const data = await response.json();
      // Get districts from the selected city
      const districtList = data.districts || [];
      const mappedDistricts: District[] = districtList.map((district: any) => ({
        name: district.name,
        code: district.code,
        cityCode: cityCode,
        cityName: cityName,
      }));

      setDistricts(mappedDistricts);
      // Cache the districts for this city
      setDistrictsCache(prev => ({
        ...prev,
        [cityCode]: mappedDistricts,
      }));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: City) => {
    // Only fetch if selecting a different city
    if (selectedCity?.code !== city.code) {
      setSelectedCity(city);
      fetchDistricts(city.code, city.name);
    }
    setCurrentView('districts');
  };

  const handleDistrictToggle = (district: District) => {
    setTempSelected(prev => {
      const exists = prev.find(item => item.code === district.code);
      if (exists) {
        // Remove if already selected
        return prev.filter(item => item.code !== district.code);
      } else {
        // Add if not selected
        return [...prev, district];
      }
    });
  };

  const isDistrictSelected = (district: District) => {
    return tempSelected.some(item => item.code === district.code);
  };

  const goBackToCities = () => {
    setCurrentView('cities');
    setSelectedCity(null);
  };

  const handleConfirm = () => {
    console.log('🔍 Region Filter - Selected districts:', tempSelected.map(d => ({
      name: d.name,
      city: d.cityName,
    })));
    onConfirm(tempSelected);
    onClose();
  };

  const handleReset = () => {
    // Reset về rỗng (xóa tất cả vùng đã chọn)
    onConfirm([]);
    onClose();
  };

  const getTitle = () => {
    return currentView === 'cities' ? 'Khu vực' : selectedCity?.name || 'Khu vực';
  };

  const getSubtitle = () => {
    return currentView === 'cities' ? 'Lọc tìm kiếm theo khu vực' : 'Chọn quận/huyện';
  };

  const getCurrentData = () => {
    return currentView === 'cities' ? cities : districts;
  };

  const handleItemPress = (item: any) => {
    if (currentView === 'cities') {
      handleCitySelect(item as City);
    } else {
      handleDistrictToggle(item as District);
    }
  };



  const isItemSelected = (item: any) => {
    if (currentView === 'cities') {
      return false; // Cities don't show checkbox
    } else {
      return isDistrictSelected(item as District);
    }
  };

  const shouldShowCheckbox = () => {
    return currentView === 'districts'; // Only show checkbox for districts
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
                          {currentView === 'districts' && (
                <TouchableOpacity onPress={goBackToCities} style={styles.backButton}>
                  <Image source={{uri: Icons.IconArrowBack}} style={styles.backImage} />
                </TouchableOpacity>
              )}
            <View style={styles.headerContent}>
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.subtitle}>{getSubtitle()}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.limeGreen} />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : (
                            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {getCurrentData().map((item) => {
                  const isSelected = isItemSelected(item);
                  const showCheckbox = shouldShowCheckbox();
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={styles.listItem}
                      onPress={() => handleItemPress(item)}
                    >
                      <Text style={styles.listItemText}>{item.name}</Text>
                      {showCheckbox && (
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ItemButtonConfirm
              title="Xác nhận"
              icon={Icons.IconRemoveWhite}
              onPress={handleConfirm}
              onPressIcon={handleReset}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RegionModal;

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
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(10),
  },
  backButton: {
    padding: responsiveSpacing(8),
    marginRight: responsiveSpacing(12),
  },
  backText: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: responsiveFont(24),
    fontWeight: 'bold',
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(4),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
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
    paddingVertical: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listItemText: {
    fontSize: responsiveFont(16),
    color: Colors.darkGray,
    flex: 1,
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    borderRadius: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  checkboxSelected: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
  },
  checkmark: {
    color: Colors.darkGray,
    fontSize: responsiveFont(14),
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: responsiveFont(16),
    color: Colors.limeGreen,
    fontWeight: 'bold',
  },
  footer: {
    padding: responsiveSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backImage: {
    width: moderateScale(12),
    height: moderateScale(20),
  },
});
