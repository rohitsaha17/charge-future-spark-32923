import { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered,
  Quote, Link, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
  Minus, Type, Eye, Edit3, Upload, Code, Maximize2, AlignJustify,
  Calendar, Trash2, Replace, Images, Sparkles, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadImage } from '@/lib/storage';
import { sanitizeBlogHtml, sanitizePasteHtml } from '@/lib/sanitize';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PreviewMeta {
  title?: string;
  excerpt?: string;
  featured_image?: string | null;
  published_at?: string | null;
  tags?: string[] | null;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  folder?: string;
  meta?: PreviewMeta;
}

type Mode = 'edit' | 'preview' | 'html';

type ImageAlign = 'left' | 'center' | 'right' | 'full';

const ALIGN_CLASSES: Record<ImageAlign, string> = {
  left: 'rounded-lg my-4 float-left mr-4 mb-2',
  center: 'rounded-lg my-4 mx-auto block',
  right: 'rounded-lg my-4 float-right ml-4 mb-2',
  full: 'rounded-lg my-4 w-full',
};

const WIDTH_CLASSES = ['max-w-[25%]', 'max-w-[50%]', 'max-w-[75%]', 'max-w-full'];

const getAlignFromClasses = (cls: string): ImageAlign => {
  if (/\bw-full\b/.test(cls)) return 'full';
  if (/\bfloat-left\b/.test(cls)) return 'left';
  if (/\bfloat-right\b/.test(cls)) return 'right';
  return 'center';
};

const getWidthFromClasses = (cls: string): string => {
  const match = cls.match(/max-w-\[(25%|50%|75%)\]/);
  if (match) return `max-w-[${match[1]}]`;
  if (/\bmax-w-full\b/.test(cls)) return 'max-w-full';
  return 'max-w-[50%]';
};

const applyImageClasses = (img: HTMLImageElement, align: ImageAlign, width: string) => {
  // strip any previous alignment / width classes
  img.classList.remove(
    'float-left', 'float-right', 'mx-auto', 'block', 'w-full',
    'mr-4', 'ml-4', 'mb-2', 'my-4', 'rounded-lg',
    ...WIDTH_CLASSES,
  );
  const base = ALIGN_CLASSES[align].split(' ');
  base.forEach((c) => img.classList.add(c));
  if (align !== 'full') img.classList.add(width);
};

const RichTextEditor = ({ value, onChange, className, folder = 'blog', meta }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [mode, setMode] = useState<Mode>('edit');
  const [uploading, setUploading] = useState(false);

  const [linkDialog, setLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [imageDialog, setImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<ImageAlign>('center');

  // Gallery state
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryDialog, setGalleryDialog] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryCols, setGalleryCols] = useState<2 | 3>(3);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Floating image toolbar state
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgToolbarPos, setImgToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [selectedAlign, setSelectedAlign] = useState<ImageAlign>('center');
  const [selectedWidth, setSelectedWidth] = useState<string>('max-w-[50%]');
  const [selectedAlt, setSelectedAlt] = useState('');

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const flushValue = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const execCommand = useCallback((command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    flushValue();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const insertHTML = (html: string) => {
    editorRef.current?.focus();
    restoreSelection();
    // Sanitize before injecting so a bug in the editor UI (or a clipboard-
    // forged payload) can't drop an executable script into the editor.
    document.execCommand('insertHTML', false, sanitizePasteHtml(html));
    flushValue();
  };

  const insertHeading = (level: string) => {
    execCommand('formatBlock', level);
  };

  const openLinkDialog = () => {
    saveSelection();
    const sel = window.getSelection()?.toString() || '';
    setLinkText(sel);
    setLinkUrl('');
    setLinkDialog(true);
  };

  const confirmLink = () => {
    if (!linkUrl) return;
    const safe = /^https?:\/\//i.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
    const html = `<a href="${safe}" target="_blank" rel="noopener noreferrer">${linkText || safe}</a>`;
    insertHTML(html);
    setLinkDialog(false);
  };

  const openImageDialog = () => {
    saveSelection();
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    setImageAlign('center');
    setImageDialog(true);
  };

  const openGalleryDialog = () => {
    saveSelection();
    setGalleryUrls([]);
    setGalleryCols(3);
    setGalleryDialog(true);
  };

  const handleImageFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, folder);
      setImageUrl(url);
      toast.success('Uploaded — set placement then insert');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. Paste a URL instead.');
    } finally {
      setUploading(false);
    }
  };

  const confirmImage = () => {
    if (!imageUrl) return;
    const classes = imageAlign === 'full'
      ? `${ALIGN_CLASSES.full}`
      : `${ALIGN_CLASSES[imageAlign]} max-w-[50%]`;
    const imgTag = `<img src="${imageUrl}" alt="${imageAlt}" class="${classes}" />`;
    if (imageCaption.trim()) {
      const alignClass = imageAlign === 'left'
        ? 'float-left mr-4 mb-2 max-w-[45%]'
        : imageAlign === 'right'
        ? 'float-right ml-4 mb-2 max-w-[45%]'
        : imageAlign === 'full'
        ? 'w-full'
        : 'mx-auto max-w-[70%]';
      insertHTML(
        `<figure class="my-8 ${alignClass}"><img src="${imageUrl}" alt="${imageAlt}" class="rounded-2xl shadow-lg w-full" /><figcaption class="text-center text-sm text-muted-foreground mt-3 italic">${imageCaption.trim()}</figcaption></figure><p><br/></p>`
      );
    } else {
      insertHTML(imgTag + '<p><br/></p>');
    }
    setImageDialog(false);
  };

  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGalleryUploading(true);
    try {
      const uploads = await Promise.allSettled(
        Array.from(files).map((f) => uploadImage(f, folder))
      );
      const urls = uploads
        .filter((u): u is PromiseFulfilledResult<{ url: string; path: string }> => u.status === 'fulfilled')
        .map((u) => u.value.url);
      const failed = uploads.filter((u) => u.status === 'rejected').length;
      setGalleryUrls((prev) => [...prev, ...urls]);
      if (failed) toast.error(`${failed} image(s) failed to upload`);
      if (urls.length) toast.success(`${urls.length} image(s) added`);
    } finally {
      setGalleryUploading(false);
    }
  };

  const confirmGallery = () => {
    if (!galleryUrls.length) return;
    const imgs = galleryUrls
      .map((u) => `<img src="${u}" alt="" />`)
      .join('');
    insertHTML(
      `<div class="blog-gallery cols-${galleryCols}" contenteditable="false">${imgs}</div><p><br/></p>`
    );
    setGalleryDialog(false);
    setGalleryUrls([]);
  };

  const removeGalleryUrl = (u: string) => {
    setGalleryUrls((prev) => prev.filter((x) => x !== u));
  };

  const insertPullQuote = () =>
    insertHTML(
      '<blockquote class="border-l-4 border-primary bg-primary/5 pl-6 pr-4 py-4 rounded-r-lg italic text-lg font-medium my-6">Add a memorable quote here…</blockquote><p><br/></p>'
    );

  const insertCallout = () =>
    insertHTML(
      '<div class="my-6 p-5 rounded-xl bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/20" contenteditable="true"><p class="font-semibold text-primary mb-1">💡 Key takeaway</p><p>Highlight something important your readers should remember.</p></div><p><br/></p>'
    );

  const insertHR = () => insertHTML('<hr class="my-6 border-t border-border" />');

  const insertCodeBlock = () =>
    insertHTML('<pre class="bg-muted p-3 rounded-md overflow-x-auto"><code>code here</code></pre>');

  useEffect(() => {
    if (
      mode === 'edit' &&
      editorRef.current &&
      editorRef.current.innerHTML !== value
    ) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, mode]);

  /* ---------- Image click → floating toolbar ---------- */

  const positionToolbar = (img: HTMLImageElement) => {
    const container = editorRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    // position above the image, relative to the editor container
    setImgToolbarPos({
      top: imgRect.top - containerRect.top - 44,
      left: imgRect.left - containerRect.left,
    });
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      // visual selection outline
      img.style.outline = '2px solid hsl(var(--primary))';
      img.style.outlineOffset = '2px';
      if (selectedImg && selectedImg !== img) {
        selectedImg.style.outline = '';
        selectedImg.style.outlineOffset = '';
      }
      setSelectedImg(img);
      setSelectedAlign(getAlignFromClasses(img.className));
      setSelectedWidth(getWidthFromClasses(img.className));
      setSelectedAlt(img.alt || '');
      positionToolbar(img);
    } else if (selectedImg) {
      selectedImg.style.outline = '';
      selectedImg.style.outlineOffset = '';
      setSelectedImg(null);
      setImgToolbarPos(null);
    }
  };

  const updateSelectedAlign = (align: ImageAlign) => {
    if (!selectedImg) return;
    applyImageClasses(selectedImg, align, selectedWidth);
    setSelectedAlign(align);
    positionToolbar(selectedImg);
    flushValue();
  };

  const updateSelectedWidth = (width: string) => {
    if (!selectedImg) return;
    applyImageClasses(selectedImg, selectedAlign, width);
    setSelectedWidth(width);
    positionToolbar(selectedImg);
    flushValue();
  };

  const updateSelectedAlt = (alt: string) => {
    if (!selectedImg) return;
    selectedImg.alt = alt;
    setSelectedAlt(alt);
    flushValue();
  };

  const deleteSelectedImage = () => {
    if (!selectedImg) return;
    selectedImg.remove();
    setSelectedImg(null);
    setImgToolbarPos(null);
    flushValue();
  };

  const replaceSelectedImage = () => {
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (file: File) => {
    if (!file || !selectedImg) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, folder);
      selectedImg.src = url;
      positionToolbar(selectedImg);
      flushValue();
      toast.success('Image replaced');
    } catch (err: any) {
      toast.error(err.message || 'Replace failed');
    } finally {
      setUploading(false);
    }
  };

  // Reposition toolbar on scroll within the editor so it stays attached
  useEffect(() => {
    if (!selectedImg) return;
    const container = editorRef.current;
    if (!container) return;
    const handler = () => positionToolbar(selectedImg);
    container.addEventListener('scroll', handler);
    window.addEventListener('resize', handler);
    return () => {
      container.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [selectedImg]);

  const toolbarButtons: Array<{ divider?: true; icon?: any; action?: () => void; title?: string }> = [
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
    { icon: Quote, action: insertPullQuote, title: 'Pull quote' },
    { icon: Sparkles, action: insertCallout, title: 'Callout block' },
    { icon: Code, action: insertCodeBlock, title: 'Code block' },
    { divider: true },
    { icon: AlignLeft, action: () => execCommand('justifyLeft'), title: 'Align Left' },
    { icon: AlignCenter, action: () => execCommand('justifyCenter'), title: 'Align Center' },
    { icon: AlignRight, action: () => execCommand('justifyRight'), title: 'Align Right' },
    { icon: AlignJustify, action: () => execCommand('justifyFull'), title: 'Justify' },
    { divider: true },
    { icon: Link, action: openLinkDialog, title: 'Insert Link' },
    { icon: Minus, action: insertHR, title: 'Horizontal Rule' },
  ];

  return (
    <div className={cn('border rounded-md overflow-hidden bg-background', className)}>
      {/* Mode toggle */}
      <div className="flex items-center justify-between gap-2 px-2 py-1 border-b bg-muted/30">
        <div className="flex gap-1">
          <Button type="button" size="sm" variant={mode === 'edit' ? 'default' : 'ghost'} onClick={() => setMode('edit')}>
            <Edit3 className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button type="button" size="sm" variant={mode === 'preview' ? 'default' : 'ghost'} onClick={() => setMode('preview')}>
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Button type="button" size="sm" variant={mode === 'html' ? 'default' : 'ghost'} onClick={() => setMode('html')}>
            <Code className="w-4 h-4 mr-1" /> HTML
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <>
              <Button type="button" size="sm" variant="default" onClick={openImageDialog}>
                <ImageIcon className="w-4 h-4 mr-1" /> Image
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={openGalleryDialog}>
                <Images className="w-4 h-4 mr-1" /> Gallery
              </Button>
            </>
          )}
          <span className="text-xs text-muted-foreground">
            {uploading ? 'Uploading…' : ''}
          </span>
        </div>
      </div>

      {mode === 'edit' && (
        <>
          {/* Formatting toolbar */}
          <div className="flex flex-wrap gap-0.5 p-2 bg-muted/50 border-b sticky top-0 z-10">
            {toolbarButtons.map((btn, i) =>
              btn.divider ? (
                <div key={i} className="w-px h-8 bg-border mx-1" />
              ) : (
                <Button
                  key={i}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    saveSelection();
                  }}
                  onClick={btn.action}
                  title={btn.title}
                >
                  {btn.icon && <btn.icon className="h-4 w-4" />}
                </Button>
              )
            )}
          </div>

          {/* Editable region */}
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[320px] max-h-[70vh] overflow-y-auto p-4 prose prose-sm max-w-none focus:outline-none"
              onInput={flushValue}
              onClick={handleEditorClick}
              onPaste={(e) => {
                // Clipboard HTML is a classic XSS vector — sanitize before inserting.
                e.preventDefault();
                const html = e.clipboardData.getData('text/html');
                const text = e.clipboardData.getData('text/plain');
                const cleaned = html ? sanitizePasteHtml(html) : text;
                document.execCommand('insertHTML', false, cleaned);
                flushValue();
              }}
              onBlur={() => {
                saveSelection();
                flushValue();
              }}
            />

            {/* Floating image toolbar */}
            {selectedImg && imgToolbarPos && (
              <div
                className="absolute z-20 bg-white dark:bg-background border rounded-md shadow-lg flex flex-wrap items-center gap-1 p-1"
                style={{ top: Math.max(4, imgToolbarPos.top), left: imgToolbarPos.left }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Button
                  type="button" size="icon" variant={selectedAlign === 'left' ? 'default' : 'ghost'}
                  className="h-7 w-7" onClick={() => updateSelectedAlign('left')} title="Float left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button" size="icon" variant={selectedAlign === 'center' ? 'default' : 'ghost'}
                  className="h-7 w-7" onClick={() => updateSelectedAlign('center')} title="Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button" size="icon" variant={selectedAlign === 'right' ? 'default' : 'ghost'}
                  className="h-7 w-7" onClick={() => updateSelectedAlign('right')} title="Float right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button" size="icon" variant={selectedAlign === 'full' ? 'default' : 'ghost'}
                  className="h-7 w-7" onClick={() => updateSelectedAlign('full')} title="Full width"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                {selectedAlign !== 'full' && (
                  <>
                    {['max-w-[25%]', 'max-w-[50%]', 'max-w-[75%]', 'max-w-full'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => updateSelectedWidth(w)}
                        className={cn(
                          'text-xs px-2 h-7 rounded',
                          selectedWidth === w ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        )}
                      >
                        {w === 'max-w-full' ? '100%' : w.match(/(\d+)%/)?.[1] + '%'}
                      </button>
                    ))}
                    <div className="w-px h-5 bg-border mx-1" />
                  </>
                )}
                <Input
                  className="h-7 w-40 text-xs"
                  placeholder="Alt text…"
                  value={selectedAlt}
                  onChange={(e) => updateSelectedAlt(e.target.value)}
                />
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={replaceSelectedImage} title="Replace">
                  <Replace className="w-3.5 h-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={deleteSelectedImage} title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {mode === 'preview' && <BlogPreview html={value} meta={meta} />}

      {mode === 'html' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[320px] p-3 font-mono text-xs focus:outline-none"
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleReplaceFile(e.target.files[0])}
      />

      {/* Link dialog */}
      <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert link</DialogTitle>
            <DialogDescription>Opens in a new tab.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." autoFocus />
            </div>
            <div className="space-y-1">
              <Label>Link text (optional)</Label>
              <Input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Click here" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialog(false)}>Cancel</Button>
            <Button onClick={confirmLink} disabled={!linkUrl}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image insert dialog */}
      <Dialog open={imageDialog} onOpenChange={setImageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Insert image</DialogTitle>
            <DialogDescription>Upload a file or paste a URL. You can tweak placement after inserting too.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {imageUrl && (
              <img src={imageUrl} alt="" className="max-h-48 rounded border mx-auto" />
            )}
            <div className="flex gap-2">
              <Input
                placeholder="https://... or upload"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploading ? '…' : 'Upload'}
              </Button>
            </div>
            <div className="space-y-1">
              <Label>Alt text</Label>
              <Input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Describe the image" />
            </div>
            <div className="space-y-1">
              <Label>Caption (optional)</Label>
              <Input
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Appears below the image in italics"
              />
            </div>
            <div className="space-y-1">
              <Label>Placement</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['left', 'center', 'right', 'full'] as const).map((k) => {
                  const Icon = k === 'left' ? AlignLeft : k === 'center' ? AlignCenter : k === 'right' ? AlignRight : Maximize2;
                  return (
                    <Button
                      key={k}
                      type="button"
                      variant={imageAlign === k ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageAlign(k)}
                      className="capitalize"
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {k}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialog(false)}>Cancel</Button>
            <Button onClick={confirmImage} disabled={!imageUrl}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gallery dialog (multi-image grid) */}
      <Dialog open={galleryDialog} onOpenChange={setGalleryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Insert image gallery</DialogTitle>
            <DialogDescription>Upload multiple images. They render as a square-tile grid in the post.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={galleryCols === 2 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGalleryCols(2)}
                >
                  2 columns
                </Button>
                <Button
                  type="button"
                  variant={galleryCols === 3 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGalleryCols(3)}
                >
                  3 columns
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={galleryUploading}
                onClick={() => galleryInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-1" />
                {galleryUploading ? 'Uploading…' : 'Add images'}
              </Button>
            </div>

            {galleryUrls.length === 0 ? (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Images className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Click to select multiple images</p>
              </button>
            ) : (
              <div className={`grid ${galleryCols === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2 max-h-[320px] overflow-y-auto`}>
                {galleryUrls.map((u) => (
                  <div key={u} className="relative group">
                    <img src={u} alt="" className="w-full aspect-square object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(u)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleGalleryFiles(e.target.files)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGalleryDialog(false)}>Cancel</Button>
            <Button onClick={confirmGallery} disabled={!galleryUrls.length || galleryUploading}>
              Insert gallery ({galleryUrls.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------- Full-page preview that matches BlogPost.tsx ---------- */

const BlogPreview = ({ html, meta }: { html: string; meta?: PreviewMeta }) => {
  const { title, excerpt, featured_image, published_at, tags } = meta || {};
  const dateStr = published_at
    ? new Date(published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const readingTime = Math.max(1, Math.ceil(((html || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length || 0) / 220));

  return (
    <div className="max-h-[75vh] overflow-y-auto blog-article">
      <article className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 relative">
        <div className="pointer-events-none absolute top-40 -left-24 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-[500px] -right-24 w-96 h-96 rounded-full bg-green-400/20 blur-3xl" />

        {featured_image ? (
          <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
            <img src={featured_image} alt={title || ''} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="container mx-auto max-w-4xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white/90 text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Insights
                </span>
                {title && (
                  <h1 className="text-2xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl leading-tight">
                    {title}
                  </h1>
                )}
                {excerpt && (
                  <p className="text-sm md:text-lg text-white/90 max-w-3xl mb-3">{excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {dateStr}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {readingTime} min read
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <header className="container mx-auto px-4 pt-10 max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-wider font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Insights
            </span>
            {title && (
              <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent leading-tight">
                {title}
              </h1>
            )}
            {excerpt && <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-3">{excerpt}</p>}
            <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {dateStr}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {readingTime} min read
              </span>
            </div>
          </header>
        )}

        <div className="container mx-auto px-4 py-10 max-w-4xl relative">
          <div
            className="blog-content prose prose-lg max-w-none
              prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-primary/90
              prose-p:text-foreground/85 prose-p:leading-[1.8] prose-p:mb-5
              prose-p:first-of-type:first-letter:text-5xl prose-p:first-of-type:first-letter:font-bold prose-p:first-of-type:first-letter:mr-2 prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:leading-none prose-p:first-of-type:first-letter:text-primary
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
              prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8 prose-img:ring-1 prose-img:ring-border/50
              prose-figure:my-8
              prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-3 prose-figcaption:italic
              prose-blockquote:border-l-0 prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/5 prose-blockquote:to-transparent prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:rounded-lg prose-blockquote:not-italic prose-blockquote:text-lg prose-blockquote:font-medium
              prose-ul:space-y-2 prose-ol:space-y-2
              prose-li:text-foreground/85
              prose-hr:my-10 prose-hr:border-border/40"
            dangerouslySetInnerHTML={{
              __html: html
                ? sanitizeBlogHtml(html)
                : '<p class="text-muted-foreground">Nothing to preview yet — start writing in the Edit tab.</p>',
            }}
          />

          {tags && tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-4 py-1.5 bg-gradient-to-r from-primary/10 to-cyan-500/10 text-primary rounded-full text-sm font-medium border border-primary/20"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-muted/30 rounded-xl text-center text-xs text-muted-foreground italic">
            Live preview — this is how readers will see your post.
          </div>
        </div>

        <style>{`
          .blog-article .blog-gallery { display: grid; gap: 0.75rem; margin: 2rem 0; }
          .blog-article .blog-gallery.cols-2 { grid-template-columns: 1fr 1fr; }
          .blog-article .blog-gallery.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
          .blog-article .blog-gallery img { margin: 0 !important; width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 0.75rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .blog-article figure img { margin: 0 !important; }
          .blog-article .prose h2::before { content: ""; display: block; width: 2.5rem; height: 3px; background: linear-gradient(90deg, hsl(var(--primary)), #00C6FF); border-radius: 2px; margin-bottom: 0.6rem; }
        `}</style>
      </article>
    </div>
  );
};

export default RichTextEditor;
