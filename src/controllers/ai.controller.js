const aiService = require('../services/ai.service');

exports.query = async (req, res, next) => {
  try {
    const { prompt, options } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt in request body' });

    const result = await aiService.ask(prompt, options);
    return res.json({ reply: result.text });
  } catch (err) { next(err); }
};
