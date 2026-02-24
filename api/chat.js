export default async function handler(req, res) {
  try {
    const { method } = req;
    if (method === 'OPTIONS') {
      return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').send();
    }

    if (method !== 'POST') {
      return res.status(405).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Method not allowed' });
    }

    const { prompt, tone, genre } = req.body;
    if (!prompt) {
      return res.status(400).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Prompt is required' });
    }

    const systemPrompt = `Act as a creative writing assistant. Generate a ${genre || 'story'} with a ${tone || 'neutral'} tone based on the following prompt: ${prompt}.`;
    const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: '' }];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Internal server error' });
  }
}