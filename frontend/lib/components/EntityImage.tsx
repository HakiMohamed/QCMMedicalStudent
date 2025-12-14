'use client';

import { Box } from '@mui/material';
import DefaultImage from './DefaultImage';

interface EntityImageProps {
  imageUrl?: string | null;
  name: string;
  type: 'academicYear' | 'semester' | 'module' | 'part' | 'chapter' | 'session' | 'user';
  size?: number;
  fontSize?: number;
  variant?: 'rounded' | 'square' | 'circular';
}

export default function EntityImage({
  imageUrl,
  name,
  type,
  size = 200,
  fontSize = 60,
  variant = 'rounded',
}: EntityImageProps) {
  if (imageUrl && imageUrl.trim() !== '') {
    return (
      <Box
        component="img"
        src={imageUrl}
        alt={name}
        sx={{
          width: size,
          height: size,
          borderRadius: variant === 'circular' ? '50%' : variant === 'rounded' ? 2 : 0,
          objectFit: 'cover',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      />
    );
  }

  return <DefaultImage name={name} type={type} size={size} fontSize={fontSize} />;
}

