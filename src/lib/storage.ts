// Image uploads, backed by the self-hosted API's S3-compatible storage.
//
// Previously this talked to Supabase Storage directly and had to create the
// bucket on the fly from the browser. The bucket is now server-side config, so
// all that's left is the client-side guard rails and one POST.
//
// The public shape (`uploadImage` -> `{ url, path }`) is unchanged, which is
// why ImageUploadField, RichTextEditor and AdminBlogs needed no edits.
import { ApiError, uploads } from '@/lib/api';

const MAX_BYTES = 10 * 1024 * 1024;

export interface UploadResult {
  url: string;
  path: string;
}

// Image format magic bytes. Checked against the actual file content so an
// attacker can't rename `shell.html` to `photo.png` to smuggle it past us.
// The server repeats this check — this copy exists to fail fast and give the
// admin a useful message before spending a round-trip on a 10MB body.
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
 * Upload an image and return its public URL. Rejects files that aren't
 * actually images, whatever their extension says.
 */
export const uploadImage = async (file: File, folder = 'uploads'): Promise<UploadResult> => {
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be under 10MB');
  }
  if (file.size < 16) {
    throw new Error('File is too small to be a valid image');
  }

  const detected = await detectImageType(file);
  if (!detected) {
    throw new Error('File is not a valid image (png, jpg, gif, webp, avif).');
  }

  try {
    const { url, path } = await uploads.upload(file, folder);
    return { url, path };
  } catch (err) {
    // 503 means the server has no bucket / bad credentials — that's an admin
    // task, not something the person clicking Upload can fix by retrying.
    if (err instanceof ApiError && err.status === 503) {
      throw new Error(`${err.message} Paste an image URL instead for now.`);
    }
    throw err;
  }
};

/** Remove a previously uploaded object by the `path` from `uploadImage`. */
export const deleteImage = (path: string): Promise<void> => uploads.remove(path);
