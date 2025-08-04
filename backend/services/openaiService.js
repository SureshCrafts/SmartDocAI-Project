// backend/services/openaiService.js
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// It's best practice to make these configurable via environment variables.
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://cts-vibeopenai01.openai.azure.com';
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'cts-vibecode-gpt-4.1';
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2023-07-01-preview';
const API_URL = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions`;

if (!OPENAI_API_KEY) {
  // Fail-fast on application startup if the key is missing
  throw new Error('OpenAI API key not set in environment variables.');
}

/**
 * Generic function to query the OpenAI Chat Completions API.
 * @param {Array<object>} messages - The array of message objects for the chat.
 * @param {number} [max_tokens=150] - The maximum number of tokens to generate.
 * @returns {Promise<string>} The content of the response message.
 */
const queryChatModel = async (messages, max_tokens = 150) => {
  // --- Start of Debugging ---
  // Log the details of the request we are about to make.
  console.log('--- Preparing to call Azure OpenAI ---');
  console.log('Endpoint URL:', API_URL);
  console.log('API Version Param:', API_VERSION);
  console.log('API Key (last 5 chars):', `...${OPENAI_API_KEY.slice(-5)}`);
  // --- End of Debugging ---

  // Ensure max_tokens is a valid integer before sending to the API.
  const parsedMaxTokens = parseInt(max_tokens, 10);
  const finalMaxTokens = !isNaN(parsedMaxTokens) ? parsedMaxTokens : 150;

  try {
    const response = await axios.post(
      API_URL,
      // The 'model' parameter is not needed when using a specific Azure deployment URL.
      { messages, max_tokens: finalMaxTokens },
      {
        headers: {
          'Content-Type': 'application/json',
          // Azure OpenAI uses the 'api-key' header, not 'Authorization'.
          'api-key': OPENAI_API_KEY,
        },
        // The 'api-version' query parameter is mandatory for Azure OpenAI.
        params: {
          'api-version': API_VERSION,
        }
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    // Log the full error response for better debugging.
    console.error(`Error querying Azure OpenAI deployment ${DEPLOYMENT_NAME}:`, error.response?.data || error.message);
    if (error.response) console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    throw new Error(`OpenAI API call failed: ${error.response?.data?.error?.message || 'An unknown error occurred'}`);
  }
};

module.exports = { queryChatModel };
