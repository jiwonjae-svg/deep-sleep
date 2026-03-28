import React from 'react';
import { Image, StyleSheet } from 'react-native';

export type MascotPose =
  | 'standby'
  | 'sleeping'
  | 'yawning'
  | 'waving'
  | 'mixing'
  | 'alarm'
  | 'stretching'
  | 'crown'
  | 'reading'
  | 'happy';

interface MascotImageProps {
  pose?: MascotPose;
  size?: number;
}

const POSE_IMAGES: Record<MascotPose, number> = {
  standby:    require('@/assets/images/mascot/mascot-standby.png'),
  sleeping:   require('@/assets/images/mascot/mascot-sleeping.png'),
  yawning:    require('@/assets/images/mascot/mascot-yawning.png'),
  waving:     require('@/assets/images/mascot/mascot-waving.png'),
  mixing:     require('@/assets/images/mascot/mascot-mixing.png'),
  alarm:      require('@/assets/images/mascot/mascot-alarm.png'),
  stretching: require('@/assets/images/mascot/mascot-stretching.png'),
  crown:      require('@/assets/images/mascot/mascot-crown.png'),
  reading:    require('@/assets/images/mascot/mascot-reading.png'),
  happy:      require('@/assets/images/mascot/mascot-happy.png'),
};

export function MascotImage({ pose = 'standby', size = 200 }: MascotImageProps) {
  const source = POSE_IMAGES[pose] ?? POSE_IMAGES.standby;

  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
