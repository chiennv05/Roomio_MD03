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
} from 'react-native';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';

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
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelected, setTempSelected] = useState<District[]>([]);
  const [currentView, setCurrentView] = useState<'cities' | 'districts'>('cities');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Fetch cities when modal opens
  useEffect(() => {
    if (visible) {
      fetchCities();
      setTempSelected([...selectedRegions]);
      setCurrentView('cities');
      setSelectedCity(null);
    }
  }, [visible, selectedRegions]);

  const fetchCities = async () => {
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
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    fetchDistricts(city.code, city.name);
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
    onConfirm(tempSelected);
    onClose();
  };

  const handleCancel = () => {
    setTempSelected([...selectedRegions]);
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
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {currentView === 'districts' && (
              <TouchableOpacity onPress={goBackToCities} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
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
                <ActivityIndicator size="large" color="#BAFD00" />
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
              icon="https://cdn-icons-png.flaticon.com/512/1828/1828665.png"
              onPress={handleConfirm}
              onPressIcon={handleCancel}
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
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#BAFD00',
    borderColor: '#BAFD00',
  },
  checkmark: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 16,
    color: '#BAFD00',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 