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
  activeTab: 'all' | 'heThong' | 'hopDong' | 'thanhToan' | 'hoTro';
  onTabChange: (tab: 'all' | 'heThong' | 'hopDong' | 'thanhToan' | 'hoTro') => void;
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
      color: '#6B7280', // gray-500 - màu trung tính cho Tất cả
    },
    {
      key: 'heThong',
      label: 'Hệ Thống',
      badge: 0,
      icon: Icons.IconHeThong,
      color: '#2563EB', // blue-600
    },
    {
      key: 'hopDong',
      label: 'Hợp Đồng',
      badge: 0,
      icon: Icons.IconHopDong,
      color: '#059669', // green-600 - màu xanh lá của Tất cả
    },
    {
      key: 'thanhToan',
      label: 'Thanh Toán',
      badge: 0,
      icon: Icons.IconThanhToan,
      color: '#EA580C', // orange-600
    },
    {
      key: 'hoTro',
      label: 'Hỗ Trợ',
      badge: 0,
      icon: Icons.IconHoTro,
      color: '#9333EA', // purple-600 - màu tím
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
    paddingHorizontal: responsiveSpacing(8),
    marginTop: responsiveSpacing(25), // Giảm từ 25 xuống 8
  },
  scrollContainer: {
    marginBottom: responsiveSpacing(4), // Giảm từ 8 xuống 4
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing(8),
    paddingRight: responsiveSpacing(16), // Thêm padding phải để đảm bảo tab cuối hiển thị đầy đủ
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
    marginRight: responsiveSpacing(8), // Giảm từ 10 xuống 8
    minHeight: moderateScale(40),
    overflow: 'hidden',
    minWidth: moderateScale(80), // Thêm minWidth để đảm bảo tab có kích thước tối thiểu
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: responsiveSpacing(8), // Thêm margin cho tab cuối
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
    borderWidth: 2, // Tăng từ 1 lên 2 để đậm hơn
  },
  inactiveTab: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(10), // Giảm từ 12 xuống 10
    paddingHorizontal: responsiveSpacing(12), // Giảm từ 16 xuống 12
    backgroundColor: 'transparent',
    borderRadius: moderateScale(24),
  },
  iconImageActive: {
    width: responsiveFont(16), // Giảm từ 18 xuống 16
    height: responsiveFont(16),
    marginRight: responsiveSpacing(4), // Giảm từ 6 xuống 4
  },
  iconImageInactive: {
    width: responsiveFont(14), // Giảm từ 16 xuống 14
    height: responsiveFont(14),
    marginRight: responsiveSpacing(3), // Giảm từ 4 xuống 3
    opacity: 0.6,
    tintColor: Colors.unselectedText,
  },
  tabText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular, // Đổi về Regular
    color: Colors.textGray,
    textAlign: 'center',
    letterSpacing: 0.3, // Thêm letter spacing
  },
  activeTabText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold, // Giữ Bold cho tab active
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: 0.3, // Thêm letter spacing
  },
  badge: {
    position: 'absolute',
    top: responsiveSpacing(-4),
    right: responsiveSpacing(6), // Giảm từ 8 xuống 6
    backgroundColor: Colors.error,
    borderRadius: moderateScale(10), // Giảm từ 12 xuống 10
    minWidth: moderateScale(18), // Giảm từ 20 xuống 18
    height: moderateScale(18), // Giảm từ 20 xuống 18
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
    fontSize: responsiveFont(9), // Giảm từ 10 xuống 9
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
});

export default NotificationHeader;
