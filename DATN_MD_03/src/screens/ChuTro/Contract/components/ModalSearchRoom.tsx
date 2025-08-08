import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store';
import {getLandlordRooms} from '../../../../store/slices/landlordRoomsSlice';
import ItemRoomSearch from './ItemRoomSearch';
import {
  responsiveIcon,
  responsiveSpacing,
  SCREEN,
} from '../../../../utils/responsive';
import ItemInput from '../../../LoginAndRegister/components/ItemInput';
import {TouchableOpacity} from 'react-native';
import {Image} from 'react-native';
import {Icons} from '../../../../assets/icons';
import {Colors} from '../../../../theme/color';

interface ModalSearchRoomProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoom: (
    roomId: string,
    roomName: string,
    maxOccupancys: number,
  ) => void;
}

export default function ModalSearchRoom({
  visible,
  onClose,
  onSelectRoom,
}: ModalSearchRoomProps) {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.auth);
  const {rooms} = useSelector((state: RootState) => state.landlordRooms);
  const [searchText, setSearchText] = useState('');

  // shared value for translateY
  const translateY = useSharedValue(Dimensions.get('window').height);

  // fetch rooms once
  useEffect(() => {
    if (user?.auth_token && (!rooms || rooms.length === 0)) {
      dispatch(getLandlordRooms(user.auth_token));
    }
  }, [dispatch, rooms, user?.auth_token]);

  // show/hide animation
  useEffect(() => {
    translateY.value = withSpring(
      visible ? 0 : Dimensions.get('window').height,
      {damping: 20},
    );
  }, [visible, translateY]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const next = ctx.startY + event.translationY;
      translateY.value = next < 0 ? 0 : next;
    },
    onEnd: event => {
      if (event.translationY > SCREEN.height * 0.25) {
        // if dragged down sufficiently, close
        translateY.value = withSpring(SCREEN.height, {}, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, {damping: 20});
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  const filteredRooms = rooms.filter(
    room =>
      room.status === 'trong' &&
      room.approvalStatus === 'duyet' &&
      room.roomNumber?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleSelect = (id: string, name: string, max: number) => {
    onSelectRoom(id, name, max);
    onClose();
  };

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={styles.backdrop} />
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.handle} />
          <ItemInput
            placeholder="Tìm kiếm phòng"
            value={searchText}
            onChangeText={setSearchText}
            editable
          />
          <View style={styles.list}>
            <FlatList
              data={filteredRooms}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <ItemRoomSearch
                  room={item}
                  onPress={() =>
                    handleSelect(
                      item._id || '',
                      item.roomNumber,
                      item.maxOccupancy,
                    )
                  }
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Không tìm thấy phòng nào</Text>
              }
            />
          </View>
          <TouchableOpacity style={styles.iconClose} onPress={onClose}>
            <Image
              source={{uri: Icons.IconRemoveFilter}}
              style={styles.styleIconClose}
            />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(16),
  },
  handle: {
    width: responsiveSpacing(40),
    height: responsiveSpacing(4),
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: responsiveSpacing(16),
  },
  list: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  styleIconClose: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: Colors.black,
  },
  iconClose: {
    position: 'absolute',
    top: '2%',
    right: '3%',
    zIndex: 1,
    width: responsiveIcon(30),
    height: responsiveIcon(30),
    backgroundColor: Colors.gray200,
    borderRadius: responsiveIcon(30) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
