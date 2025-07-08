import {
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Alert,
  ImageStyle,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {getImageUrl} from '../../../configs';
import {
  searchLocation,
  reverseGeocoding,
  calculateDistance,
} from '../../../store/services/mapServices';
import {Suggestion} from '../../../types/Suggestion';
import ItemAddress from './components/ItemAddress';
import Geolocation from '@react-native-community/geolocation';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';

type MapScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MapScreen'
>;

interface MapScreenProps {
  route: {
    params: {
      latitude?: number;
      longitude?: number;
      address?: string;
      roomDetail?: any;
      isSelectMode?: boolean;
      onSelectLocation?: (location: any) => void;
    };
  };
}

export default function MapScreen({route}: MapScreenProps) {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const [distance, setDistance] = useState<string>('');
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const [markers, setMarkers] = useState<
    Array<{
      id: string;
      latitude: number;
      longitude: number;
      address?: string;
      type: 'room' | 'current' | 'selected';
    }>
  >([]);

  const [mapRegion, setMapRegion] = useState({
    latitude: route.params?.latitude || 21.0285,
    longitude: route.params?.longitude || 105.8542,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const isSelectMode = route.params?.isSelectMode;

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Yêu cầu quyền truy cập vị trí',
            message: 'Ứng dụng cần truy cập vị trí để hiển thị bản đồ',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    requestLocationPermission();

    // Nếu có tọa độ phòng, hiển thị marker
    if (route.params?.latitude && route.params?.longitude) {
      const roomMarker = {
        id: 'room',
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        address: route.params.address,
        type: 'room' as const
      };
      setMarkers([roomMarker]);
      setSelectedLocation({
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        address: route.params.address,
      });

      setMapRegion({
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [route.params?.latitude, route.params?.longitude, route.params?.address]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText.length > 2) {
        searchLocation(searchText).then(setSuggestions);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const handleSelectSuggestion = (item: Suggestion) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    const region = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(region);
    setSuggestions([]);
    setSearchText(item.display_name);

    const newLocation = {
      latitude: lat,
      longitude: lon,
      address: item.display_name,
    };
    setSelectedLocation(newLocation);

    if (isSelectMode) {
      const currentMarker = {
        id: 'currentLocation',
        latitude: lat,
        longitude: lon,
        address: item.display_name,
        type: 'current' as const
      };
      
      setMarkers(prev => {
        const roomMarker = prev.find(m => m.type === 'room');
        return roomMarker ? [roomMarker, currentMarker] : [currentMarker];
      });
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNavigateToDetail = useCallback(() => {
    if (route.params?.roomDetail?._id) {
      navigation.navigate('DetailRoom', {roomId: route.params.roomDetail._id});
    }
  }, [navigation, route.params?.roomDetail?._id]);

  // Hàm tính toán region để hiển thị cả 2 điểm trên bản đồ
  const getRegionForTwoPoints = (
    point1: {latitude: number; longitude: number},
    point2: {latitude: number; longitude: number},
  ) => {
    const midPoint = {
      latitude: (point1.latitude + point2.latitude) / 2,
      longitude: (point1.longitude + point2.longitude) / 2,
    };

    const deltaLat = Math.abs(point1.latitude - point2.latitude);
    const deltaLong = Math.abs(point1.longitude - point2.longitude);

    // Thêm padding 50%
    const padding = 1.5;
    return {
      latitude: midPoint.latitude,
      longitude: midPoint.longitude,
      latitudeDelta: Math.max(deltaLat * padding, 0.02),
      longitudeDelta: Math.max(deltaLong * padding, 0.02),
    };
  };

  // Hàm tính khoảng cách
  const calculateRouteDistance = async (
    origin: {latitude: number; longitude: number},
    destination: {latitude: number; longitude: number},
  ) => {
    try {
      setIsCalculatingDistance(true);
      const distanceResult = await calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude,
      );
      setDistance(distanceResult);
    } catch (error) {
      console.error('Lỗi khi tính khoảng cách:', error);
      setDistance('Không thể tính khoảng cách');
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Cập nhật useEffect cho việc lấy vị trí hiện tại
  useEffect(() => {
    if (route.params?.roomDetail?.location?.coordinates?.coordinates) {
      const [roomLong, roomLat] =
        route.params.roomDetail.location.coordinates.coordinates;
      const roomLocation = {latitude: roomLat, longitude: roomLong};

      // Lấy vị trí hiện tại và tính khoảng cách
      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          const currentLocation = {latitude, longitude};

          await calculateRouteDistance(currentLocation, roomLocation);
        },
        error => {
          console.error('Lỗi lấy vị trí:', error);
          setDistance('Không thể xác định vị trí');
        },
      );
    }
  }, [route.params?.roomDetail]);

  // Hàm format địa chỉ
  const formatAddress = (fullAddress: string) => {
    // Tách địa chỉ thành các phần và đảo ngược thứ tự để dễ xử lý
    const addressParts = fullAddress.split(',')
      .map(part => part.trim())
      .reverse(); // Đảo ngược để bắt đầu từ thành phố
    
    let houseNumber = '';
    let streetName = '';
    let ward = '';      // Phường/Xã
    let district = '';  // Quận/Huyện
    let city = '';      // Thành phố

    // Các từ khóa cần loại bỏ
    const excludeKeywords = [
      'ủy ban nhân dân',
      'ubnd',
      'tổng công ty',
      'công ty',
      'cung thiếu nhi',
      'bảo tàng',
      'nhà hát',
      'đền',
      'chùa',
      'french quarter',
      'hồ',
      'công viên',
      'cửa hàng',
      'shop',
      'store',
      'motorcycle',
    ];

    // Tìm thành phố (thường ở cuối cùng sau khi reverse)
    for (const part of addressParts) {
      const lowerPart = part.toLowerCase();
      if (lowerPart.includes('hà nội')) {
        city = 'Thành phố Hà Nội';
        break;
      }
    }

    // Tìm quận/huyện (thường ở gần cuối)
    for (const part of addressParts) {
      const lowerPart = part.toLowerCase();
      if (lowerPart.includes('quận') || lowerPart.includes('huyện')) {
        district = part.trim();
        break;
      }
    }

    // Tìm phường/xã (thường ở giữa)
    for (const part of addressParts) {
      const lowerPart = part.toLowerCase();
      if (lowerPart.includes('phường') || 
          lowerPart.includes('xã') || 
          lowerPart.includes('thị trấn') ||
          (!lowerPart.includes('quận') && 
           !lowerPart.includes('phố') && 
           !lowerPart.includes('đường') && 
           !lowerPart.includes('số') &&
           !lowerPart.includes('thành phố') &&
           !excludeKeywords.some(keyword => lowerPart.includes(keyword)))) {
        ward = part.trim();
        break;
      }
    }

    // Tìm số nhà và tên đường (thường ở đầu)
    for (const part of addressParts) {
      const lowerPart = part.toLowerCase();
      
      // Bỏ qua nếu chứa từ khóa cần loại bỏ
      if (excludeKeywords.some(keyword => lowerPart.includes(keyword))) {
        continue;
      }

      // Bỏ qua nếu là phường/quận/thành phố
      if (lowerPart.includes('phường') || 
          lowerPart.includes('quận') || 
          lowerPart.includes('thành phố') ||
          lowerPart.includes('hà nội')) {
        continue;
      }

      // Tìm phần tử chứa số
      if (/\d+/.test(part)) {
        const match = part.match(/\d+/);
        if (match) {
          houseNumber = match[0];
          // Lấy phần còn lại làm tên đường (nếu có)
          const remainingPart = part.replace(/^\d+\s*,?\s*/i, '').trim();
          if (remainingPart && (remainingPart.toLowerCase().includes('phố') || remainingPart.toLowerCase().includes('đường'))) {
            streetName = remainingPart;
          }
        }
        continue;
      }
      
      // Tìm tên đường
      if ((lowerPart.includes('phố') || lowerPart.includes('đường')) && !streetName) {
        streetName = part.trim();
      }
    }

    // Nếu không tìm thấy số nhà trong phần riêng, tìm trong tên đường
    if (!houseNumber && streetName) {
      const match = streetName.match(/\d+/);
      if (match) {
        houseNumber = match[0];
        streetName = streetName.replace(/^\d+\s*,?\s*/i, '').trim();
      }
    }

    // Tạo địa chỉ đầy đủ theo thứ tự mong muốn
    const parts = [];
    if (houseNumber) parts.push(houseNumber);
    if (streetName) parts.push(streetName);
    if (ward) parts.push(ward);
    if (district) parts.push(district);
    if (city) parts.push(city);

    // Nếu không đủ thông tin cơ bản
    if (parts.length < 3) {
      // Lọc và sắp xếp lại các phần không chứa từ khóa cần loại bỏ
      const fallbackParts = addressParts
        .reverse() // Đảo ngược lại để lấy theo thứ tự gốc
        .filter(part => {
          const lowerPart = part.toLowerCase();
          return part.trim() && 
                 !/^\d{5,6}$/.test(part.trim()) &&
                 !excludeKeywords.some(keyword => lowerPart.includes(keyword));
        })
        .map(part => part.replace(/,?\s*\d{5,6}$/, '').trim())
        .filter(part => part);

      // Đảm bảo luôn có thành phố ở cuối
      if (!fallbackParts.some(part => part.toLowerCase().includes('hà nội'))) {
        fallbackParts.push('Thành phố Hà Nội');
      }

      return fallbackParts.join(', ');
    }

    return parts.join(', ');
  };

  const handleMapPress = async (e: any) => {
    if (!isSelectMode) return;

    const {latitude, longitude} = e.nativeEvent.coordinate;
    
    try {
      // Lấy địa chỉ từ tọa độ đã chọn
      const fullAddress = await reverseGeocoding(latitude, longitude);
      const formattedAddress = formatAddress(fullAddress);

      setSelectedLocation({
        latitude,
        longitude,
        address: formattedAddress
      });

      // Trong case 2, chỉ hiển thị 1 marker đỏ cho vị trí đã chọn
      if (isSelectMode) {
        const currentMarker = {
          id: 'currentLocation',
          latitude,
          longitude,
          address: formattedAddress,
          type: 'current' as const
        };
        
        setMarkers(prev => {
          const roomMarker = prev.find(m => m.type === 'room');
          return roomMarker ? [roomMarker, currentMarker] : [currentMarker];
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ:', error);
      const addressText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      setSelectedLocation({
        latitude,
        longitude,
        address: addressText
      });

      if (isSelectMode) {
        const currentMarker = {
          id: 'currentLocation',
          latitude,
          longitude,
          address: addressText,
          type: 'current' as const
        };
        
        setMarkers(prev => {
          const roomMarker = prev.find(m => m.type === 'room');
          return roomMarker ? [roomMarker, currentMarker] : [currentMarker];
        });
      }
    }
  };

  const handleGetCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Lỗi',
        'Cần cấp quyền truy cập vị trí để sử dụng tính năng này',
      );
      return;
    }

    setIsLoadingCurrentLocation(true);

    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;

        let region;
        if (route.params?.roomDetail?.location?.coordinates?.coordinates) {
          const [roomLong, roomLat] =
            route.params.roomDetail.location.coordinates.coordinates;
          region = getRegionForTwoPoints(
            {latitude, longitude},
            {latitude: roomLat, longitude: roomLong},
          );

          await calculateRouteDistance(
            {latitude, longitude},
            {latitude: roomLat, longitude: roomLong},
          );
        } else {
          region = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
        }

        setMapRegion(region);

        try {
          const fullAddress = await reverseGeocoding(latitude, longitude);
          const formattedAddress = formatAddress(fullAddress);

          setSelectedLocation({
            latitude,
            longitude,
            address: formattedAddress
          });

          const currentMarker = {
            id: 'currentLocation',
            latitude,
            longitude,
            address: formattedAddress,
            type: 'current' as const
          };

          setMarkers(prev => {
            const roomMarker = prev.find(m => m.type === 'room');
            return roomMarker ? [roomMarker, currentMarker] : [currentMarker];
          });

        } catch (error) {
          console.error('Lỗi khi lấy địa chỉ:', error);
          const addressText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setSelectedLocation({
            latitude,
            longitude,
            address: addressText
          });

          const currentMarker = {
            id: 'currentLocation',
            latitude,
            longitude,
            address: addressText,
            type: 'current' as const
          };

          setMarkers(prev => {
            const roomMarker = prev.find(m => m.type === 'room');
            return roomMarker ? [roomMarker, currentMarker] : [currentMarker];
          });
        }

        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 1000);
        }
      },
      error => {
        console.error('Lỗi lấy vị trí:', error);
        Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );

    setIsLoadingCurrentLocation(false);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      navigation.goBack();
      // Truyền dữ liệu về màn AddRoom thông qua route.params
      if (route.params?.onSelectLocation) {
        route.params.onSelectLocation({
          ...selectedLocation,
          address: selectedLocation.address || searchText,
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Image source={{uri: Icons.IconArrowLeft}} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Search Bar - Chỉ hiển thị trong chế độ chọn địa điểm */}
      {isSelectMode && (
        <View style={styles.searchContainer} pointerEvents="box-none">
          <View style={styles.searchInputContainer} pointerEvents="box-none">
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm địa điểm..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={Colors.grayLight}
              autoCorrect={false}
              autoCapitalize="none"
              multiline={false}
              maxLength={100}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Image
                source={{uri: Icons.IconSeachBlack}}
                style={styles.searchIcon}
              />
            </TouchableOpacity>
          </View>

          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={item => item.place_id.toString()}
              style={styles.dropdown}
              renderItem={({item}) => (
                <ItemAddress item={item} onPress={handleSelectSuggestion} />
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onPress={isSelectMode ? handleMapPress : undefined}>
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            tracksViewChanges={false}>
            <Image
              source={{
                uri: marker.type === 'room' 
                  ? Icons.IconMaker 
                  : marker.type === 'current'
                  ? Icons.IconMyLocation
                  : Icons.IconMaker
              }}
              style={[
                styles.markerIcon,
                marker.type === 'current' && styles.currentLocationMarker,
                marker.type === 'selected' && styles.selectedLocationMarker
              ]}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

      {/* Distance Badge - Chỉ hiển thị khi xem chi tiết phòng */}
      {!isSelectMode && distance && !isCalculatingDistance && (
        <View style={styles.distanceBadge}>
          <Image
            source={{uri: Icons.IconLocation}}
            style={styles.distanceBadgeIcon}
          />
          <Text style={styles.distanceBadgeText}>Cách bạn {distance}</Text>
        </View>
      )}

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleGetCurrentLocation}
        disabled={isLoadingCurrentLocation}>
        <View style={styles.myLocationIconContainer}>
          {isLoadingCurrentLocation ? (
            <ActivityIndicator size="small" color={Colors.darkGreen} />
          ) : (
            <Image
              source={{uri: Icons.IconMyLocation}}
              style={styles.myLocationIcon}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Bottom Container */}
      {isSelectMode ? (
        // Hiển thị địa điểm đã chọn cho chế độ chọn địa điểm
        selectedLocation && (
          <View style={styles.bottomContainer}>
            <View style={styles.selectedLocationContainer}>
              <Text style={styles.selectedLocationTitle}>Địa điểm bạn đã chọn</Text>
              <Text style={styles.selectedLocationAddress} numberOfLines={2}>
                {selectedLocation.address || 'Chưa có địa chỉ'}
              </Text>
            </View>
            <ItemButtonConfirm
              title="Xác nhận"
              onPress={handleConfirmLocation}
              icon={Icons.IconRemoveWhite}
              onPressIcon={handleGoBack}
            />
          </View>
        )
      ) : (
        // Hiển thị thông tin phòng cho chế độ xem chi tiết
        selectedLocation && route.params?.roomDetail && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.roomCard}
              onPress={handleNavigateToDetail}
              activeOpacity={0.8}>
              {route.params.roomDetail.photos &&
              route.params.roomDetail.photos.length > 0 ? (
                <View style={styles.roomImage}>
                  <Image
                    source={{uri: getImageUrl(route.params.roomDetail.photos[0])}}
                    style={[styles.roomImage, {position: 'absolute'}]}
                    resizeMode="cover"
                    onError={() => console.log('Image load error')}
                    defaultSource={{uri: Icons.IconHome}}
                  />
                </View>
              ) : (
                <View style={[styles.roomImage, styles.roomImagePlaceholder]}>
                  <Image
                    source={{uri: Icons.IconHome}}
                    style={styles.placeholderIcon}
                  />
                </View>
              )}
              <View style={styles.roomInfo}>
                <Text style={styles.roomName} numberOfLines={2}>
                  {route.params.roomDetail.description || 'Phòng trọ'}
                </Text>
                <Text style={styles.roomPrice}>
                  Từ{' '}
                  {(route.params.roomDetail.rentPrice || 0).toLocaleString(
                    'vi-VN',
                  )}
                  đ/tháng
                </Text>
                <View style={styles.locationRow}>
                  <Image
                    source={{uri: Icons.IconLocation}}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {route.params.roomDetail.location?.addressText ||
                      'Đang cập nhật địa chỉ'}
                  </Text>
                </View>
                <View style={styles.roomStats}>
                  <Image
                    source={{uri: Icons.IconHome}}
                    style={styles.statsIcon}
                  />
                  <Text style={styles.statsText}>
                    Còn trống: {route.params.roomDetail.maxOccupancy || 0} phòng
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backButton: {
    position: 'absolute',
    top: responsiveSpacing(50),
    left: responsiveSpacing(16),
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backIcon: {
    width: responsiveIcon(12),
    height: responsiveIcon(24),
    tintColor: Colors.black,
  },
  searchContainer: {
    position: 'absolute',
    top: responsiveSpacing(50),
    left: responsiveSpacing(70),
    right: responsiveSpacing(16),
    zIndex: 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: responsiveIcon(40),
    paddingHorizontal: responsiveSpacing(16),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    paddingVertical: 0,
  },
  searchButton: {
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    borderRadius: responsiveIcon(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    tintColor: Colors.black,
  },
  dropdown: {
    marginTop: responsiveSpacing(4),
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(8),
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  markerIcon: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    // tintColor: Colors.darkGreen,
  } as ImageStyle,
  currentLocationMarker: {
    tintColor: Colors.red,
  },
  selectedLocationMarker: {
    tintColor: Colors.darkGreen,
  },
  distanceBadge: {
    position: 'absolute',
    top: responsiveSpacing(100),
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(20),
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  distanceBadgeIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    marginRight: responsiveSpacing(8),
    tintColor: Colors.darkGreen,
  },
  distanceBadgeText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: responsiveSpacing(200),
    right: responsiveSpacing(16),
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  myLocationIconContainer: {
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: Colors.darkGreen,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: responsiveSpacing(20),
    borderTopRightRadius: responsiveSpacing(20),
    padding: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedLocationContainer: {
    marginBottom: responsiveSpacing(16),
  },
  selectedLocationTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(8),
  },
  selectedLocationAddress: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    lineHeight: responsiveFont(20),
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(12),
    padding: responsiveSpacing(12),
    marginBottom: responsiveSpacing(16),
  },
  roomImage: {
    width: responsiveSpacing(80),
    height: responsiveSpacing(80),
    borderRadius: responsiveSpacing(8),
  },
  roomImagePlaceholder: {
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    tintColor: Colors.darkGray,
  },
  roomInfo: {
    flex: 1,
    marginLeft: responsiveSpacing(12),
  },
  roomName: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  roomPrice: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: responsiveSpacing(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(4),
  },
  locationIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(4),
  },
  locationText: {
    flex: 1,
    fontSize: responsiveFont(12),
    color: Colors.textGray,
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(4),
  },
  statsText: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
  },
});
