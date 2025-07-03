import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';

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
    { key: 'all', label: 'Tất cả', badge: unreadCount },
    { key: 'schedule', label: 'Lịch xem phòng', badge: 0 },
    { key: 'bill', label: 'Hóa đơn', badge: 0 },
    { key: 'contract', label: 'Hợp đồng', badge: 0 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollContainer}
      >
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
                index === 0 && styles.firstTab,
                index === tabs.length - 1 && styles.lastTab,
              ]}
              onPress={() => onTabChange(tab.key as any)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
              {tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroud,
    paddingBottom: responsiveSpacing(12),
  },
  scrollContainer: {
    marginBottom: responsiveSpacing(12),
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing(4),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: moderateScale(25),
    padding: responsiveSpacing(4),
    minWidth: '100%',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: moderateScale(20),
    position: 'relative',
    marginHorizontal: responsiveSpacing(2),
    minWidth: moderateScale(80),
    backgroundColor: Colors.white,
    height: moderateScale(44),
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 0,
  },
  activeTab: {
    backgroundColor: Colors.limeGreen,
    shadowColor: Colors.limeGreen,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    textAlign: 'center',
  },
  activeTabText: {
    color: Colors.black,
    // fontFamily: Fonts.Roboto_Bold,
  },
  badge: {
    position: 'absolute',
    top: responsiveSpacing(-2),
    right: responsiveSpacing(4),
    backgroundColor: Colors.red,
    borderRadius: moderateScale(10),
    minWidth: moderateScale(18),
    height: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: {
    fontSize: responsiveFont(9),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },

});

export default NotificationHeader; 