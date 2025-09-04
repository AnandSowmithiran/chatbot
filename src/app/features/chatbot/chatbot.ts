import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import hljs from 'highlight.js';

interface ChatMessage {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
  renderedContent?: string;
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
  
  constructor() {
    this.configureMarked();
  }

  protected readonly messages = signal<ChatMessage[]>([
    {
      id: 1,
      content: "Hello! I'm your AI assistant. How can I help you today?\n\nI can help you with:\n- **Code examples** and snippets\n- *Explanations* and tutorials\n- `Technical questions`\n\nTry asking me about programming!",
      isUser: false,
      timestamp: new Date(),
      renderedContent: this.renderContent("Hello! I'm your AI assistant. How can I help you today?\n\nI can help you with:\n- **Code examples** and snippets\n- *Explanations* and tutorials\n- `Technical questions`\n\nTry asking me about programming!")
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
      timestamp: new Date(),
      renderedContent: this.renderContent(messageText)
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
          timestamp: new Date(),
          renderedContent: this.renderContent(response.response)
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
          timestamp: new Date(),
          renderedContent: this.renderContent("Sorry, I'm having trouble connecting to the server. Please try again later.")
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

  private configureMarked(): void {
    const renderer = new marked.Renderer();
    
    marked.setOptions({
      breaks: true,
      gfm: true,
      renderer: renderer
    });

    // Configure highlight.js
    hljs.configure({
      languages: ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'json', 'sql', 'bash']
    });
  }

  private renderContent(content: string): string {
    try {
      // First parse with marked for markdown
      let html = marked.parse(content) as string;
      
      // Then apply syntax highlighting to code blocks
      const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
      html = html.replace(codeBlockRegex, (match, lang, code) => {
        try {
          const decodedCode = this.decodeHtml(code);
          if (lang && hljs.getLanguage(lang)) {
            const highlighted = hljs.highlight(decodedCode, { language: lang }).value;
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
          } else {
            const highlighted = hljs.highlightAuto(decodedCode).value;
            return `<pre><code class="hljs">${highlighted}</code></pre>`;
          }
        } catch (err) {
          console.warn('Syntax highlighting failed:', err);
          return match;
        }
      });
      
      // Handle inline code blocks without language specification
      const inlineCodeRegex = /<code>([^<]+)<\/code>/g;
      html = html.replace(inlineCodeRegex, '<code class="inline-code">$1</code>');
      
      return html;
    } catch (error) {
      console.error('Markdown parsing failed:', error);
      return content.replace(/\n/g, '<br>');
    }
  }

  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
}
