import fs from 'fs';
import path from 'path';

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing VITE_GEMINI_API_KEY in .env — run: export VITE_GEMINI_API_KEY=your_key');
  process.exit(1);
}
const MODEL = 'gemini-3-pro-image-preview';
const OUTPUT_DIR = path.resolve('public/images');

const SCENARIOS = [
  {
    id: 'bellandur',
    prompts: [
      "Marshy swampland in rural Bangalore, red soil, Bajaj Pulsar motorcycle on dusty road, warm afternoon light, cinematic, hyper realistic",
      "Luxury penthouse balcony in Bangalore overlooking glass skyscrapers at golden hour, filter coffee, wealthy lifestyle, cinematic, hyper realistic",
      "Indian office worker stuck in heavy Bangalore traffic at dawn, auto-rickshaws, corporate park in distance, grey tones, cinematic, hyper realistic",
    ],
  },
  {
    id: 'bitcoin',
    prompts: [
      "Indian college hostel room, old laptop on messy desk, posters on wall, warm tungsten light, moody nostalgic, cinematic, hyper realistic",
      "Luxury infinity pool villa overlooking ocean in Goa at sunset, champagne, modern architecture, golden light, cinematic, hyper realistic",
      "Indian office worker at cluttered desk late at night, fluorescent lights, empty coffee cups, overworked, cold blue tones, cinematic, hyper realistic",
    ],
  },
  {
    id: 'varkala',
    prompts: [
      "Remote quiet beach cliff in Varkala Kerala, no tourists, a small for-sale sign, crashing waves, untouched paradise, golden hour, cinematic, hyper realistic",
      "Beautiful beachside homestay in Varkala fully booked, fairy lights, happy guests on terrace, ocean view, work-from-anywhere lifestyle, cinematic, hyper realistic",
      "Indian person scrolling Varkala travel reels on Instagram at office desk, checking flight prices they won't book, longing, cold office light, cinematic, hyper realistic",
    ],
  },
  {
    id: 'mrf',
    prompts: [
      "Vintage Indian street, white Maruti 800 parked outside share broker office, retro signage, warm nostalgic film grain, cinematic, hyper realistic",
      "Luxury Indian home with lush garden, retired couple having tea on veranda, peaceful wealthy retirement, golden warm tones, cinematic, hyper realistic",
      "Indian man driving past giant MRF billboard in morning traffic, cramped car, melancholy, grey tones, cinematic, hyper realistic",
    ],
  },
  {
    id: 'startup',
    prompts: [
      "Tiny Indian startup office, two desks, messy but energetic, warm tungsten light, cinematic, hyper realistic",
      "Confident Indian professional mentoring young founders in a co-working space, city skyline, golden hour, cinematic, hyper realistic",
      "Indian office worker scrolling through startup acquisition news on phone during lunch break, corporate cafeteria, wistful expression, cinematic, hyper realistic",
    ],
  },
];

const SCENE_NAMES = ['opportunity', 'dream', 'reality'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const generateImage = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`    Attempt ${attempt}/${retries}...`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
            generationConfig: { responseModalities: ['IMAGE'] },
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        console.warn(`    API error: ${data.error.message}`);
        if (attempt < retries) {
          const wait = attempt * 15000;
          console.log(`    Waiting ${wait / 1000}s before retry...`);
          await sleep(wait);
          continue;
        }
        return null;
      }

      const parts = data.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p) => p.inlineData);

      if (imagePart) {
        return Buffer.from(imagePart.inlineData.data, 'base64');
      }

      console.warn('    No image in response');
      if (attempt < retries) {
        await sleep(attempt * 10000);
      }
    } catch (err) {
      console.error(`    Error: ${err.message}`);
      if (attempt < retries) {
        await sleep(attempt * 10000);
      }
    }
  }
  return null;
};

const main = async () => {
  console.log('=== Regret Roulette Image Generator ===\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const scenario of SCENARIOS) {
    console.log(`\n📌 Scenario: ${scenario.id}`);

    for (let i = 0; i < scenario.prompts.length; i++) {
      const filename = `${scenario.id}-${SCENE_NAMES[i]}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      if (fs.existsSync(filepath)) {
        console.log(`  ✅ ${filename} already exists, skipping`);
        skipped++;
        continue;
      }

      console.log(`  🎨 Generating ${filename}...`);
      console.log(`     Prompt: "${scenario.prompts[i].slice(0, 80)}..."`);

      const imageBuffer = await generateImage(scenario.prompts[i]);

      if (imageBuffer) {
        fs.writeFileSync(filepath, imageBuffer);
        console.log(`  💾 Saved ${filename} (${(imageBuffer.length / 1024).toFixed(0)} KB)`);
        generated++;
      } else {
        console.log(`  ❌ Failed to generate ${filename}`);
        failed++;
      }

      // Rate limit: wait between requests
      console.log('  ⏳ Waiting 8s for rate limit...');
      await sleep(8000);
    }
  }

  console.log('\n=== DONE ===');
  console.log(`Generated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
  console.log(`Total expected: 15 images in ${OUTPUT_DIR}`);
};

main();
