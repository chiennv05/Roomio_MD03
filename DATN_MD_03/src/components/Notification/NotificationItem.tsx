import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface NotificationItemProps {
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  onPress?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  title, 
  content, 
  time, 
  isRead,
  onPress 
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[styles.container, { backgroundColor: isRead ? '#E0E0E0' : '#D0F2FF' }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    > 
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
      <Text style={styles.time}>{time}</Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    height: 86,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
});

export default NotificationItem; 