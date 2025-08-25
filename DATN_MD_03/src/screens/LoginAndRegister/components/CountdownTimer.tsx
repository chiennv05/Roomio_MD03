// CountdownTimer.tsx
import React, {useEffect, useState, useRef} from 'react';
import {Text, StyleSheet} from 'react-native';
import {responsiveFont} from '../../../utils/responsive';
import {Fonts} from '../../../theme/fonts';
import {Colors} from '../../../theme/color';

interface Props {
  initialTime?: number;
}

const CountdownTimer: React.FC<Props> = ({initialTime = 300}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {return;} // tránh tạo lại interval

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!); // cleanup
  }, []);

  const formatTime = (seconds: number) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  return <Text style={styles.textConditionGreen}>{formatTime(timeLeft)}</Text>;
};

export default React.memo(CountdownTimer);

const styles = StyleSheet.create({
  textConditionGreen: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGreen,
    fontWeight: 'bold',
  },
});
