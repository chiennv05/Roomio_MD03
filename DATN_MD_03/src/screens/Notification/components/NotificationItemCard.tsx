import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';
import { Icons } from '../../../assets/icons';

interface NotificationItemCardProps {
  title: string;
  content: string;
  time: string;
  date: string; // Ngày hiển thị (VD: "24/06/2025")
  isRead: boolean;
  type: string;
  icon?: ImageSourcePropType | any; // Icon để hiển thị
  onPress?: () => void;
}

const NotificationItemCard: React.FC<NotificationItemCardProps> = ({ 
  title, 
  content, 
  time,
  date,
  isRead,
  type,
  icon,
  onPress 
}) => {
  // Icon dựa trên trạng thái đọc/chưa đọc
  const getStatusIcon = () => {
    if (isRead) {
      return Icons.IconTick; // Tick icon cho đã đọc
    } else {
      return Icons.IconWarning; // Warning icon cho chưa đọc
    }
  };

  const getImageSource = () => {
    const iconSource = getStatusIcon();
    if (!iconSource) return undefined;
    if (typeof iconSource === 'string') {
      return {uri: iconSource};
    }
    return iconSource;
  };

  // Màu icon và background dựa trên trạng thái
  const getStatusColor = () => {
    if (isRead) {
      return {
        cardBg: Colors.gray200,
    
      };
    } else {
      return {
        cardBg: Colors.limeGreen + '99',
     
      };
    }
  };

  const statusColors = getStatusColor();

  return (
          <TouchableOpacity 
        style={[
          styles.container,
          {
            backgroundColor: statusColors.cardBg,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      > 
      {/* Icon trạng thái */}
      <View style={[styles.iconContainer]}>
        <Image 
          source={getImageSource()}
          style={[styles.iconImage]}
          resizeMode="contain"
        />
      </View>

      {/* Nội dung */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        
        <Text style={styles.content} numberOfLines={2}>
          {content}
        </Text>
{/*         
        <Text style={styles.time}>{time}</Text> */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: responsiveSpacing(16),
    borderRadius: moderateScale(12),
    marginBottom: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(16),
    height: moderateScale(86),
    shadowOffset: {
      width: moderateScale(0),
      height: moderateScale(1),
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,

  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: responsiveSpacing(12),
  },
  iconImage: {
    width: moderateScale(40),
    height: moderateScale(40),
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  content: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    lineHeight: responsiveFont(18),
    marginBottom: responsiveSpacing(6),
  },
  time: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.mediumGray,
  },
});

export default NotificationItemCard; 