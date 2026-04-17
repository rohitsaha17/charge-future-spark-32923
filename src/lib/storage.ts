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

/**
 * Upload an image to the public-assets bucket. If the bucket doesn't exist
 * it's created on the fly. Returns the public URL.
 */
export const uploadImage = async (file: File, folder = 'uploads'): Promise<UploadResult> => {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10MB');
  }

  const doUpload = async () => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
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
