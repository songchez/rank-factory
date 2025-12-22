import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { SeedTopic, SeedConfig, SeedResult } from './types';
import { Validator, ValidationError } from './validator';
import { ImageUploader } from './image-uploader';

export class Seeder {
  private supabase: SupabaseClient;
  private imageUploader: ImageUploader | null = null;
  private config: SeedConfig;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: SeedConfig
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = config;

    if (config.uploadImages) {
      this.imageUploader = new ImageUploader(supabaseUrl, supabaseKey, config.verbose);
    }
  }

  /**
   * Seed from a single file or directory
   */
  async seed(): Promise<SeedResult[]> {
    const inputPath = path.resolve(this.config.input);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input path does not exist: ${inputPath}`);
    }

    const stat = fs.statSync(inputPath);
    const files: string[] = [];

    if (stat.isDirectory()) {
      // Find all JSON files in directory
      const items = fs.readdirSync(inputPath);
      for (const item of items) {
        const itemPath = path.join(inputPath, item);
        if (fs.statSync(itemPath).isFile() && item.endsWith('.json')) {
          files.push(itemPath);
        }
      }
    } else if (inputPath.endsWith('.json')) {
      files.push(inputPath);
    } else {
      throw new Error('Input must be a JSON file or directory');
    }

    if (files.length === 0) {
      throw new Error('No JSON files found');
    }

    // Ensure bucket exists if uploading images
    if (this.imageUploader) {
      await this.imageUploader.ensureBucket();
    }

    const results: SeedResult[] = [];

    for (const file of files) {
      const result = await this.seedFile(file);
      results.push(result);
    }

    return results;
  }

  /**
   * Seed a single JSON file
   */
  private async seedFile(filePath: string): Promise<SeedResult> {
    const filename = path.basename(filePath);

    try {
      if (this.config.verbose) {
        console.log(`\n📄 Processing: ${filename}`);
      }

      // Read and parse JSON
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Validate
      const topic = Validator.validateTopic(data, filename);

      // Filter by mode if specified
      if (this.config.mode && topic.mode !== this.config.mode) {
        if (this.config.verbose) {
          console.log(`  ⊘ Skipped (mode ${topic.mode} !== ${this.config.mode})`);
        }
        return {
          success: true,
          topicTitle: topic.title,
          itemCount: 0,
          status: 'skipped',
        };
      }

      // Process images
      const basePath = path.dirname(filePath);
      const uploadedImages: string[] = [];

      if (this.imageUploader) {
        for (const item of topic.items) {
          if (this.imageUploader.isLocalPath(item.image_url)) {
            const newUrl = await this.imageUploader.processImageUrl(item.image_url, basePath);
            uploadedImages.push(newUrl);
            item.image_url = newUrl;
          }
        }
      }

      // Dry run - skip database operations
      if (this.config.dryRun) {
        const itemCount = topic.mode === 'B' ? (topic.meta?.results?.length ?? 0) : topic.items.length;
        if (this.config.verbose) {
          console.log(`  ✓ Validated successfully (dry run)`);
          console.log(`  📊 ${itemCount} ${topic.mode === 'B' ? 'results' : 'items'}`);
        }
        return {
          success: true,
          topicTitle: topic.title,
          itemCount,
          status: 'created',
          uploadedImages,
        };
      }

      // Upsert topic
      const result = await this.upsertTopic(topic);

      if (this.config.verbose) {
        const itemCount = topic.mode === 'B' ? (topic.meta?.results?.length ?? 0) : topic.items.length;
        console.log(`  ✓ ${result.status === 'created' ? 'Created' : 'Updated'}: ${topic.title}`);
        console.log(`  📊 ${itemCount} ${topic.mode === 'B' ? 'results' : 'items'}`);
      }

      return {
        ...result,
        uploadedImages,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (this.config.verbose) {
        console.error(`  ✗ Error: ${errorMessage}`);
      }

      return {
        success: false,
        topicTitle: filename,
        itemCount: 0,
        status: 'error',
        error: errorMessage,
      };
    }
  }

  /**
   * Upsert a topic and its items to the database
   */
  private async upsertTopic(topic: SeedTopic): Promise<SeedResult> {
    // Check if topic exists
    const { data: existing, error: fetchError } = await this.supabase
      .from('ranking_topics')
      .select('id')
      .eq('title', topic.title)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to check existing topic: ${fetchError.message}`);
    }

    let topicId: string;
    let status: 'created' | 'updated';

    if (existing) {
      // Update existing topic
      const { data: updated, error: updateError } = await this.supabase
        .from('ranking_topics')
        .update({
          category: topic.category,
          mode: topic.mode,
          view_type: topic.view_type,
          meta: topic.meta || {},
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update topic: ${updateError.message}`);
      }

      topicId = updated.id;
      status = 'updated';
    } else {
      // Create new topic
      const { data: inserted, error: insertError } = await this.supabase
        .from('ranking_topics')
        .insert({
          title: topic.title,
          category: topic.category,
          mode: topic.mode,
          view_type: topic.view_type,
          meta: topic.meta || {},
          display_order: 999, // Will be reordered later
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create topic: ${insertError.message}`);
      }

      topicId = inserted.id;
      status = 'created';
    }

    // Mode B (test) doesn't use ranking_items - results are in meta.results
    if (topic.mode !== 'B') {
      // Delete existing items
      await this.supabase.from('ranking_items').delete().eq('topic_id', topicId);

      // Insert items
      const itemsToInsert = topic.items.map((item, idx) => ({
        topic_id: topicId,
        name: item.name,
        image_url: item.image_url,
        youtube_url: item.youtube_url,
        description: item.description ?? '',
        meta: item.meta ?? {},
        rank_order: item.rank_order ?? idx + 1,
        elo_score: item.elo_score ?? 1200,
        win_count: item.win_count ?? 0,
        loss_count: item.loss_count ?? 0,
        match_count: item.match_count ?? 0,
      }));

      const { error: itemsError } = await this.supabase
        .from('ranking_items')
        .insert(itemsToInsert);

      if (itemsError) {
        throw new Error(`Failed to insert items: ${itemsError.message}`);
      }
    }

    // Handle Mode B quiz questions
    if (topic.mode === 'B' && topic.meta?.questions) {
      await this.supabase.from('quiz_questions').delete().eq('topic_id', topicId);

      const questions = (topic.meta.questions as any[]).map((q) => ({
        topic_id: topicId,
        prompt: q.prompt,
        choices: q.choices,
        answer: '',
        weight: 1,
        question_type: 'MCQ',
      }));

      const { error: questionError } = await this.supabase
        .from('quiz_questions')
        .insert(questions);

      if (questionError) {
        throw new Error(`Failed to insert quiz questions: ${questionError.message}`);
      }
    }

    const itemCount = topic.mode === 'B' ? (topic.meta?.results?.length ?? 0) : topic.items.length;

    return {
      success: true,
      topicId,
      topicTitle: topic.title,
      itemCount,
      status,
    };
  }
}
