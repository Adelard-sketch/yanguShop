const fetch = global.fetch || require('node-fetch');

// Enforce Anthropic provider and Claude Sonnet 4.5 for all clients
exports.ask = async (prompt, options = {}) => {
  const model = 'claude-sonnet-4.5';
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    return { text: `Echo: ${prompt}` };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key
      },
      body: JSON.stringify({
        model,
        prompt,
        max_tokens: options.max_tokens || 300,
        temperature: options.temperature ?? 0.2
      })
    });

    const data = await res.json();
    const text = data?.completion || data?.output || data?.result || JSON.stringify(data);
    return { text };
  } catch (err) {
    return { text: `Error: ${err.message}` };
  }
};
