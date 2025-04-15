
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

export interface Credits {
  available: number;
  subscription: SubscriptionTier | null;
  subscriptionEndsAt: Date | null;
}

export type SubscriptionTier = 'none' | 'basic' | 'premium';

export type PaymentType = 'one-time' | 'subscription';
