import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute, RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../../types/route'

// Type cho route params
type DetailRoomRouteProp = RouteProp<RootStackParamList, 'DetailRoom'>;

const DetailRoomScreen = () => {
  const route = useRoute<DetailRoomRouteProp>();
  const { roomId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DetailRoomScreen</Text>
      <Text style={styles.roomId}>Room ID: {roomId}</Text>
    </View>
  )
}

export default DetailRoomScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roomId: {
    fontSize: 16,
    color: '#666',
  },
})