import { SeedTopic, SeedItem } from './types';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class Validator {
  /**
   * Validate a seed topic
   */
  static validateTopic(data: any, filename: string = 'unknown'): SeedTopic {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Topic must be an object', 'root');
    }

    // Required fields
    this.requireField(data, 'title', 'string');
    this.requireField(data, 'category', 'string');
    this.requireField(data, 'mode', 'string');
    this.requireField(data, 'view_type', 'string');
    this.requireField(data, 'items', 'array');

    // Validate mode
    const validModes = ['A', 'B', 'C', 'D'];
    if (!validModes.includes(data.mode)) {
      throw new ValidationError(
        `Invalid mode: ${data.mode}. Must be one of: ${validModes.join(', ')}`,
        'mode'
      );
    }

    // Validate view_type
    const validViewTypes = ['battle', 'test', 'tier', 'fact'];
    if (!validViewTypes.includes(data.view_type)) {
      throw new ValidationError(
        `Invalid view_type: ${data.view_type}. Must be one of: ${validViewTypes.join(', ')}`,
        'view_type'
      );
    }

    // Mode-specific validation
    if (data.mode === 'B') {
      this.validateModeB(data);
      // Mode B doesn't require items (results are in meta.results)
    } else {
      // Other modes require items
      if (data.items.length === 0) {
        throw new ValidationError('Topic must have at least one item', 'items');
      }

      // Validate each item
      data.items.forEach((item: any, index: number) => {
        try {
          this.validateItem(item);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(
              `Item ${index + 1}: ${error.message}`,
              `items[${index}].${error.field}`
            );
          }
          throw error;
        }
      });
    }

    if (data.mode === 'C') {
      this.validateModeC(data);
    }

    return data as SeedTopic;
  }

  /**
   * Validate a seed item
   */
  private static validateItem(item: any): SeedItem {
    this.requireField(item, 'name', 'string');

    // Require either image_url or youtube_url
    if (!item.image_url && !item.youtube_url) {
      throw new ValidationError('Item must have either image_url or youtube_url', 'image_url/youtube_url');
    }

    // Optional fields type checking
    if (item.description !== undefined && typeof item.description !== 'string') {
      throw new ValidationError('description must be a string', 'description');
    }

    if (item.rank_order !== undefined && typeof item.rank_order !== 'number') {
      throw new ValidationError('rank_order must be a number', 'rank_order');
    }

    if (item.elo_score !== undefined && typeof item.elo_score !== 'number') {
      throw new ValidationError('elo_score must be a number', 'elo_score');
    }

    return item as SeedItem;
  }

  /**
   * Validate Mode B (test) specific requirements
   */
  private static validateModeB(data: any): void {
    if (!data.meta || !data.meta.questions || !Array.isArray(data.meta.questions)) {
      throw new ValidationError(
        'Mode B (test) requires meta.questions array',
        'meta.questions'
      );
    }

    if (!data.meta.results || !Array.isArray(data.meta.results)) {
      throw new ValidationError(
        'Mode B (test) requires meta.results array',
        'meta.results'
      );
    }

    // Validate questions
    data.meta.questions.forEach((q: any, index: number) => {
      if (!q.prompt || typeof q.prompt !== 'string') {
        throw new ValidationError(
          `Question ${index + 1} must have a prompt string`,
          `meta.questions[${index}].prompt`
        );
      }

      if (!q.choices || !Array.isArray(q.choices)) {
        throw new ValidationError(
          `Question ${index + 1} must have choices array`,
          `meta.questions[${index}].choices`
        );
      }

      q.choices.forEach((choice: any, cIndex: number) => {
        if (!choice.text || typeof choice.text !== 'string') {
          throw new ValidationError(
            `Question ${index + 1}, choice ${cIndex + 1} must have text`,
            `meta.questions[${index}].choices[${cIndex}].text`
          );
        }
        if (choice.weight === undefined || typeof choice.weight !== 'number') {
          throw new ValidationError(
            `Question ${index + 1}, choice ${cIndex + 1} must have weight number`,
            `meta.questions[${index}].choices[${cIndex}].weight`
          );
        }
      });
    });

    // Validate results
    data.meta.results.forEach((r: any, index: number) => {
      if (r.threshold === undefined || typeof r.threshold !== 'number') {
        throw new ValidationError(
          `Result ${index + 1} must have threshold number`,
          `meta.results[${index}].threshold`
        );
      }
      if (!r.label || typeof r.label !== 'string') {
        throw new ValidationError(
          `Result ${index + 1} must have label string`,
          `meta.results[${index}].label`
        );
      }
      if (!r.summary || typeof r.summary !== 'string') {
        throw new ValidationError(
          `Result ${index + 1} must have summary string`,
          `meta.results[${index}].summary`
        );
      }
      if (!r.image_url || typeof r.image_url !== 'string') {
        throw new ValidationError(
          `Result ${index + 1} must have image_url string`,
          `meta.results[${index}].image_url`
        );
      }
      if (!r.description || typeof r.description !== 'string') {
        throw new ValidationError(
          `Result ${index + 1} must have description string`,
          `meta.results[${index}].description`
        );
      }
    });
  }

  /**
   * Validate Mode C (tier) specific requirements
   */
  private static validateModeC(data: any): void {
    if (!data.meta || !data.meta.tiers || !Array.isArray(data.meta.tiers)) {
      throw new ValidationError(
        'Mode C (tier) requires meta.tiers array',
        'meta.tiers'
      );
    }

    if (data.meta.tiers.length === 0) {
      throw new ValidationError(
        'Mode C (tier) meta.tiers must not be empty',
        'meta.tiers'
      );
    }
  }

  /**
   * Require a field to exist and have the correct type
   */
  private static requireField(obj: any, field: string, type: 'string' | 'array' | 'number' | 'object'): void {
    if (obj[field] === undefined || obj[field] === null) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }

    const actualType = Array.isArray(obj[field]) ? 'array' : typeof obj[field];
    if (actualType !== type) {
      throw new ValidationError(
        `Field ${field} must be ${type}, got ${actualType}`,
        field
      );
    }
  }
}
