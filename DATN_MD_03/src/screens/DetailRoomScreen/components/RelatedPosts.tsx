import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveSpacing, responsiveFont} from '../../../utils/responsive';
import {Room} from '../../../types/Room';
import {getFullImageUrl} from '../../../utils/roomUtils';
import {Icons} from '../../../assets/icons';
import {InlineLoading} from '../../../components';

interface RelatedPost {
  id?: string;
  image: string;
  title: string;
  price: string;
  address: string;
}

interface RelatedPostsProps {
  posts?: RelatedPost[];
  relatedRooms?: Room[];
  loading?: boolean;
  onRoomPress?: (roomId: string) => void;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({
  posts = [],
  relatedRooms = [],
  loading = false,
  onRoomPress,
}) => {
  // Không sử dụng mock data nữa - chỉ lấy từ API

  // Convert Room objects to RelatedPost format
  const convertRoomsToRelatedPosts = (rooms: Room[]): RelatedPost[] => {
    return rooms.map(room => ({
      id: room._id || '',
      image:
        room.photos && room.photos.length > 0
          ? getFullImageUrl(room.photos[0])
          : 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
      title: room.description || `Phòng ${room.roomNumber}`,
      price: `${room.rentPrice?.toLocaleString('vi-VN') || '0'}đ/tháng`,
      address: `${room.location.district}, ${room.location.province}`,
    }));
  };

  // Chỉ sử dụng data từ API - không có mock data
  let displayPosts: RelatedPost[] = [];

  if (relatedRooms.length > 0) {
    displayPosts = convertRoomsToRelatedPosts(relatedRooms);
  } else if (posts.length > 0) {
    displayPosts = posts;
  }
  // Không có fallback mock data nữa

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bài đăng liên quan</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <InlineLoading
            message="Đang tìm kiếm phòng liên quan..."
            size="small"
            color={Colors.limeGreen}
          />
        </View>
      ) : displayPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyText}>Không tìm thấy phòng liên quan</Text>
          <Text style={styles.emptySubtext}>
            Hiện tại chưa có phòng nào khác trong khu vực này
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {displayPosts.map((post, index) => (
            <TouchableOpacity
              key={post.id || index}
              style={styles.postCard}
              onPress={() => post.id && onRoomPress?.(post.id)}>
              <Image source={{uri: post.image}} style={styles.postImage} />
              <View style={styles.postInfo}>
                <Text style={styles.postTitle} numberOfLines={2}>
                  {post.title}
                </Text>
                <Text style={styles.postPrice}>{post.price}</Text>
                <View style={styles.locationContainer}>
                  <Image
                    source={{uri: Icons.IconLocation}}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.postAddress} numberOfLines={1}>
                    {post.address}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(16),
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(16),
  },
  postCard: {
    width: 180,
    marginRight: responsiveSpacing(12),
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  postInfo: {
    padding: responsiveSpacing(12),
  },
  postTitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(6),
    lineHeight: responsiveFont(18),
  },
  postPrice: {
    fontSize: responsiveFont(12),
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
    marginBottom: responsiveSpacing(6),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 12,
    height: 12,
    marginRight: responsiveSpacing(4),
    tintColor: Colors.darkGreen,
  },
  postAddress: {
    flex: 1,
    fontSize: responsiveFont(12),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Regular,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(20),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing(24),
  },
  emptyIcon: {
    fontSize: responsiveFont(32),
    marginBottom: responsiveSpacing(8),
  },
  emptyText: {
    fontSize: responsiveFont(16),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
    textAlign: 'center',
    marginBottom: responsiveSpacing(4),
  },
  emptySubtext: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    textAlign: 'center',
  },
});

export default RelatedPosts;
