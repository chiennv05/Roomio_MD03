import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../../utils/responsive';

interface StatisticCardProps {
  title: string;
  icon: ImageSourcePropType;
  backgroundColor: string;
  iconColor?: string;
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
  onPress: () => void;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  icon,
  backgroundColor,
  iconColor = Colors.darkGray,
  stats,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor}]}
      onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={icon}
            style={[styles.icon, {tintColor: iconColor}]}
            resizeMode="contain"
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Image
          source={require('../../../../assets/icons/icon_arrow_right.png')}
          style={styles.arrowIcon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={[styles.statValue, stat.color && {color: stat.color}]}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default StatisticCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    borderRadius: scale(16),
    padding: responsiveSpacing(20),
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: scale(24),
    height: scale(24),
    marginRight: responsiveSpacing(8),
  },
  title: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  arrowIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.mediumGray,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: responsiveSpacing(8),
  },
  statLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(4),
  },
  statValue: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
});
