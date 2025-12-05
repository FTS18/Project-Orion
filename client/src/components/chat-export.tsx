import React from 'react';
import { useToast } from './toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export const useChatHistory = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const { addToast } = useToast();

  const exportAsCSV = () => {
    if (messages.length === 0) {
      addToast('No messages to export', 'warning');
      return;
    }

    const csv = [
      ['Timestamp', 'Role', 'Message'].join(','),
      ...messages.map(m => [
        m.timestamp,
        m.role,
        `"${m.content.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    downloadFile(csv, 'chat-history.csv', 'text/csv');
    addToast('Chat exported as CSV', 'success');
  };

  const exportAsPDF = () => {
    if (messages.length === 0) {
      addToast('No messages to export', 'warning');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Chat History</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .message { margin: 10px 0; padding: 10px; border-left: 3px solid #ccc; }
          .agent { border-left-color: #4CAF50; background-color: #f1f8f4; }
          .user { border-left-color: #2196F3; background-color: #f0f7ff; }
          .timestamp { font-size: 0.8em; color: #666; }
          .role { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Chat History</h1>
        ${messages.map(m => `
          <div class="message ${m.role}">
            <span class="timestamp">${new Date(m.timestamp).toLocaleString()}</span>
            <div class="role">${m.role.toUpperCase()}</div>
            <div>${m.content}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    downloadFile(html, 'chat-history.html', 'text/html');
    addToast('Chat exported as HTML', 'success');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    messages,
    setMessages,
    exportAsCSV,
    exportAsPDF,
    addMessage: (role: 'user' | 'agent', content: string) => {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        role,
        content,
        timestamp: new Date().toISOString()
      }]);
    }
  };
};

export const ChatExportButtons = ({ onExportCSV, onExportPDF }: { onExportCSV: () => void; onExportPDF: () => void }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onExportCSV}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        📥 Export CSV
      </button>
      <button
        onClick={onExportPDF}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
      >
        📄 Export HTML
      </button>
    </div>
  );
};
