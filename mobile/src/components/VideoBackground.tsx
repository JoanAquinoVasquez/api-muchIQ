import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../design-system/theme';

interface VideoBackgroundProps {
  opacity?: number;
  showGradient?: boolean;
}

export default function VideoBackground({ 
  opacity = 0.6, 
  showGradient = true 
}: VideoBackgroundProps) {
  const videoRef = useRef<Video>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && !isLoaded) {
      setIsLoaded(true);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('@assets/videos/background.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        rate={0.75} // Slow motion elegante
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
      
      {showGradient && (
        <LinearGradient
          colors={[
            `rgba(26, 155, 142, ${opacity * 0.4})`,
            `rgba(21, 107, 99, ${opacity * 0.6})`,
            `rgba(31, 41, 55, ${opacity})`,
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});