#!/usr/bin/env bun

import * as fs from 'fs';
import * as path from 'path';
import { Seeder } from './lib/seeder';
import { SeedConfig, SeedMode } from './lib/types';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printUsage() {
  console.log(`
${colors.bright}Rank Factory - Seed Script${colors.reset}

${colors.cyan}Usage:${colors.reset}
  bun run seed <input> [options]

${colors.cyan}Arguments:${colors.reset}
  <input>              Path to JSON file or directory containing JSON files

${colors.cyan}Options:${colors.reset}
  --mode <A|B|C|D>     Filter by mode (A=battle, B=test, C=tier, D=fact)
  --upload-images      Upload local images to Supabase Storage
  --dry-run            Validate only, don't insert to database
  --verbose, -v        Show detailed progress
  --help, -h           Show this help message

${colors.cyan}Environment Variables:${colors.reset}
  SUPABASE_URL                 Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY    Supabase service role key (or SECRET_KEY)
  SUPABASE_SECRET_KEY          Alternative to SERVICE_ROLE_KEY

${colors.cyan}Examples:${colors.reset}
  # Seed a single file
  bun run seed data/my-topic.json

  # Seed all files in a directory
  bun run seed data/topics/

  # Seed with image upload
  bun run seed data/my-topic.json --upload-images

  # Filter by mode and validate only
  bun run seed data/ --mode A --dry-run

  # Verbose output
  bun run seed data/my-topic.json -v --upload-images
`);
}

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf-8');
    raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .forEach((line) => {
        const idx = line.indexOf('=');
        if (idx > 0) {
          const key = line.slice(0, idx).trim();
          const value = line.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
  }
}

function parseArgs(): SeedConfig | null {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    return null;
  }

  const config: SeedConfig = {
    input: '',
    uploadImages: false,
    dryRun: false,
    verbose: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg.startsWith('--') || arg.startsWith('-')) {
      switch (arg) {
        case '--mode':
          config.mode = args[++i] as SeedMode;
          if (!['A', 'B', 'C', 'D'].includes(config.mode)) {
            console.error(`${colors.red}Error: Invalid mode "${config.mode}". Must be A, B, C, or D${colors.reset}`);
            process.exit(1);
          }
          break;
        case '--upload-images':
          config.uploadImages = true;
          break;
        case '--dry-run':
          config.dryRun = true;
          break;
        case '--verbose':
        case '-v':
          config.verbose = true;
          break;
        default:
          console.error(`${colors.red}Error: Unknown option "${arg}"${colors.reset}`);
          printUsage();
          process.exit(1);
      }
    } else {
      if (config.input) {
        console.error(`${colors.red}Error: Multiple input paths specified${colors.reset}`);
        process.exit(1);
      }
      config.input = arg;
    }

    i++;
  }

  if (!config.input) {
    console.error(`${colors.red}Error: No input path specified${colors.reset}`);
    printUsage();
    process.exit(1);
  }

  return config;
}

async function main() {
  console.log(`${colors.bright}${colors.blue}🌱 Rank Factory Seed Script${colors.reset}\n`);

  // Load environment variables
  loadEnv();

  // Parse arguments
  const config = parseArgs();
  if (!config) {
    process.exit(0);
  }

  // Get Supabase credentials
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`${colors.red}Error: Missing Supabase credentials${colors.reset}`);
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables\n');
    process.exit(1);
  }

  // Show configuration
  console.log(`${colors.cyan}Configuration:${colors.reset}`);
  console.log(`  Input: ${config.input}`);
  if (config.mode) console.log(`  Mode filter: ${config.mode}`);
  console.log(`  Upload images: ${config.uploadImages ? 'Yes' : 'No'}`);
  console.log(`  Dry run: ${config.dryRun ? 'Yes' : 'No'}`);
  console.log(`  Verbose: ${config.verbose ? 'Yes' : 'No'}`);
  console.log('');

  // Run seeder
  const seeder = new Seeder(supabaseUrl, supabaseKey, config);

  try {
    const results = await seeder.seed();

    // Print summary
    console.log(`\n${colors.bright}${colors.cyan}Summary:${colors.reset}`);

    const created = results.filter((r) => r.status === 'created').length;
    const updated = results.filter((r) => r.status === 'updated').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;

    console.log(`  ${colors.green}✓ Created: ${created}${colors.reset}`);
    console.log(`  ${colors.yellow}⟳ Updated: ${updated}${colors.reset}`);
    if (skipped > 0) console.log(`  ${colors.blue}⊘ Skipped: ${skipped}${colors.reset}`);
    if (errors > 0) console.log(`  ${colors.red}✗ Errors: ${errors}${colors.reset}`);

    // Show errors
    const errorResults = results.filter((r) => r.status === 'error');
    if (errorResults.length > 0) {
      console.log(`\n${colors.red}${colors.bright}Errors:${colors.reset}`);
      errorResults.forEach((r) => {
        console.log(`  ${colors.red}✗ ${r.topicTitle}: ${r.error}${colors.reset}`);
      });
      process.exit(1);
    }

    console.log(`\n${colors.green}${colors.bright}✓ Seeding completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ Fatal error:${colors.reset}`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
