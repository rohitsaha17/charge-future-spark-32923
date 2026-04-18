import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'public-assets';

let ensurePromise: Promise<boolean> | null = null;

/** Ensure the public-assets bucket exists. Cached for the session. */
export const ensureBucket = async (): Promise<boolean> => {
  if (ensurePromise) return ensurePromise;
  ensurePromise = (async () => {
    try {
      const { data, error } = await supabase.storage.getBucket(BUCKET);
      if (data && !error) return true;
    } catch {
      // fall through to create
    }
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
    });
    if (createError) {
      // Ignore "already exists" race (another caller created it)
      if (!/already exists/i.test(createError.message || '')) {
        ensurePromise = null;
        return false;
      }
    }
    return true;
  })();
  return ensurePromise;
};

export interface UploadResult {
  url: string;
  path: string;
}

// Image format magic bytes. Checked against the actual file content so an
// attacker can't rename `shell.html` to `photo.png` to smuggle it past us.
const IMAGE_SIGNATURES: Array<{ ext: string; mime: string; match: (b: Uint8Array) => boolean }> = [
  { ext: 'png', mime: 'image/png', match: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'jpg', mime: 'image/jpeg', match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'gif', mime: 'image/gif', match: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  { ext: 'webp', mime: 'image/webp', match: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
  { ext: 'avif', mime: 'image/avif', match: (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 && b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66 },
];

const detectImageType = async (file: File) => {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.match(head)) return sig;
  }
  return null;
};

/**
 * Upload an image to the public-assets bucket. If the bucket doesn't exist
 * it's created on the fly. Rejects files that aren't actually images.
 * Returns the public URL.
 */
export const uploadImage = async (file: File, folder = 'uploads'): Promise<UploadResult> => {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10MB');
  }
  if (file.size < 16) {
    throw new Error('File is too small to be a valid image');
  }

  // Reject disguised files by checking magic bytes, not just the extension.
  const detected = await detectImageType(file);
  if (!detected) {
    throw new Error('File is not a valid image (png, jpg, gif, webp, avif).');
  }

  const doUpload = async () => {
    // Use the detected extension, not the user-supplied one.
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${detected.ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: detected.mime,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
  };

  try {
    return await doUpload();
  } catch (err: any) {
    const msg = err?.message || '';
    if (/bucket not found/i.test(msg) || err?.statusCode === 404 || err?.status === 404) {
      const ok = await ensureBucket();
      if (!ok) {
        throw new Error(
          "Storage bucket missing. An admin must apply the latest Supabase migration, or enable bucket creation for authenticated users."
        );
      }
      return await doUpload();
    }
    throw err;
  }
};
