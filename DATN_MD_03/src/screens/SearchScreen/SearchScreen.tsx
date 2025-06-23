import React, { useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchRooms } from '../../store/slices/roomSlice';
import { Colors } from '../../theme/color';
import { RootStackParamList } from '../../types/route';
import { Icons } from '../../assets/icons';

// Import components
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import FilterOverlay from './components/FilterOverlay';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { rooms } = useSelector((state: RootState) => state.room);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterOverlayVisible, setIsFilterOverlayVisible] = useState(false);

  // Filter options data
  const filterOptions = [
    {
      id: 'tim-o-ghep',
      label: 'Tìm ở ghép',
      icon: Icons.IconChanGaGoi || '',
      isSelected: selectedFilters.includes('tim-o-ghep')
    },
    {
      id: 'tim-phong-lan-can',
      label: 'Tìm phòng lân cận',
      icon: Icons.IconLocation || '',
      isSelected: selectedFilters.includes('tim-phong-lan-can')
    },
    {
      id: 'van-chuyen',
      label: 'Vận chuyển',
      icon: Icons.IconGuiXe || '',
      isSelected: selectedFilters.includes('van-chuyen')
    },
    {
      id: 'noi-that-gia-re',
      label: 'Nội thất giá rẻ',
      icon: Icons.IconSofa || '',
      isSelected: selectedFilters.includes('noi-that-gia-re')
    },
  ];

  // Hàm xử lý tìm kiếm
  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(fetchRooms({}));
    }
  };

  // Hàm xử lý chọn filter
  const handleFilterSelect = (filterId: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };

  // Hàm xử lý nhấn vào room card
  const handleRoomPress = (roomId: string) => {
    navigation.navigate('DetailRoom', { roomId });
  };

  // Hàm xử lý toggle filter overlay
  const handleFilterPress = () => {
    console.log('Filter button pressed, current state:', isFilterOverlayVisible);
    setIsFilterOverlayVisible(!isFilterOverlayVisible);
  };

  // Hàm đóng filter overlay
  const handleCloseFilter = () => {
    console.log('Closing filter overlay');
    setIsFilterOverlayVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
      
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearchPress={handleSearch}
        placeholder="Tìm kiếm tin đăng..."
      />

      {/* Search Results */}
      <SearchResults
        title="Danh mục tìm kiếm"
        rooms={rooms || []}
        onRoomPress={handleRoomPress}
        onFilterPress={handleFilterPress}
        isFilterActive={isFilterOverlayVisible}
      />

      {/* Filter Overlay */}
      <FilterOverlay
        visible={isFilterOverlayVisible}
        onClose={handleCloseFilter}
        filters={filterOptions}
        onFilterPress={handleFilterSelect}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
});
