// Quick script to list available Gemini models for your API key
// Run: node src/scripts/listModels.mjs

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env') })

const key = process.env.GEMINI_API_KEY
if (!key) { console.error('No GEMINI_API_KEY in .env'); process.exit(1) }

const res  = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
const data = await res.json()

if (!res.ok) {
  console.error('API error:', res.status, JSON.stringify(data, null, 2))
  process.exit(1)
}

console.log('\n✅ Models available for your API key:\n')
data.models
  ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
  .forEach(m => console.log(' •', m.name.replace('models/', '')))

console.log('\n')
