import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export class ImageUploader {
  private supabase: SupabaseClient;
  private bucket: string = 'ranking-items';
  private verbose: boolean;

  constructor(supabaseUrl: string, supabaseKey: string, verbose: boolean = false) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.verbose = verbose;
  }

  /**
   * Check if a string is a local file path
   */
  isLocalPath(url: string): boolean {
    return url.startsWith('./') || url.startsWith('../') || url.startsWith('/');
  }

  /**
   * Generate a stable filename from image content
   */
  private generateFilename(filePath: string, content: Buffer): string {
    const ext = path.extname(filePath);
    const hash = createHash('md5').update(content).digest('hex').slice(0, 12);
    const basename = path.basename(filePath, ext).toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${basename}-${hash}${ext}`;
  }

  /**
   * Upload a local image file to Supabase Storage
   * Returns the public URL
   */
  async uploadImage(localPath: string, basePath: string = ''): Promise<string> {
    // Resolve relative paths
    const absolutePath = path.isAbsolute(localPath)
      ? localPath
      : path.resolve(basePath, localPath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Image file not found: ${absolutePath}`);
    }

    // Read file
    const fileBuffer = fs.readFileSync(absolutePath);
    const contentType = this.getContentType(absolutePath);
    const filename = this.generateFilename(absolutePath, fileBuffer);
    const storagePath = `uploads/${filename}`;

    if (this.verbose) {
      console.log(`  📤 Uploading ${path.basename(absolutePath)} → ${storagePath}`);
    }

    // Check if file already exists
    const { data: existing } = await this.supabase
      .storage
      .from(this.bucket)
      .list('uploads', { search: filename });

    if (existing && existing.length > 0) {
      if (this.verbose) {
        console.log(`  ✓ File already exists, reusing: ${filename}`);
      }
      const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(storagePath);
      return data.publicUrl;
    }

    // Upload file
    const { data, error } = await this.supabase
      .storage
      .from(this.bucket)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload ${filename}: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage.from(this.bucket).getPublicUrl(data.path);

    if (this.verbose) {
      console.log(`  ✓ Uploaded successfully`);
    }

    return urlData.publicUrl;
  }

  /**
   * Process image URL - upload if local, return as-is if remote
   */
  async processImageUrl(imageUrl: string, basePath: string = ''): Promise<string> {
    if (this.isLocalPath(imageUrl)) {
      return this.uploadImage(imageUrl, basePath);
    }
    return imageUrl;
  }

  /**
   * Get content type from file extension
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Ensure the storage bucket exists
   */
  async ensureBucket(): Promise<void> {
    const { data: buckets } = await this.supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === this.bucket);

    if (!exists) {
      const { error } = await this.supabase.storage.createBucket(this.bucket, {
        public: true,
      });

      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`);
      }

      if (this.verbose) {
        console.log(`✓ Created storage bucket: ${this.bucket}`);
      }
    }
  }
}
