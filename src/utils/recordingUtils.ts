
export const formatRecording = (data: any) => ({
  id: data.id,
  title: data.title,
  createdAt: new Date(data.created_at),
  duration: Number(data.duration),
  audioUrl: data.file_url,
  tags: data.tags || []
});

export const getMediaStream = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw new Error("Could not access microphone. Please check permissions.");
  }
};
