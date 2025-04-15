
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueFilename } from "./randomWord";

export type FileWithType = {
  file: File;
  type: 'audio' | 'video';
};

export async function processAndUploadFile(
  file: File, 
  userId: string
): Promise<FileWithType | null> {
  // Check if it's an audio file
  if (file.type.startsWith('audio/')) {
    return { file, type: 'audio' };
  }
  
  // Check if it's a video file
  if (file.type.startsWith('video/')) {
    try {
      // Create an audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create video element to extract audio
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      
      // Wait for metadata to load
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });
      
      // Create media element source
      const source = audioContext.createMediaElementSource(video);
      const dest = audioContext.createMediaStreamDestination();
      source.connect(dest);
      
      // Start video playback
      video.play();
      
      // Record the audio stream
      const mediaRecorder = new MediaRecorder(dest.stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.start();
      
      await new Promise((resolve) => {
        video.onended = resolve;
        video.currentTime = video.duration;
      });
      
      mediaRecorder.stop();
      
      // Create audio file from chunks
      const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
      const audioFile = new File([audioBlob], file.name.replace(/\.[^/.]+$/, '.mp3'), {
        type: 'audio/mp3'
      });
      
      return { file: audioFile, type: 'video' };
    } catch (error) {
      console.error('Error extracting audio from video:', error);
      return null;
    }
  }
  
  return null;
}

export async function uploadToVault(
  fileData: FileWithType,
  userId: string,
  title: string
): Promise<boolean> {
  try {
    const fileName = generateUniqueFilename();
    const filePath = `${userId}/${fileName}.mp3`;
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('voice_memories')
      .upload(filePath, fileData.file, {
        cacheControl: '3600',
        contentType: 'audio/mp3'
      });
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('voice_memories')
      .getPublicUrl(filePath);
    
    // Create audio file record in database
    const { error: dbError } = await supabase
      .from('voice_memories')
      .insert({
        user_id: userId,
        title: title || 'Uploaded Memory',
        file_url: publicUrl,
        duration: 0, // We'll need to calculate this
        file_type: 'audio/mp3',
        tags: [fileData.type === 'video' ? 'video-extract' : 'upload']
      });
    
    if (dbError) throw dbError;
    
    return true;
  } catch (error) {
    console.error('Error uploading to vault:', error);
    return false;
  }
}
