'use client';

import { useState, useRef } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import EntityImage from './EntityImage';

// Fonction pour compresser et redimensionner l'image
const compressImage = (file: File, maxWidth: number, quality: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionner si nécessaire
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsDataURL(file);
  });
};

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  name: string;
  type: 'academicYear' | 'semester' | 'module' | 'part' | 'chapter' | 'session' | 'user';
  label?: string;
  size?: number;
}

export default function ImageUpload({
  value,
  onChange,
  name,
  type,
  label = 'Image',
  size = 150,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    // Vérifier la taille (max 2MB pour éviter les problèmes)
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 2MB. Veuillez compresser votre image.');
      return;
    }

    setUploading(true);

    try {
      // Compresser et redimensionner l'image avant conversion en base64
      const compressedImage = await compressImage(file, 800, 0.8);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        setUploading(false);
      };
      reader.onerror = () => {
        alert('Erreur lors de la lecture du fichier');
        setUploading(false);
      };
      reader.readAsDataURL(compressedImage);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 2,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        {preview ? (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={preview}
              alt={name}
              sx={{
                width: size,
                height: size,
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: 2,
              }}
            />
            <IconButton
              onClick={handleRemove}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'error.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'error.dark',
                },
              }}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <EntityImage name={name} type={type} size={size} fontSize={size * 0.3} />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={handleClick}
          disabled={uploading}
          sx={{
            borderColor: '#ff6b35',
            color: '#ff6b35',
            '&:hover': {
              borderColor: '#e55a2b',
              backgroundColor: 'rgba(255, 107, 53, 0.04)',
            },
          }}
        >
          {uploading ? 'Upload en cours...' : preview ? 'Changer l\'image' : 'Télécharger une image'}
        </Button>

        {!preview && (
          <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
            Image par défaut affichée si aucune image n'est téléchargée
          </Typography>
        )}
      </Box>
    </Box>
  );
}

