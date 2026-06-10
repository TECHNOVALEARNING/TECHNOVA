export const uploadFileToLWS = async (file: File): Promise<string> => {
  const UPLOAD_URL = 'https://stockage.technovalearning.com/upload.php';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || result.error || !result.url) {
      throw new Error(result.error || 'Erreur lors du téléversement vers LWS (Vérifiez votre dossier uploads ou vos permissions LWS)');
    }

    return result.url;
  } catch (error) {
    console.error('Erreur Upload LWS:', error);
    throw error;
  }
};
