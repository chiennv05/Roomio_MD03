import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { 
  responsiveFont, 
  responsiveIcon, 
  responsiveSpacing 
} from '../../../utils/responsive';
import { Room } from '../../../types/Room';
import RoomCard from '../../HomeScreen/components/RoomCard';
import { Icons } from '../../../assets/icons';

interface SearchResultsProps {
  title: string;
  rooms: Room[];
  onRoomPress: (roomId: string) => void;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  title,
  rooms,
  onRoomPress,
  onFilterPress,
  isFilterActive = false
}) => {
  const renderRoomItem = ({ item }: { item: Room }) => (
    <RoomCard item={item} onPress={onRoomPress} />
  );

  return (
    <View style={styles.container}>
      {/* Header với title và filter button */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onFilterPress && (
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isFilterActive && styles.activeFilterButton
            ]} 
            onPress={() => {
              console.log('Filter button pressed in SearchResults, isFilterActive:', isFilterActive);
              onFilterPress();
            }}
          >
            <Image 
              source={{ uri: isFilterActive ? Icons.IconRemove : Icons.IconFilter }} 
              style={[
                styles.filterIcon,
                isFilterActive && styles.activeFilterIcon
              ]} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách kết quả */}
      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item._id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default SearchResults;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  filterButton: {
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(20),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
  },
  filterIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: '#666',
  },
  activeFilterIcon: {
    tintColor: Colors.white,
  },
  listContainer: {
    paddingTop: responsiveSpacing(8),
    paddingBottom: responsiveSpacing(100), // Để tránh bị che bởi tab bar
  },
  separator: {
    height: responsiveSpacing(8),
  },
}); 