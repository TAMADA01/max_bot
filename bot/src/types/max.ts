export interface MaxMessage {
  id: string;
  chat_id: string;
  user_id: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

export interface MaxUser {
  id: string;
  username: string;
  first_name: string;
  last_name?: string;
}

export interface MaxChat {
  id: string;
  type: 'private' | 'group';
  title?: string;
}

export interface MaxWebhookPayload {
  event: 'message' | 'callback_query' | 'inline_query';
  data: MaxMessage | any;
}