#!/usr/bin/env node

/**
 * Скрипт для автоматического перевода статей
 * Использует MyMemory API (бесплатно, без ключа)
 * Языки: RU → EN, DE
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// MyMemory API endpoint
const TRANSLATE_API = 'https://api.mymemory.translated.net/get';

// Функция для выполнения HTTP запроса
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Функция для перевода текста
async function translateText(text, sourceLang, targetLang) {
  if (!text || text.length === 0) return '';

  // Ограничиваем длину запроса (API имеет лимит)
  const maxChunk = 500;
  if (text.length > maxChunk) {
    const parts = text.match(new RegExp(`.{1,${maxChunk}}`, 'g'));
    const translated = await Promise.all(
      parts.map(part => translateText(part, sourceLang, targetLang))
    );
    return translated.join('');
  }

  try {
    const url = `${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const response = await makeRequest(url);

    if (response.responseData && response.responseData.translatedText) {
      return response.responseData.translatedText;
    }
    return text;
  } catch (error) {
    console.error(`⚠ Ошибка при переводе: ${error.message}`);
    return text;
  }
}

// Функция для обработки файла поста
async function processPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Парсим YAML frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/);
  if (!match) {
    console.warn(`⚠ Неверный формат: ${filePath}`);
    return;
  }

  const [, frontmatter, body] = match;
  const yaml = parseFrontmatter(frontmatter);

  // Если язык не русский - пропускаем
  if (yaml.lang !== 'ru') {
    console.log(`⏭ ${path.basename(filePath)} (не RU язык)`);
    return;
  }

  console.log(`📝 Переводим: ${yaml.title}...`);

  // Переводим заголовок и описание
  const enTitle = await translateText(yaml.title, 'ru|en', 'en');
  const deTitle = await translateText(yaml.title, 'ru|de', 'de');

  const enDesc = await translateText(yaml.description, 'ru|en', 'en');
  const deDesc = await translateText(yaml.description, 'ru|de', 'de');

  // Создаем EN версию
  const enFrontmatter = yaml;
  enFrontmatter.lang = 'en';
  enFrontmatter.title = enTitle;
  enFrontmatter.description = enDesc;

  const enContent = formatFrontmatter(enFrontmatter) + '\n---\n' + body;
  const enPath = filePath.replace(/\.md$/, '.en.md');
  fs.writeFileSync(enPath, enContent);

  // Создаем DE версию
  const deFrontmatter = yaml;
  deFrontmatter.lang = 'de';
  deFrontmatter.title = deTitle;
  deFrontmatter.description = deDesc;

  const deContent = formatFrontmatter(deFrontmatter) + '\n---\n' + body;
  const dePath = filePath.replace(/\.md$/, '.de.md');
  fs.writeFileSync(dePath, deContent);

  console.log(`✓ Создано: ${path.basename(enPath)}, ${path.basename(dePath)}`);
}

// Парсим YAML
function parseFrontmatter(yaml) {
  const result = {};
  yaml.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      result[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  return result;
}

// Форматируем YAML
function formatFrontmatter(yaml) {
  let result = '---\n';
  for (const [key, value] of Object.entries(yaml)) {
    if (key !== 'body') {
      result += `${key}: ${typeof value === 'string' && value.includes('\n') ? `"${value}"` : value}\n`;
    }
  }
  result += '---';
  return result;
}

// Основная функция
async function main() {
  const postsDir = path.join(__dirname, '../_posts/blog');

  if (!fs.existsSync(postsDir)) {
    console.log('⚠ Папка с постами не найдена');
    return;
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') && !f.includes('.en.') && !f.includes('.de.'));

  if (files.length === 0) {
    console.log('📭 Нет постов для перевода');
    return;
  }

  console.log(`\n🌐 Автоперевод статей (${files.length} найдено)\n`);

  for (const file of files) {
    await processPost(path.join(postsDir, file));
    // Задержка, чтобы не перегружать API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✓ Готово!\n');
}

main().catch(console.error);
