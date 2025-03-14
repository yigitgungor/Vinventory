import { error, json } from '@sveltejs/kit';
import { Buffer } from 'buffer';
import { OCR_SPACE_API_KEY } from '$env/static/private';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST({ request }) {
  console.log('OCR endpoint called');
  const data = await request.formData();
  const image = data.get('image') as File;

  if (!image || image.size === 0) {
    throw error(400, 'No image uploaded');
  }

  const buffer = await image.arrayBuffer();
  console.log('Image received, size:', image.size);

  try {
    console.log('Starting OCR.Space processing...');
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    if (!OCR_SPACE_API_KEY) {
      throw new Error('OCR_SPACE_API_KEY is not set in the environment');
    }

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: OCR_SPACE_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR.Space API error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('OCR.Space Raw Result:', result);

    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage?.join(' ') || 'Unknown error');
    }

    const ocrText = result.ParsedResults[0]?.ParsedText || '';
    console.log('OCR.Space Result:', ocrText);

    // Load initial data from JSON file
    const wineDataPath = join(process.cwd(), 'data', 'wine-data.json');
    const wineData = JSON.parse(readFileSync(wineDataPath, 'utf8'));
    const knownBrands = wineData.knownBrands;
    const regions = wineData.regions;

    // Parse the OCR text
    const cleanedText = ocrText.toLowerCase().replace(/[^a-z0-9\s-]/g, '');
    const ocrLines = cleanedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let fullText = ocrLines.join(' ');

    // Remove common OCR mistakes
    fullText = fullText.replace(/\b(mis en bouteille|sen boui|mis en|crú classé en)\b/gi, '');

    let name = '';
    let region = '';

    // Name parsing - prioritize known brands
    for (const brand of knownBrands) {
      if (fullText.includes(brand)) {
        name = brand.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        break;
      }
    }

    // Fallback: If no known brand is found, take the first significant phrase
    if (!name) {
      const words = fullText.split(' ').filter(word => word.length > 2);
      if (words.length > 0) {
        name = words.slice(0, 2).join(' ').charAt(0).toUpperCase() + words.slice(0, 2).join(' ').slice(1);
      }
    }

    // Region parsing
    for (const reg of regions) {
      if (fullText.includes(reg)) {
        region = reg.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        break;
      }
    }

    // Vintage parsing
    const vintagePattern = /\b(19|20)\d{2}\b/;
    let vintage = '';
    const vintageMatch = fullText.match(vintagePattern);
    if (vintageMatch) {
      vintage = vintageMatch[0];
    }

    console.log('Parsed OCR:', { name, vintage, region });
    return json({ name, vintage, region });
  } catch (err) {
    console.error('OCR.Space Error:', err);
    throw error(500, `OCR processing failed: ${err.message}`);
  }
}