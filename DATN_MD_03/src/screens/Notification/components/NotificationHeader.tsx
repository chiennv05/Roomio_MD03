import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
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
      color: Colors.brandPrimary,
    },
    {
      key: 'schedule',
      label: 'Lịch xem phòng',
      badge: 0,
      icon: Icons.IconPaper,
      color: '#2563EB', // blue-600
    },
    {
      key: 'bill',
      label: 'Hóa đơn',
      badge: 0,
      icon: Icons.IconPaper,
      color: '#EA580C', // orange-600
    },
    {
      key: 'contract',
      label: 'Hợp đồng',
      badge: 0,
      icon: Icons.IconDieuKhoan,
      color: '#9333EA', // purple-600
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
                  <View
                    style={[
                      styles.activeTab,
                      {
                        borderColor: tab.color,
                        backgroundColor: Colors.brandPrimarySoft,
                      },
                    ]}>
                    <Image
                      source={{uri: tab.icon}}
                      style={[styles.iconImageActive, {tintColor: tab.color}]}
                    />
                    <Text style={[styles.activeTabText, {color: Colors.black}]}>
                      {tab.label}
                    </Text>
                    {tab.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{tab.badge}</Text>
                      </View>
                    )}
                  </View>
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
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(12),
  },
  scrollContainer: {
    marginBottom: responsiveSpacing(8),
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing(4),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    minWidth: '100%',
    borderWidth: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(24),
    position: 'relative',
    marginRight: responsiveSpacing(10),
    minHeight: moderateScale(40),
    overflow: 'hidden',
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 0,
  },
  activeTab: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(6),
    paddingHorizontal: responsiveSpacing(12),
    borderRadius: moderateScale(18),
    backgroundColor: 'transparent',
    borderWidth: 1,
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
    borderRadius: moderateScale(24),
  },
  iconImageActive: {
    width: responsiveFont(18),
    height: responsiveFont(18),
    marginRight: responsiveSpacing(6),
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
    color: Colors.black,
    textAlign: 'center',
    flex: 1,
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
