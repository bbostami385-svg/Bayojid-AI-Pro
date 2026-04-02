import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText, Sheet, FileCode } from 'lucide-react';
import { toast } from 'sonner';

/**
 * চ্যাট এক্সপোর্ট বোতাম কম্পোনেন্ট
 */

interface ExportButtonProps {
  conversationId: number;
  conversationTitle: string;
  messages: any[];
  isLoading?: boolean;
}

export function ExportButton({
  conversationId,
  conversationTitle,
  messages,
  isLoading = false
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  /**
   * JSON হিসাবে এক্সপোর্ট করুন
   */
  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const exportData = {
        metadata: {
          title: conversationTitle,
          conversationId,
          messageCount: messages.length,
          exportedAt: new Date().toISOString()
        },
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      downloadFile(blob, `${conversationTitle}_${new Date().toISOString().split('T')[0]}.json`);
      toast.success('JSON হিসাবে এক্সপোর্ট করা হয়েছে');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('এক্সপোর্ট ব্যর্থ হয়েছে');
    } finally {
      setExporting(false);
    }
  };

  /**
   * CSV হিসাবে এক্সপোর্ট করুন
   */
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const headers = ['ক্রম', 'ভূমিকা', 'বার্তা', 'সময়'];
      const rows = messages.map((msg, index) => [
        index + 1,
        msg.role === 'user' ? 'ব্যবহারকারী' : 'সহায়ক',
        `"${msg.content.replace(/"/g, '""')}"`,
        new Date(msg.createdAt).toLocaleString('bn-BD')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadFile(blob, `${conversationTitle}_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV হিসাবে এক্সপোর্ট করা হয়েছে');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('এক্সপোর্ট ব্যর্থ হয়েছে');
    } finally {
      setExporting(false);
    }
  };

  /**
   * Markdown হিসাবে এক্সপোর্ট করুন
   */
  const handleExportMarkdown = async () => {
    try {
      setExporting(true);
      const lines: string[] = [];

      lines.push(`# ${conversationTitle}`);
      lines.push('');
      lines.push(`**তৈরি**: ${new Date().toLocaleString('bn-BD')}`);
      lines.push(`**মোট বার্তা**: ${messages.length}`);
      lines.push('');
      lines.push('---');
      lines.push('');

      messages.forEach((msg, index) => {
        const roleEmoji = msg.role === 'user' ? '👤' : '🤖';
        const roleLabel = msg.role === 'user' ? 'ব্যবহারকারী' : 'সহায়ক';
        
        lines.push(`### ${roleEmoji} ${roleLabel}`);
        lines.push(msg.content);
        lines.push(`*${new Date(msg.createdAt).toLocaleTimeString('bn-BD')}*`);
        lines.push('');
      });

      const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
      downloadFile(blob, `${conversationTitle}_${new Date().toISOString().split('T')[0]}.md`);
      toast.success('Markdown হিসাবে এক্সপোর্ট করা হয়েছে');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('এক্সপোর্ট ব্যর্থ হয়েছে');
    } finally {
      setExporting(false);
    }
  };

  /**
   * সাধারণ টেক্সট হিসাবে এক্সপোর্ট করুন
   */
  const handleExportText = async () => {
    try {
      setExporting(true);
      const lines: string[] = [];

      lines.push(conversationTitle);
      lines.push('='.repeat(conversationTitle.length));
      lines.push('');
      lines.push(`তৈরি: ${new Date().toLocaleString('bn-BD')}`);
      lines.push(`মোট বার্তা: ${messages.length}`);
      lines.push('');
      lines.push('-'.repeat(50));
      lines.push('');

      messages.forEach((msg) => {
        const roleLabel = msg.role === 'user' ? '[ব্যবহারকারী]' : '[সহায়ক]';
        lines.push(`${roleLabel} ${new Date(msg.createdAt).toLocaleTimeString('bn-BD')}`);
        lines.push(msg.content);
        lines.push('');
      });

      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      downloadFile(blob, `${conversationTitle}_${new Date().toISOString().split('T')[0]}.txt`);
      toast.success('টেক্সট হিসাবে এক্সপোর্ট করা হয়েছে');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('এক্সপোর্ট ব্যর্থ হয়েছে');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || exporting || messages.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          এক্সপোর্ট
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportJSON} disabled={exporting}>
          <FileJson className="w-4 h-4 mr-2" />
          <span>JSON</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportCSV} disabled={exporting}>
          <Sheet className="w-4 h-4 mr-2" />
          <span>CSV</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleExportMarkdown} disabled={exporting}>
          <FileCode className="w-4 h-4 mr-2" />
          <span>Markdown</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportText} disabled={exporting}>
          <FileText className="w-4 h-4 mr-2" />
          <span>টেক্সট</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * ফাইল ডাউনলোড হেল্পার
 */
function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default ExportButton;
