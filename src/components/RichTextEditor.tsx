import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered,
  Quote, Link, Image, AlignLeft, AlignCenter, Minus, Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertHeading = (level: string) => {
    document.execCommand('formatBlock', false, level);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter alt text:') || '';
      execCommand('insertHTML', `<img src="${url}" alt="${alt}" class="rounded-lg my-4 max-w-full" />`);
    }
  };

  const insertHR = () => {
    execCommand('insertHTML', '<hr class="my-6" />');
  };

  const toolbarButtons = [
    { icon: Bold, action: () => execCommand('bold'), title: 'Bold' },
    { icon: Italic, action: () => execCommand('italic'), title: 'Italic' },
    { icon: Underline, action: () => execCommand('underline'), title: 'Underline' },
    { divider: true },
    { icon: Type, action: () => insertHeading('p'), title: 'Paragraph' },
    { icon: Heading2, action: () => insertHeading('h2'), title: 'Heading 2' },
    { icon: Heading3, action: () => insertHeading('h3'), title: 'Heading 3' },
    { divider: true },
    { icon: List, action: () => execCommand('insertUnorderedList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => execCommand('insertOrderedList'), title: 'Numbered List' },
    { icon: Quote, action: () => execCommand('formatBlock', 'blockquote'), title: 'Quote' },
    { divider: true },
    { icon: AlignLeft, action: () => execCommand('justifyLeft'), title: 'Align Left' },
    { icon: AlignCenter, action: () => execCommand('justifyCenter'), title: 'Align Center' },
    { divider: true },
    { icon: Link, action: insertLink, title: 'Insert Link' },
    { icon: Image, action: insertImage, title: 'Insert Image' },
    { icon: Minus, action: insertHR, title: 'Horizontal Rule' },
  ];

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-2 bg-muted/50 border-b">
        {toolbarButtons.map((btn, i) =>
          'divider' in btn ? (
            <div key={i} className="w-px h-8 bg-border mx-1" />
          ) : (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={btn.action}
              title={btn.title}
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          )
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 prose prose-sm max-w-none focus:outline-none bg-background"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        onBlur={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;
