/**
 * Conversation Export Service
 * Exports conversations to multiple formats (PDF, CSV, JSON, Markdown)
 */

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json' | 'markdown' | 'txt';
  includeMetadata: boolean;
  includeTimestamps: boolean;
  includeModels: boolean;
}

export interface ConversationExportData {
  conversationId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  model: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    tokens?: number;
  }>;
  metadata?: {
    totalMessages: number;
    totalTokens: number;
    duration: number;
    language: string;
  };
}

/**
 * Export conversation to JSON format
 */
export function exportToJSON(data: ConversationExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Export conversation to CSV format
 */
export function exportToCSV(data: ConversationExportData): string {
  const headers = ['Timestamp', 'Role', 'Message', 'Tokens'];
  const rows = data.messages.map((msg) => [
    msg.timestamp.toISOString(),
    msg.role,
    `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes
    msg.tokens || '',
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

  return csvContent;
}

/**
 * Export conversation to Markdown format
 */
export function exportToMarkdown(data: ConversationExportData): string {
  let markdown = `# ${data.title}\n\n`;

  if (data.metadata) {
    markdown += `**Metadata:**\n`;
    markdown += `- Created: ${data.createdAt.toLocaleString()}\n`;
    markdown += `- Updated: ${data.updatedAt.toLocaleString()}\n`;
    markdown += `- Model: ${data.model}\n`;
    markdown += `- Total Messages: ${data.metadata.totalMessages}\n`;
    markdown += `- Total Tokens: ${data.metadata.totalTokens}\n\n`;
  }

  markdown += `---\n\n`;

  data.messages.forEach((msg) => {
    const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
    markdown += `## ${role}\n\n`;
    markdown += `${msg.content}\n\n`;

    if (msg.timestamp) {
      markdown += `*${msg.timestamp.toLocaleString()}*\n\n`;
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * Export conversation to plain text format
 */
export function exportToText(data: ConversationExportData): string {
  let text = `${data.title}\n`;
  text += `${'='.repeat(data.title.length)}\n\n`;

  if (data.metadata) {
    text += `Metadata:\n`;
    text += `Created: ${data.createdAt.toLocaleString()}\n`;
    text += `Updated: ${data.updatedAt.toLocaleString()}\n`;
    text += `Model: ${data.model}\n`;
    text += `Total Messages: ${data.metadata.totalMessages}\n`;
    text += `Total Tokens: ${data.metadata.totalTokens}\n\n`;
  }

  text += `${'='.repeat(50)}\n\n`;

  data.messages.forEach((msg) => {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    text += `[${role}]\n`;
    text += `${msg.content}\n`;

    if (msg.timestamp) {
      text += `(${msg.timestamp.toLocaleString()})\n`;
    }

    text += `\n${'-'.repeat(50)}\n\n`;
  });

  return text;
}

/**
 * Export conversation to PDF format (returns HTML that can be converted to PDF)
 */
export function exportToPDFHTML(data: ConversationExportData): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
      line-height: 1.6;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .metadata {
      background-color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 14px;
    }
    .message {
      margin: 20px 0;
      padding: 15px;
      border-left: 4px solid #3498db;
      background-color: #f8f9fa;
      border-radius: 3px;
    }
    .message.user {
      border-left-color: #27ae60;
      background-color: #f0fdf4;
    }
    .message.assistant {
      border-left-color: #3498db;
      background-color: #f0f7ff;
    }
    .message-role {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .message-content {
      color: #555;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .message-timestamp {
      font-size: 12px;
      color: #7f8c8d;
      margin-top: 10px;
      font-style: italic;
    }
    .page-break {
      page-break-after: always;
      margin: 20px 0;
      border-top: 2px dashed #bdc3c7;
    }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  
  ${
    data.metadata
      ? `
  <div class="metadata">
    <p><strong>Created:</strong> ${data.createdAt.toLocaleString()}</p>
    <p><strong>Updated:</strong> ${data.updatedAt.toLocaleString()}</p>
    <p><strong>Model:</strong> ${data.model}</p>
    <p><strong>Total Messages:</strong> ${data.metadata.totalMessages}</p>
    <p><strong>Total Tokens:</strong> ${data.metadata.totalTokens}</p>
    <p><strong>Duration:</strong> ${Math.round(data.metadata.duration / 1000)} seconds</p>
  </div>
  `
      : ''
  }
  
  <div class="page-break"></div>
  
  ${data.messages
    .map(
      (msg) => `
  <div class="message ${msg.role}">
    <div class="message-role">${msg.role === 'user' ? '👤 User' : '🤖 Assistant'}</div>
    <div class="message-content">${msg.content}</div>
    ${msg.timestamp ? `<div class="message-timestamp">${msg.timestamp.toLocaleString()}</div>` : ''}
  </div>
  `
    )
    .join('')}
  
</body>
</html>
  `;

  return html;
}

/**
 * Export conversation in the specified format
 */
export function exportConversation(data: ConversationExportData, options: ExportOptions): string {
  switch (options.format) {
    case 'json':
      return exportToJSON(data);
    case 'csv':
      return exportToCSV(data);
    case 'markdown':
      return exportToMarkdown(data);
    case 'txt':
      return exportToText(data);
    case 'pdf':
      return exportToPDFHTML(data);
    default:
      return exportToJSON(data);
  }
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: string): string {
  const extensions: Record<string, string> = {
    json: 'json',
    csv: 'csv',
    markdown: 'md',
    txt: 'txt',
    pdf: 'html', // HTML that can be converted to PDF
  };
  return extensions[format] || 'txt';
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    json: 'application/json',
    csv: 'text/csv',
    markdown: 'text/markdown',
    txt: 'text/plain',
    pdf: 'text/html',
  };
  return mimeTypes[format] || 'text/plain';
}

/**
 * Generate filename for export
 */
export function generateFilename(conversationTitle: string, format: string): string {
  const sanitizedTitle = conversationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 50);
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = getFileExtension(format);
  return `${sanitizedTitle}_${timestamp}.${extension}`;
}

/**
 * Batch export multiple conversations
 */
export function batchExport(conversations: ConversationExportData[], format: string): Record<string, string> {
  const exports: Record<string, string> = {};

  conversations.forEach((conv) => {
    const filename = generateFilename(conv.title, format);
    exports[filename] = exportConversation(conv, {
      format: format as any,
      includeMetadata: true,
      includeTimestamps: true,
      includeModels: true,
    });
  });

  return exports;
}
