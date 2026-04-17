import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  previewClassName?: string;
}

export const ImageUploadField = ({
  label = 'Image',
  value,
  onChange,
  folder = 'content',
  previewClassName = 'h-24',
}: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const id = `upload-${folder}-${Math.random().toString(36).slice(2, 7)}`;

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadImage(file, folder);
      onChange(url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed — paste a URL instead');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="" className={`${previewClassName} rounded-md border object-cover`} />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="https://... or upload"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById(id)?.click()}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? '...' : 'Upload'}
        </Button>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
};
