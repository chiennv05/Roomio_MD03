import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
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
    },
    {
      key: 'heThong',
      label: 'Hệ Thống',
      badge: 0,
    },
    {
      key: 'hopDong',
      label: 'Hợp Đồng',
      badge: 0,
    },
    {
      key: 'thanhToan',
      label: 'Thanh Toán',
      badge: 0,
    },
    {
      key: 'hoTro',
      label: 'Hỗ Trợ',
      badge: 0,
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
                  <View style={styles.activeTab}>
                    <Text style={styles.activeTabText}>{tab.label}</Text>
                    {tab.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{tab.badge}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.inactiveTab}>
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
    marginTop: responsiveSpacing(8),
  },
  scrollContainer: {
    marginBottom: responsiveSpacing(4),
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing(8),
    paddingRight: responsiveSpacing(16),
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
    marginRight: responsiveSpacing(8),
    minHeight: moderateScale(40),
    overflow: 'hidden',
    minWidth: moderateScale(80),
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: responsiveSpacing(8),
  },
  activeTab: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(12),
    borderRadius: moderateScale(18),
    backgroundColor: Colors.limeGreen,
    borderWidth: 0,
  },
  inactiveTab: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(12),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(24),
  },
  tabText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.dearkOlive,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: responsiveSpacing(12),
  },
  activeTabText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: responsiveSpacing(12),
  },
  badge: {
    position: 'absolute',
    top: responsiveSpacing(2), // đẩy xuống dưới để không bị cắt góc
    right: responsiveSpacing(6),
    backgroundColor: Colors.error,
    borderRadius: moderateScale(10),
    minWidth: moderateScale(18),
    height: moderateScale(18),
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
