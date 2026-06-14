import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'

// Initialise Gemini
let genAI = null
let model  = null

if (env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    // gemini-2.5-flash requires SDK ≥0.7 (v1beta). Falls back to gemini-pro for old SDK.
    const modelName = env.GEMINI_MODEL || 'gemini-pro'
    model = genAI.getGenerativeModel({ model: modelName })
    console.log(`[Saathi] Using model: ${modelName}`)
  } catch (e) {
    console.warn('[Saathi] Gemini init failed:', e.message)
  }
}

// System prompt builder 
const buildSystemPrompt = (user, analytics) => {
  const streak       = user?.streak?.current    || 0
  const score        = user?.productivityScore  || 0
  const totalHours   = Math.round((user?.totalFocusMinutes || 0) / 60)
  const weeklyMins   = analytics?.weekly?.focusMinutes  || 0
  const weeklySess   = analytics?.weekly?.sessions      || 0
  const overrides    = analytics?.weekly?.overrides     || 0
  const topSite      = analytics?.topDistraction?.domain || 'none recorded'

  return `You are Saathi, the AI productivity coach inside Prism — a cognitive friction platform that helps users reduce digital distraction and build deep focus habits.

Your personality: warm, direct, evidence-based, and concise. You never use filler phrases like "Great question!" or "Certainly!". You give specific, actionable advice.

Current user context:
- Name: ${user?.name || 'the user'}
- Current focus streak: ${streak} day${streak !== 1 ? 's' : ''}
- Productivity score: ${score}/100
- Total focus time (all-time): ${totalHours} hours
- Focus this week: ${weeklyMins} minutes across ${weeklySess} sessions
- Override attempts this week: ${overrides}
- Top distraction: ${topSite}

Your coaching guidelines:
1. Keep responses to 2–4 sentences unless the user asks for detail
2. Reference the user's actual data when giving advice
3. Suggest specific, immediate actions (not vague tips)
4. If productivity score is below 50, focus on building consistency
5. If override count is high, suggest friction-reduction strategies
6. Celebrate streaks and improvements specifically
7. Relate advice to cognitive science / behavioural psychology when relevant

You have access to Prism's features: focus sessions (pomodoro/deep work), site blocking with friction levels, streak tracking, and the 12-week heatmap.`
}

// Convert frontend history to Gemini format
const toGeminiHistory = (history = []) =>
  history
    .filter(m => m.role !== 'system')
    .map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

// Main chat function 
export const aiService = {
  async chat(userMessage, history = [], user = null, analytics = null) {
    if (!model) {
      throw new ApiError(501, 'AI coaching is not configured. Please add GEMINI_API_KEY to your .env file.')
    }

    if (!userMessage?.trim()) {
      throw new ApiError(400, 'Message cannot be empty')
    }

    const systemPrompt  = buildSystemPrompt(user, analytics)
    const geminiHistory = toGeminiHistory(history)

    // Prepend system prompt as first user/model exchange if history is empty
    const fullHistory = geminiHistory.length === 0 ? [
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I\'m ready to help as Saathi, your Prism productivity coach.' }] },
    ] : [
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood.' }] },
      ...geminiHistory,
    ]

    try {
      const chat   = model.startChat({ history: fullHistory, generationConfig: { maxOutputTokens: 600, temperature: 0.75 } })
      const result = await chat.sendMessage(userMessage.trim())
      const text   = result.response.text()

      return { reply: text, model: 'gemini-1.5-flash' }
    } catch (err) {
      // Google API quota exceeded
      if (err.status === 429 || err.message?.includes('429')) {
        throw new ApiError(429, 'Google AI quota exceeded. Please wait a moment and try again.')
      }
      throw new ApiError(502, `AI service error: ${err.message}`)
    }
  },

  // Quick coaching suggestions based on user state
  getSuggestions(user, analytics) {
    const score    = user?.productivityScore || 0
    const streak   = user?.streak?.current  || 0
    const overrides = analytics?.weekly?.overrides || 0
    const mins     = analytics?.weekly?.focusMinutes || 0

    const suggestions = []
    if (mins === 0)       suggestions.push('How do I get started with deep focus?')
    if (streak === 0)     suggestions.push('Help me build a daily focus habit')
    if (score < 50)       suggestions.push('Why is my productivity score low?')
    if (overrides > 5)    suggestions.push('I keep overriding blocks — what should I do?')
    if (streak >= 7)      suggestions.push(`I have a ${streak}-day streak! What's next?`)
    if (mins > 0 && mins < 60) suggestions.push('How can I increase my weekly focus time?')

    // Always include fallbacks
    if (suggestions.length < 3) {
      suggestions.push('What should I focus on this week?')
      suggestions.push('Explain cognitive friction and how it works')
      suggestions.push('Give me a deep work strategy')
    }

    return suggestions.slice(0, 4)
  },
}
