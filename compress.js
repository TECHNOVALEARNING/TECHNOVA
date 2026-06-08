import sharp from 'sharp';
import fs from 'fs';

async function compressImage() {
  const inputPath = 'public/og-image.png';
  const outputPath = 'public/og-image-compressed.png';

  try {
    console.log('Démarrage de la compression...');
    await sharp(inputPath)
      .resize(1200, 630, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 60, compressionLevel: 9 })
      .toFile(outputPath);
      
    // Remplacer l'ancienne image par la nouvelle
    fs.renameSync(outputPath, inputPath);
    console.log('Compression terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la compression:', error);
  }
}

compressImage();
