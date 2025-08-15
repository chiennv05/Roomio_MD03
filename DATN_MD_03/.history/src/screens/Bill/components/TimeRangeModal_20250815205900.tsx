import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomSlider from '../../HomeScreen/components/CustomSlider';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';
import { Colors } from '../../../theme/color';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';

interface TimeRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (minDays: number, maxDays: number) => void;
  selectedMinDays?: number;
  selectedMaxDays?: number;
}

const TimeRangeModal: React.FC<TimeRangeModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedMinDays = 0,
  selectedMaxDays = 30,
}) => {
  const insets = useSafeAreaInsets();
  const [minDays, setMinDays] = useState(selectedMinDays);
  const [maxDays, setMaxDays] = useState(selectedMaxDays);

  useEffect(() => {
    if (visible) {
      setMinDays(selectedMinDays);
      setMaxDays(selectedMaxDays);
    }
  }, [visible, selectedMinDays, selectedMaxDays]);

  const handleConfirm = () => {
    onConfirm(minDays, maxDays);
    onClose();
  };

  const handleReset = () => {
    // Reset về giá trị mặc định (xóa filter)
    onConfirm(0, 30);
    onClose();
  };

  const handleSliderChange = (values: number[]) => {
    setMinDays(values[0]);
    setMaxDays(values[1]);
  };

  const getTimeRangeText = () => {
    if (minDays === 0 && maxDays === 30) {
      return 'Tất cả thời gian';
    }
    if (minDays === 0) {
      return `Trong ${maxDays} ngày gần đây`;
    }
    if (maxDays === 30) {
      return `Từ ${minDays} ngày trước trở đi`;
    }
    return `Từ ${minDays} đến ${maxDays} ngày trước`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Khoảng thời gian</Text>
            <Text style={styles.subtitle}>Lọc tìm kiếm theo thời gian tạo hóa đơn</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Time Range Display */}
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {getTimeRangeText()}
              </Text>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <CustomSlider
                values={[minDays, maxDays]}
                onValuesChange={handleSliderChange}
                minValue={0}
                maxValue={90}
              />
            </View>

            {/* Quick Selection Buttons */}
            <View style={styles.quickSelectionContainer}>
              <TouchableOpacity
                style={[styles.quickButton, minDays === 0 && maxDays === 7 ? styles.quickButtonActive : {}]}
                onPress={() => {
                  setMinDays(0);
                  setMaxDays(7);
                }}
              >
                <Text style={[styles.quickButtonText, minDays === 0 && maxDays === 7 ? styles.quickButtonTextActive : {}]}>
                  7 ngày
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickButton, minDays === 0 && maxDays === 30 ? styles.quickButtonActive : {}]}
                onPress={() => {
                  setMinDays(0);
                  setMaxDays(30);
                }}
              >
                <Text style={[styles.quickButtonText, minDays === 0 && maxDays === 30 ? styles.quickButtonTextActive : {}]}>
                  30 ngày
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickButton, minDays === 0 && maxDays === 90 ? styles.quickButtonActive : {}]}
                onPress={() => {
                  setMinDays(0);
                  setMaxDays(90);
                }}
              >
                <Text style={[styles.quickButtonText, minDays === 0 && maxDays === 90 ? styles.quickButtonTextActive : {}]}>
                  90 ngày
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ItemButtonConfirm
              title="Xác nhận"
              icon={Icons.IconRemoveWhite}
              onPress={handleConfirm}
              onPressIcon={handleReset}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TimeRangeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    height: '55%',
  },
  header: {
    padding: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(10),
  },
  title: {
    fontSize: responsiveFont(24),
    fontWeight: 'bold',
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(4),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  content: {
    paddingTop: responsiveSpacing(10),
    alignItems: 'stretch',
  },
  timeDisplay: {
    marginBottom: responsiveSpacing(20),
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: responsiveSpacing(40),
    paddingHorizontal: responsiveSpacing(20),
  },
  timeText: {
    fontFamily: 'Roboto',
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    lineHeight: responsiveFont(24),
    color: Colors.darkGray,
    textAlign: 'left',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: responsiveSpacing(80),
    justifyContent: 'center',
    marginBottom: responsiveSpacing(20),
  },
  quickSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: responsiveSpacing(20),
    marginBottom: responsiveSpacing(20),
  },
  quickButton: {
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: responsiveSpacing(20),
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
  },
  quickButtonActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  quickButtonText: {
    fontSize: responsiveFont(14),
    fontWeight: '600',
    color: Colors.darkGray,
  },
  quickButtonTextActive: {
    color: Colors.white,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: responsiveSpacing(20),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.backgroud,
  },
});
