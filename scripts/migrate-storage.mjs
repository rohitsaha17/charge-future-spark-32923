#!/usr/bin/env node
/**
 * Copy every object from the source Supabase project's storage buckets
 * to a destination project. Used when migrating off one Supabase account
 * to another (e.g. moving from a Lovable-managed project to a self-hosted
 * one).
 *
 * Requires SERVICE ROLE keys for both projects because we're reading and
 * writing storage on both sides. Service role keys have full RLS bypass —
 * DO NOT commit them; pass via env vars for the single run.
 *
 * Usage:
 *   SOURCE_URL=https://old.supabase.co \
 *   SOURCE_SERVICE_KEY=... \
 *   DEST_URL=https://new.supabase.co \
 *   DEST_SERVICE_KEY=... \
 *   node scripts/migrate-storage.mjs
 *
 * Buckets are created on the destination if missing. Files that already
 * exist on the destination are skipped (safe to re-run).
 */
import { createClient } from "@supabase/supabase-js";

const {
  SOURCE_URL,
  SOURCE_SERVICE_KEY,
  DEST_URL,
  DEST_SERVICE_KEY,
} = process.env;

if (!SOURCE_URL || !SOURCE_SERVICE_KEY || !DEST_URL || !DEST_SERVICE_KEY) {
  console.error(
    "Missing env. Required: SOURCE_URL SOURCE_SERVICE_KEY DEST_URL DEST_SERVICE_KEY"
  );
  process.exit(1);
}

const source = createClient(SOURCE_URL, SOURCE_SERVICE_KEY);
const dest = createClient(DEST_URL, DEST_SERVICE_KEY);

const copyBucket = async (bucket) => {
  console.log(`[bucket] ${bucket.id}`);

  // Ensure the bucket exists on the destination with the same public flag.
  const { error: createErr } = await dest.storage.createBucket(bucket.id, {
    public: bucket.public,
    fileSizeLimit: bucket.file_size_limit ?? undefined,
    allowedMimeTypes: bucket.allowed_mime_types ?? undefined,
  });
  if (createErr && !/already exists/i.test(createErr.message || "")) {
    console.error(`  create failed: ${createErr.message}`);
    return;
  }

  const walk = async (prefix = "") => {
    const { data: entries, error } = await source.storage
      .from(bucket.id)
      .list(prefix, { limit: 1000 });
    if (error) {
      console.error(`  list ${prefix} failed: ${error.message}`);
      return;
    }

    for (const entry of entries || []) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Folders return with id=null in Supabase's list API
      if (entry.id === null) {
        await walk(path);
        continue;
      }

      const { data: existing } = await dest.storage
        .from(bucket.id)
        .list(prefix, { search: entry.name, limit: 1 });
      if (existing && existing.length > 0) {
        console.log(`  skip (exists) ${path}`);
        continue;
      }

      const { data: blob, error: dlErr } = await source.storage
        .from(bucket.id)
        .download(path);
      if (dlErr) {
        console.error(`  download ${path} failed: ${dlErr.message}`);
        continue;
      }

      const buf = Buffer.from(await blob.arrayBuffer());
      const { error: upErr } = await dest.storage
        .from(bucket.id)
        .upload(path, buf, {
          contentType: blob.type || "application/octet-stream",
          upsert: false,
        });
      if (upErr) {
        console.error(`  upload ${path} failed: ${upErr.message}`);
      } else {
        console.log(`  copied ${path} (${buf.length} bytes)`);
      }
    }
  };

  await walk("");
};

const { data: buckets, error } = await source.storage.listBuckets();
if (error) {
  console.error(`listBuckets failed: ${error.message}`);
  process.exit(1);
}
for (const bucket of buckets || []) {
  await copyBucket(bucket);
}
console.log("done.");
