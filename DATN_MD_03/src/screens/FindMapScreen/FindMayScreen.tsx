import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Circle, Marker} from 'react-native-maps';
import {Colors} from '../../theme/color';
import {Icons} from '../../assets/icons';
import {responsiveIcon, responsiveSpacing} from '../../utils/responsive';
import {Room} from '../../types/Room';
import {useRooms} from '../../hooks/useRooms';
import Geolocation from '@react-native-community/geolocation';

// Components
import SearchBar from './components/SearchBar';
import RoomMarker from './components/RoomMarker';
import RoomCard from './components/RoomCard';

const SEARCH_RADIUS = 1200; // 1.2km in meters

// Hàm tính khoảng cách giữa 2 điểm theo công thức Haversine
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Bán kính trái đất tính bằng mét
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách tính bằng mét
};

const FindMapScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const {rooms, loading} = useRooms(); // Custom hook để lấy danh sách phòng

  const [mapRegion, setMapRegion] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

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
  }, []);

  const handleGetCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Lỗi',
        'Cần cấp quyền truy cập vị trí để sử dụng tính năng này',
      );
      return;
    }

    setIsLoadingLocation(true);

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };

        setMapRegion(region);
        // Cập nhật vị trí được chọn về vị trí hiện tại
        setSelectedLocation({latitude, longitude});
        // Xóa phòng đang được chọn nếu có
        setSelectedRoom(null);

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

    setIsLoadingLocation(false);
  };

  const handleRoomPress = useCallback((room: Room) => {
    setSelectedRoom(room);

    const coordinates = room.location?.coordinates?.coordinates;
    if (coordinates && coordinates.length === 2) {
      const [longitude, latitude] = coordinates;
      const region = {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    }
  }, []);

  const handleMapPress = useCallback((event: any) => {
    const {coordinate} = event.nativeEvent;
    setSelectedLocation(coordinate);
    setSelectedRoom(null);
  }, []);

  const handleFilterPress = () => {
    // TODO: Implement filter functionality
    console.log('Filter pressed');
  };

  const filteredRooms = rooms.filter(room => {
    // Lọc theo text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        room.description?.toLowerCase().includes(searchLower) ||
        room.location?.addressText?.toLowerCase().includes(searchLower);
      if (!matchesSearch) {return false;}
    }

    // Lọc theo bán kính nếu có vị trí được chọn
    if (selectedLocation) {
      const coordinates = room.location?.coordinates?.coordinates;
      if (coordinates && coordinates.length === 2) {
        const [longitude, latitude] = coordinates;
        const distance = calculateDistance(
          selectedLocation.latitude,
          selectedLocation.longitude,
          latitude,
          longitude,
        );
        return distance <= SEARCH_RADIUS;
      }
      return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onFilterPress={handleFilterPress}
        />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={handleMapPress}>
        {selectedLocation && (
          <>
            <Circle
              center={selectedLocation}
              radius={1200} // 5km in meters
              fillColor="rgba(0, 128, 0, 0.1)"
              strokeColor="rgba(0, 128, 0, 0.3)"
              strokeWidth={2}
            />
            <Marker
              coordinate={selectedLocation}
              anchor={{x: 0.5, y: 1}}
              zIndex={999}>
              <View style={styles.customMarker}>
                <View style={styles.markerContainer}>
                  <Image
                    source={{uri: Icons.IconLocation}}
                    style={styles.markerIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          </>
        )}
        {filteredRooms.map(room => (
          <RoomMarker
            key={room._id}
            room={room}
            onPress={handleRoomPress}
            isSelected={selectedRoom?._id === room._id}
          />
        ))}
      </MapView>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkGreen} />
        </View>
      )}

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleGetCurrentLocation}
        disabled={isLoadingLocation}>
        <View style={styles.myLocationIconContainer}>
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={Colors.darkGreen} />
          ) : (
            <Image
              source={{uri: Icons.IconMyLocation}}
              style={styles.myLocationIcon}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Selected Room Card */}
      {selectedRoom && (
        <View style={styles.bottomContainer}>
          <RoomCard room={selectedRoom} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchBarContainer: {
    position: 'absolute',
    top: responsiveSpacing(50),
    left: responsiveSpacing(16),
    right: responsiveSpacing(16),
    zIndex: 5,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
  customMarker: {
    alignItems: 'center',
  },
  markerContainer: {
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: Colors.darkGreen,
  },
  markerTail: {
    width: responsiveIcon(12),
    height: responsiveIcon(12),
    backgroundColor: Colors.white,
    transform: [{rotate: '45deg'}],
    marginTop: -responsiveIcon(6),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default FindMapScreen;
