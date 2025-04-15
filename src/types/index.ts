
export interface Recording {
  id: string;
  title: string;
  createdAt: Date;
  duration: number; // in seconds
  audioUrl: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type RecordingStatus = 'inactive' | 'recording' | 'paused' | 'reviewing';
