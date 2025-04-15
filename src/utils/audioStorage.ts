
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueFilename } from "./randomWord";

export async function downloadAndStoreAudioFile(url: string, userId: string): Promise<string> {
  try {
    // Download the audio file
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to download audio file');
    
    const audioBlob = await response.blob();
    const fileName = `${userId}/${generateUniqueFilename()}.mp3`;

    // Upload to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('ai_generated_audio')
      .upload(fileName, audioBlob, {
        cacheControl: '3600',
        contentType: 'audio/mpeg'
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('ai_generated_audio')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error storing audio file:', error);
    throw error;
  }
}
