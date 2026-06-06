export const uploadFileToLWS = async (file: File): Promise<string> => {
  // Remplacez par l'URL de votre script PHP sur LWS
  const UPLOAD_URL = 'https://votre-domaine.com/api/upload.php';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors du téléversement');
    }

    return result.url; // Retourne l'URL publique du fichier
  } catch (error) {
    console.error('Erreur Upload LWS:', error);
    throw error;
  }
};
