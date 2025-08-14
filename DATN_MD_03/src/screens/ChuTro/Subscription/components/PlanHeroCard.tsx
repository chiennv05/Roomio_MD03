import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts} from '../../../../theme/fonts';
import {Colors} from '../../../../theme/color';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';

type Props = {
  colors: [string, string];
  title: string;
  isMuted?: boolean;
  priceText: string;
  durationText?: string;
  bullets: string[];
  isCurrent?: boolean;
  onPress?: () => void;
  routeLabel?: string;
  planKey?: string;
  isPopular?: boolean;
  showGuarantee?: boolean;
  badgeLabel?: string;
};

export default function PlanHeroCard({
  colors,
  title,
  isMuted,
  priceText,
  durationText,
  bullets,
  isCurrent,
  onPress,
  routeLabel,
  planKey,
  showGuarantee,
  badgeLabel,
}: Props) {
  return (
    <LinearGradient
      colors={isMuted ? colors : colors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.card, isMuted && styles.cardMuted, styles.tilt]}
    >
      {!!badgeLabel && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>{badgeLabel}</Text>
        </View>
      )}
      {!!routeLabel && (
        routeLabel.includes('→') ? (
          <View style={styles.routePill}>
            <Text style={styles.routeFrom}>{routeLabel.split('→')[0].trim()}</Text>
            <Image source={{uri: Icons.IconArrowRight}} style={styles.routeArrow} />
            <Text style={styles.routeTo}>{routeLabel.split('→')[1].trim()}</Text>
          </View>
        ) : (
          <Text style={styles.routeLabel}>{routeLabel}</Text>
        )
      )}
      <Text style={styles.planName} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
      {!!priceText && (
        <View style={styles.priceRow}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.price}>{priceText}</Text>
          {!!durationText && <Text style={styles.per}>/ {durationText}</Text>}
        </View>
      )}
      <View style={styles.bullets}>
        {bullets.map((b, i) => (
          <View key={i.toString()} style={styles.bulletRow}>
            <Image source={{uri: 'asset:/icons/icon_check.png'}} style={styles.bulletIcon} />
            <Text style={styles.bullet}>{b}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        disabled={false}
        style={[styles.cta]}
        onPress={onPress}
      >
        <Text style={styles.ctaText}>
          {isCurrent ? 'Quản lý gói' : planKey === 'free' ? 'Bắt đầu miễn phí' : 'Nâng cấp gói này'}
        </Text>
      </TouchableOpacity>
      {showGuarantee && (
        <Text style={styles.guarantee}>Hoàn tiền trong 7 ngày</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    paddingVertical: verticalScale(26),
    paddingHorizontal: scale(16),
    marginHorizontal: scale(8),
    minHeight: verticalScale(360),
  },
  cardMuted: {opacity: 0.95},
  tilt: {transform: [{skewY: '-2deg'}]},
  popularBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#111827',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: 999,
    marginBottom: verticalScale(4),
  },
  popularText: {
    color: '#fff',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(11),
  },
  routeLabel: {
    textAlign: 'center',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: verticalScale(6),
  },
  routePill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 999,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    marginBottom: verticalScale(6),
  },
  routeFrom: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    color: '#374151',
    marginRight: scale(6),
  },
  routeArrow: {
    width: scale(5),
    height: scale(12),
    tintColor: '#111827',
    marginRight: scale(6),
  },
  routeTo: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    color: Colors.black,
  },
  planName: {
    textAlign: 'center',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(24),
    color: Colors.black,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  crown: {fontSize: responsiveFont(24), marginRight: scale(8)},
  price: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(24), color: Colors.black},
  per: {marginLeft: scale(8), fontFamily: Fonts.Roboto_Regular, fontSize: responsiveFont(15), color: '#2b2b2b'},
  bullets: {marginTop: verticalScale(16), gap: verticalScale(8)},
  bulletRow: {flexDirection: 'row', alignItems: 'center'},
  bulletIcon: {width: scale(16), height: scale(16), marginRight: scale(8), tintColor: Colors.dearkOlive},
  bullet: {fontFamily: Fonts.Roboto_Regular, fontSize: responsiveFont(15), color: '#111827'},
  cta: {
    marginTop: verticalScale(20),
    backgroundColor: '#fff',
    alignSelf: 'center',
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(12),
    borderRadius: 16,
  },
  ctaDisabled: {opacity: 0.7},
  ctaText: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(16), color: Colors.black},
  guarantee: {
    marginTop: verticalScale(8),
    textAlign: 'center',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(11),
    color: '#374151',
  },
});


