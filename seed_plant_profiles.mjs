#!/usr/bin/env node

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load plant profiles from JSON
const profilesPath = path.join(__dirname, '../plant_profiles_20_species.json');
const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));

// Parse DATABASE_URL
function parseDatabaseUrl(dbUrl) {
  const url = new URL(dbUrl);
  return {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: parseInt(url.port) || 3306,
    ssl: url.searchParams.get('ssl') ? JSON.parse(url.searchParams.get('ssl')) : true,
  };
}

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

// Database connection
const connection = await mysql.createConnection(dbConfig);

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => {
      const map = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };
      return map[char];
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to generate content from profile
function generateContent(profile) {
  const sections = [];

  // Description
  if (profile.description) {
    sections.push(`## Beschreibung\n\n${profile.description}`);
  }

  // Leaf characteristics
  if (profile.leafCharacteristics) {
    sections.push('## Blattmerkmale\n');
    Object.entries(profile.leafCharacteristics).forEach(([key, value]) => {
      sections.push(`- **${key}**: ${value}`);
    });
  }

  // Care requirements
  if (profile.careRequirements) {
    sections.push('## Pflegeanforderungen\n');
    Object.entries(profile.careRequirements).forEach(([key, value]) => {
      sections.push(`- **${key}**: ${value}`);
    });
  }

  // Growth
  if (profile.growth) {
    sections.push('## Wachstum\n');
    Object.entries(profile.growth).forEach(([key, value]) => {
      sections.push(`- **${key}**: ${value}`);
    });
  }

  // Propagation
  if (profile.propagation) {
    sections.push(`## Vermehrung\n\n${profile.propagation.join(', ')}`);
  }

  // Toxicity
  if (profile.toxicity) {
    sections.push(`## Toxizität\n\n${profile.toxicity}`);
  }

  // Pests
  if (profile.pests) {
    sections.push(`## Schädlinge\n\n${profile.pests.join(', ')}`);
  }

  // Special features
  if (profile.specialFeatures) {
    sections.push(`## Besonderheiten\n\n${profile.specialFeatures}`);
  }

  return sections.join('\n\n');
}

// Insert Monstera profiles
console.log('🌱 Inserting Monstera profiles...');
for (const profile of profilesData.monstera_profiles) {
  const slug = createSlug(profile.name);
  const content = generateContent(profile);
  const excerpt = profile.description.substring(0, 320);

  try {
    await connection.execute(
      `INSERT INTO knowledge_articles 
       (slug, title, category, excerpt, content, author, readingMinutes, isFeatured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        profile.name,
        'houseplants',
        excerpt,
        content,
        'BlackwaterLeaf Redaktion',
        8,
        false,
      ]
    );
    console.log(`  ✓ ${profile.name}`);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`  ⊘ ${profile.name} (already exists)`);
    } else {
      console.error(`  ✗ ${profile.name}: ${error.message}`);
    }
  }
}

// Insert Alocasia profiles
console.log('\n🌿 Inserting Alocasia profiles...');
for (const profile of profilesData.alocasia_profiles) {
  const slug = createSlug(profile.name);
  const content = generateContent(profile);
  const excerpt = profile.description.substring(0, 320);

  try {
    await connection.execute(
      `INSERT INTO knowledge_articles 
       (slug, title, category, excerpt, content, author, readingMinutes, isFeatured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        profile.name,
        'houseplants',
        excerpt,
        content,
        'BlackwaterLeaf Redaktion',
        8,
        false,
      ]
    );
    console.log(`  ✓ ${profile.name}`);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`  ⊘ ${profile.name} (already exists)`);
    } else {
      console.error(`  ✗ ${profile.name}: ${error.message}`);
    }
  }
}

// Count total articles
const [result] = await connection.execute('SELECT COUNT(*) as count FROM knowledge_articles');
console.log(`\n✓ Total knowledge articles in database: ${result[0].count}`);

await connection.end();
console.log('✓ Seed completed successfully!');
