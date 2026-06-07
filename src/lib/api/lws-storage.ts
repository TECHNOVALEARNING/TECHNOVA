import { adminSupabase } from '../supabase';

export const uploadFileToLWS = async (file: File): Promise<string> => {
  try {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Determine bucket based on file type
    const isImage = file.type.startsWith('image/');
    const bucket = isImage ? 'product_images' : 'product_files';
    
    const { data, error } = await adminSupabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    if (isImage) {
      const { data: publicUrlData } = adminSupabase.storage.from(bucket).getPublicUrl(data.path);
      return publicUrlData.publicUrl;
    } else {
      // For files, we might return the path or signed url later.
      // But let's return the full URL structure just in case the system expects an absolute URL
      const { data: publicUrlData } = adminSupabase.storage.from(bucket).getPublicUrl(data.path);
      return publicUrlData.publicUrl;
    }
  } catch (error) {
    console.error('Erreur Upload Supabase:', error);
    throw new Error('Erreur lors du téléversement du fichier. ' + (error as Error).message);
  }
};
