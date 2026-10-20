import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const FREE_LLM_BASE_URL = process.env.FREE_LLM_BASE_URL || 'http://127.0.0.1:31415/v1/chat/completions';
const FREE_LLM_API_KEY = process.env.FREE_LLM_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isKeyConfigured = Boolean(FREE_LLM_API_KEY && FREE_LLM_API_KEY !== 'your_free_llm_api_key_here');
  res.json({
    status: 'online',
    gateway: 'FreeLLMAPI proxy active',
    isConfigured: isKeyConfigured
  });
});

// Chat proxy endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request: "messages" array is required.' });
    }

    if (!FREE_LLM_API_KEY || FREE_LLM_API_KEY === 'your_free_llm_api_key_here') {
      return res.status(500).json({
        error: 'FreeLLMAPI key is not configured on the backend. Please set FREE_LLM_API_KEY in your local .env file.'
      });
    }

    // Prepend system prompt for NEXUS Cyber Command Center persona
    const systemPrompt = {
      role: 'system',
      content: 'You are NEXUS, an elite AI cybersecurity command center assistant. Provide concise, accurate, and professional cyber intelligence, telemetry analysis, and security hardening advice. Maintain a futuristic sci-fi workstation persona.'
    };

    const payload = {
      model: 'auto',
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 1500
    };

    // Set a 30s timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const apiResponse = await fetch(FREE_LLM_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FREE_LLM_API_KEY}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('FreeLLMAPI Gateway Error: status', apiResponse.status);
      return res.status(apiResponse.status).json({
        error: `FreeLLMAPI gateway error (status ${apiResponse.status}): ${errorText || apiResponse.statusText}`
      });
    }

    const data = await apiResponse.json();

    // Extract reply from OpenAI-compatible response format
    const reply = data.choices?.[0]?.message?.content || data.message?.content || 'No response content returned from model gateway.';

    return res.json({ reply });

  } catch (err) {
    console.error('Backend proxy error: An error occurred during request processing.');
    if (err && err.name === 'AbortError') {
      return res.status(504).json({ error: 'Gateway timeout: FreeLLMAPI did not respond within 30 seconds.' });
    }
    return res.status(500).json({
      error: `Failed to connect to FreeLLMAPI gateway at ${FREE_LLM_BASE_URL}. Ensure FreeLLMAPI is running locally on port 31415.`
    });
  }
});

// Bind strictly to 127.0.0.1 (localhost only)
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[NEXUS BACKEND] Proxy server running securely at http://127.0.0.1:${PORT}`);
});
