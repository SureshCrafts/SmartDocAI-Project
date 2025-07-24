// backend/services/openaiService.js
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
  // Fail-fast on application startup if the key is missing
  throw new Error('OpenAI API key not set in environment variables.');
}

/**
 * Generic function to query the OpenAI Chat Completions API.
 * @param {Array<object>} messages - The array of message objects for the chat.
 * @param {string} [modelId='gpt-3.5-turbo'] - The model to use.
 * @param {number} [max_tokens=150] - The maximum number of tokens to generate.
 * @returns {Promise<string>} The content of the response message.
 */
const queryChatModel = async (messages, modelId = 'gpt-3.5-turbo', max_tokens = 150) => {
  try {
    const response = await axios.post(
      API_URL,
      { model: modelId, messages, max_tokens },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error querying OpenAI model ${modelId}:`, error.response?.data?.error || error.message);
    throw new Error(`OpenAI API call failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

module.exports = { queryChatModel };
