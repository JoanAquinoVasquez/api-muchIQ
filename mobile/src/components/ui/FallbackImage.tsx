import React, { useState } from 'react';
import { Image, ImageProps } from 'react-native';

interface FallbackImageProps extends ImageProps {
  fallbackSource?: any;
}

export default function FallbackImage({ 
  source, 
  fallbackSource = { uri: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800' }, 
  ...props 
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      source={error ? fallbackSource : source}
      onError={() => setError(true)}
      {...props}
    />
  );
}
