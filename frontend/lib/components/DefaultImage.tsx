'use client';

import { Box, Typography } from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  MenuBook as BookIcon,
  Description as DescriptionIcon,
  Quiz as QuizIcon,
  Person as PersonIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

interface DefaultImageProps {
  name: string;
  type: 'academicYear' | 'semester' | 'module' | 'part' | 'chapter' | 'session' | 'user';
  size?: number;
  fontSize?: number;
}

const getGradientForType = (type: string): string => {
  const gradients: Record<string, string> = {
    academicYear: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    semester: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    module: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    part: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    chapter: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    session: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    user: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  };
  return gradients[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

const getIconForType = (type: string, size: number) => {
  const iconSize = size * 0.4;
  const iconProps = {
    sx: {
      fontSize: iconSize,
      color: 'white',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
    },
  };

  switch (type) {
    case 'academicYear':
      return <CalendarIcon {...iconProps} />;
    case 'semester':
      return <SchoolIcon {...iconProps} />;
    case 'module':
      return <BookIcon {...iconProps} />;
    case 'part':
      return <FolderIcon {...iconProps} />;
    case 'chapter':
      return <DescriptionIcon {...iconProps} />;
    case 'session':
      return <QuizIcon {...iconProps} />;
    case 'user':
      return <PersonIcon {...iconProps} />;
    default:
      return <BookIcon {...iconProps} />;
  }
};

const getInitials = (name: string, type: string): string => {
  if (type === 'user') {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  if (type === 'academicYear') {
    const match = name.match(/\d{4}/);
    if (match) {
      return match[0].substring(2);
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  if (type === 'semester') {
    const match = name.match(/S\d/);
    if (match) {
      return match[0];
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  if (type === 'module' || type === 'part' || type === 'chapter') {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  if (type === 'session') {
    return name.substring(0, 2).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
};

export default function DefaultImage({ name, type, size = 200, fontSize = 60 }: DefaultImageProps) {
  const gradient = getGradientForType(type);
  const icon = getIconForType(type, size);
  const initials = getInitials(name, type);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 3,
        background: gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%)',
          animation: 'shimmer 4s infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        },
        '@keyframes shimmer': {
          '0%': {
            transform: 'translateX(-100%) translateY(-100%) rotate(45deg)',
          },
          '100%': {
            transform: 'translateX(100%) translateY(100%) rotate(45deg)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {icon}
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontSize: fontSize * 0.35,
            fontWeight: 'bold',
            textAlign: 'center',
            px: 1,
            lineHeight: 1.2,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '0.5px',
          }}
        >
          {initials}
        </Typography>
      </Box>
    </Box>
  );
}

