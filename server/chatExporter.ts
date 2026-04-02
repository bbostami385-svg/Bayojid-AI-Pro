/**
 * চ্যাট এক্সপোর্টার সার্ভিস
 * কথোপকথন PDF এবং JSON ফরম্যাটে এক্সপোর্ট করুন
 */

import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

export interface ChatMessage {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  createdAt: number | Date;
  tokens?: number;
}

export interface ConversationData {
  id: number;
  title: string;
  model?: string;
  createdAt: number | Date;
  updatedAt?: number | Date;
  messages: ChatMessage[];
}

/**
 * চ্যাট এক্সপোর্টার ক্লাস
 */
export class ChatExporter {
  /**
   * JSON ফরম্যাটে এক্সপোর্ট করুন
   */
  static exportToJSON(conversation: ConversationData): string {
    const exportData = {
      metadata: {
        title: conversation.title,
        model: conversation.model || 'default',
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messages.length,
        exportedAt: new Date().toISOString()
      },
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        model: msg.model,
        createdAt: msg.createdAt,
        tokens: msg.tokens
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * CSV ফরম্যাটে এক্সপোর্ট করুন
   */
  static exportToCSV(conversation: ConversationData): string {
    const headers = ['ক্রম', 'ভূমিকা', 'বার্তা', 'মডেল', 'সময়', 'টোকেন'];
    const rows = conversation.messages.map((msg, index) => [
      index + 1,
      msg.role === 'user' ? 'ব্যবহারকারী' : 'সহায়ক',
      `"${msg.content.replace(/"/g, '""')}"`, // CSV এস্কেপিং
      msg.model || 'ডিফল্ট',
      new Date(msg.createdAt).toLocaleString('bn-BD'),
      msg.tokens || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Markdown ফরম্যাটে এক্সপোর্ট করুন
   */
  static exportToMarkdown(conversation: ConversationData): string {
    const lines: string[] = [];

    // শিরোনাম
    lines.push(`# ${conversation.title}`);
    lines.push('');

    // মেটাডেটা
    lines.push('## তথ্য');
    lines.push(`- **মডেল**: ${conversation.model || 'ডিফল্ট'}`);
    lines.push(`- **তৈরি**: ${new Date(conversation.createdAt).toLocaleString('bn-BD')}`);
    lines.push(`- **মোট বার্তা**: ${conversation.messages.length}`);
    lines.push('');

    // কথোপকথন
    lines.push('## কথোপকথন');
    lines.push('');

    conversation.messages.forEach((message, index) => {
      const roleEmoji = message.role === 'user' ? '👤' : '🤖';
      const roleLabel = message.role === 'user' ? 'ব্যবহারকারী' : 'সহায়ক';
      
      lines.push(`### ${roleEmoji} ${roleLabel}`);
      lines.push('');
      lines.push(message.content);
      lines.push('');
      
      if (message.model) {
        lines.push(`*মডেল: ${message.model}*`);
      }
      
      lines.push(`*${new Date(message.createdAt).toLocaleString('bn-BD')}*`);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Text ফরম্যাটে এক্সপোর্ট করুন
   */
  static exportToText(conversation: ConversationData): string {
    const lines: string[] = [];

    // শিরোনাম
    lines.push(`${conversation.title}`);
    lines.push('='.repeat(conversation.title.length));
    lines.push('');

    // মেটাডেটা
    lines.push(`মডেল: ${conversation.model || 'ডিফল্ট'}`);
    lines.push(`তৈরি: ${new Date(conversation.createdAt).toLocaleString('bn-BD')}`);
    lines.push(`মোট বার্তা: ${conversation.messages.length}`);
    lines.push('');
    lines.push('-'.repeat(50));
    lines.push('');

    // কথোপকথন
    conversation.messages.forEach((message) => {
      const roleLabel = message.role === 'user' ? '[ব্যবহারকারী]' : '[সহায়ক]';
      lines.push(`${roleLabel} ${new Date(message.createdAt).toLocaleTimeString('bn-BD')}`);
      lines.push(message.content);
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * ফাইল নাম তৈরি করুন
   */
  static generateFileName(conversation: ConversationData, format: 'json' | 'csv' | 'md' | 'txt'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const title = conversation.title
      .replace(/[^a-zA-Z0-9\u0980-\u09FF\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);

    const extensions: Record<string, string> = {
      json: 'json',
      csv: 'csv',
      md: 'md',
      txt: 'txt'
    };

    return `${title}_${timestamp}.${extensions[format]}`;
  }

  /**
   * সব টেক্সট ফরম্যাটে এক্সপোর্ট করুন
   */
  static exportAll(conversation: ConversationData): Record<string, string> {
    return {
      json: this.exportToJSON(conversation),
      csv: this.exportToCSV(conversation),
      markdown: this.exportToMarkdown(conversation),
      text: this.exportToText(conversation)
    };
  }

  /**
   * ডাউনলোড লিংক তৈরি করুন
   */
  static createDownloadLink(content: string, fileName: string, mimeType: string): string {
    const blob = new Blob([content], { type: mimeType });
    return URL.createObjectURL(blob);
  }
}

export default ChatExporter;
