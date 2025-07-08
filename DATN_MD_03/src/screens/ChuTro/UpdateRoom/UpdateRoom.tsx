import {useRoute} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {View} from 'react-native';
import {Text} from 'react-native-gesture-handler';
import {RootStackParamList} from '../../../types/route';

type UpdateRoomRouteProp = RouteProp<RootStackParamList, 'UpdateRoomScreen'>;

export default function UpdateRoom() {
  const route = useRoute<UpdateRoomRouteProp>();
  const {item} = route.params;
  // UI lm giống trong AddRoomScreen =
  return (
    <View>
      <Text>Cập nhật phòng: {item.roomNumber}</Text>
      {/* Form cập nhật dữ liệu dựa trên item */}
    </View>
  );
}
