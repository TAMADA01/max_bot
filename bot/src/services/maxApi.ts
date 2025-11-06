import axios from 'axios';

export class MaxApiService {
  private baseUrl: string;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.baseUrl = 'https://api.max.com/v1'; // Замените на реальный URL API MAX
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async sendMessage(chatId: string, text: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages/send`,
        {
          chat_id: chatId,
          text: text
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendMessageWithButtons(chatId: string, text: string, buttons: any[]) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages/send`,
        {
          chat_id: chatId,
          text: text,
          buttons: buttons
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message with buttons:', error);
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${userId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async setWebhook(url: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook`,
        { url },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error setting webhook:', error);
      throw error;
    }
  }
}