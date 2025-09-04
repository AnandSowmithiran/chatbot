import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbotComponent {
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

    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        content: this.generateBotResponse(messageText),
        isUser: false,
        timestamp: new Date()
      };

      this.messages.update(messages => [...messages, botMessage]);
      this.isTyping.set(false);
    }, 1000 + Math.random() * 2000);
  }

  onEnterPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private generateBotResponse(userMessage: string): string {
    const responses = [
      "That's an interesting question! Let me think about that...",
      "I understand what you're asking. Here's what I think:",
      "Thanks for sharing that with me. My perspective is:",
      "That's a great point! Here's how I see it:",
      "I appreciate you bringing that up. Consider this:"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return `${randomResponse} You mentioned "${userMessage}". I'm still learning, so please bear with me as I provide the best help I can!`;
  }
}
