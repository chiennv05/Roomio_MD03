import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../utils/responsive';

interface NotificationHeaderProps {
  activeTab: 'all' | 'schedule' | 'bill' | 'contract';
  onTabChange: (tab: 'all' | 'schedule' | 'bill' | 'contract') => void;
  unreadCount: number;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
}) => {
  const tabs = [
    {
      key: 'all',
      label: 'Tất cả',
      badge: unreadCount,
      icon: Icons.IconNotification,
      gradient: [Colors.limeGreen, Colors.darkGreen],
    },
    {
      key: 'schedule',
      label: 'Lịch xem phòng',
      badge: 0,
      icon: Icons.IconPaper,
      gradient: ['#11998e', '#38ef7d'],
    },
    {
      key: 'bill',
      label: 'Hóa đơn',
      badge: 0,
      icon: Icons.IconPaper,
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      key: 'contract',
      label: 'Hợp đồng',
      badge: 0,
      icon: Icons.IconDieuKhoan,
      gradient: ['#4facfe', '#00f2fe'],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollContainer}>
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  index === 0 && styles.firstTab,
                  index === tabs.length - 1 && styles.lastTab,
                ]}
                onPress={() => onTabChange(tab.key as any)}
                activeOpacity={0.8}>
                {isActive ? (
                  <LinearGradient
                    colors={tab.gradient}
                    style={styles.activeTabGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}>
                    <Image source={{uri: tab.icon}} style={styles.iconImage} />
                    <Text style={styles.activeTabText}>{tab.label}</Text>
                    {tab.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{tab.badge}</Text>
                      </View>
                    )}
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveTab}>
                    <Image
                      source={{uri: tab.icon}}
                      style={styles.iconImageInactive}
                    />
                    <Text style={styles.tabText}>{tab.label}</Text>
                    {tab.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{tab.badge}</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: responsiveSpacing(20),
    paddingHorizontal: responsiveSpacing(16),
  },
  scrollContainer: {
    marginBottom: responsiveSpacing(8),
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing(4),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroud,
    borderRadius: moderateScale(30),
    padding: responsiveSpacing(6),
    minWidth: '100%',
    shadowColor: Colors.shadowDefault,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(24),
    position: 'relative',
    marginHorizontal: responsiveSpacing(2),
    minHeight: moderateScale(48),
    overflow: 'hidden',
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 0,
  },
  activeTabGradient: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: moderateScale(24),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inactiveTab: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    backgroundColor: 'transparent',
  },
  iconImage: {
    width: responsiveFont(18),
    height: responsiveFont(18),
    marginRight: responsiveSpacing(6),
    tintColor: Colors.white,
  },
  iconImageInactive: {
    width: responsiveFont(16),
    height: responsiveFont(16),
    marginRight: responsiveSpacing(4),
    opacity: 0.6,
    tintColor: Colors.unselectedText,
  },
  tabText: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.unselectedText,
    textAlign: 'center',
    flex: 1,
  },
  activeTabText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    textAlign: 'center',
    flex: 1,
    textShadowColor: Colors.shadowDefault,
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: responsiveSpacing(-4),
    right: responsiveSpacing(8),
    backgroundColor: Colors.error,
    borderRadius: moderateScale(12),
    minWidth: moderateScale(20),
    height: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    fontSize: responsiveFont(10),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
});

export default NotificationHeader;
