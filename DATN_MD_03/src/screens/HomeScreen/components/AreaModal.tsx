import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomSlider from './CustomSlider';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';
import { Colors } from '../../../theme/color';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';

interface AreaModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (minArea: number, maxArea: number) => void;
  selectedMinArea?: number;
  selectedMaxArea?: number;
}

const AreaModal: React.FC<AreaModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedMinArea = 20,
  selectedMaxArea = 70,
}) => {
  const insets = useSafeAreaInsets();
  const [minArea, setMinArea] = useState(selectedMinArea);
  const [maxArea, setMaxArea] = useState(selectedMaxArea);

  useEffect(() => {
    if (visible) {
      setMinArea(selectedMinArea);
      setMaxArea(selectedMaxArea);
    }
  }, [visible, selectedMinArea, selectedMaxArea]);

  const handleConfirm = () => {
    onConfirm(minArea, maxArea);
    onClose();
  };

  const handleReset = () => {
    // Reset về giá trị mặc định (xóa filter)
    onConfirm(20, 70);
    onClose();
  };



  const handleSliderChange = (values: number[]) => {
    setMinArea(values[0]);
    setMaxArea(values[1]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Diện tích</Text>
            <Text style={styles.subtitle}>Lọc tìm kiếm theo diện tích</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Area Display */}
            <View style={styles.areaDisplay}>
              <Text style={styles.areaText}>
                Diện tích từ <Text style={styles.areaValue}>{minArea}m²</Text> đến <Text style={styles.areaValue}>{maxArea}m²</Text>
              </Text>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <CustomSlider
                values={[minArea, maxArea]}
                onValuesChange={handleSliderChange}
                minValue={10}
                maxValue={100}
              />
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

export default AreaModal;

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
    height: '47%', // Tăng chiều cao để có đủ không gian cho slider
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
    // paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(10), // Giảm padding top
    // paddingBottom: responsiveSpacing(100), // Đảm bảo không bị che bởi footer
    alignItems: 'stretch', // Cho phép content căn trái
  },
  areaDisplay: {
    marginBottom: responsiveSpacing(30), // Giảm khoảng cách
    alignItems: 'flex-start', // Căn trái
    justifyContent: 'center',
    height: responsiveSpacing(40), // Giảm chiều cao hơn nữa
    paddingHorizontal: responsiveSpacing(20),
  },
  areaText: {
    fontFamily: 'Roboto',
    fontSize: responsiveFont(24), // Tăng font size
    fontWeight: 'bold', // Làm bold
    lineHeight: responsiveFont(24),
    color: Colors.darkGray,
    textAlign: 'left', // Căn trái
  },
  areaValue: {
    fontFamily: 'Roboto',
    fontSize: responsiveFont(20), // Tăng font size
    fontWeight: 'bold', // Làm bold
    lineHeight: responsiveFont(24),
    color: Colors.darkGreen,
  },

  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: responsiveSpacing(100), // Giảm chiều cao slider container
    justifyContent: 'center',
  },

  footer: {
    position: 'absolute', // Đặt footer ở vị trí cố định
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
