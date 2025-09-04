import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatApiResponse {
  response: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbotComponent {
  private readonly http = inject(HttpClient);
  protected readonly messages = signal<ChatMessage[]>([
    {
      id: 1,
      content: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  protected readonly currentMessage = signal('');
  protected readonly isTyping = signal(false);

  sendMessage(): void {
    const messageText = this.currentMessage().trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.update(messages => [...messages, userMessage]);
    this.currentMessage.set('');
    this.isTyping.set(true);

    // Send HTTP POST request to the API
    this.http.post<ChatApiResponse>('http://127.0.0.1:5000/api/chat', {
      message: messageText
    }).subscribe({
      next: (response) => {
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          content: response.response,
          isUser: false,
          timestamp: new Date()
        };

        this.messages.update(messages => [...messages, botMessage]);
        this.isTyping.set(false);
      },
      error: (error) => {
        console.error('Error calling chat API:', error);
        
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
          isUser: false,
          timestamp: new Date()
        };

        this.messages.update(messages => [...messages, errorMessage]);
        this.isTyping.set(false);
      }
    });
  }

  onEnterPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
