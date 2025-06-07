import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {SCREEN} from '../../../utils/responsive';

// Cấu hình tiếng Việt cho calendar
LocaleConfig.locales['vi'] = {
  monthNames: [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ],
  monthNamesShort: [
    'Th01',
    'Th02',
    'Th03',
    'Th04',
    'Th05',
    'Th06',
    'Th07',
    'Th08',
    'Th09',
    'Th10',
    'Th11',
    'Th12',
  ],
  dayNames: [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay',
};
LocaleConfig.defaultLocale = 'vi';

export default function BirthdayPicker() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const onDayPress = (day: {dateString: string}) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn ngày sinh</Text>

      <Calendar
        onDayPress={onDayPress}
        maxDate={new Date().toISOString().split('T')[0]} // Không cho chọn ngày sau hôm nay
        markedDates={
          selectedDate
            ? {
                [selectedDate]: {selected: true, selectedColor: '#4CAF50'},
              }
            : {}
        }
        theme={{
          selectedDayBackgroundColor: '#4CAF50',
          todayTextColor: '#4CAF50',
          arrowColor: '#4CAF50',
          monthTextColor: '#333',
          textDayFontWeight: '600',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
        }}
      />

      <Text style={styles.selectedDateText}>
        {selectedDate
          ? `Ngày sinh bạn chọn: ${selectedDate}`
          : 'Chưa chọn ngày'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
    width: SCREEN.width * 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectedDateText: {marginTop: 20, fontSize: 16, textAlign: 'center'},
});
7;
