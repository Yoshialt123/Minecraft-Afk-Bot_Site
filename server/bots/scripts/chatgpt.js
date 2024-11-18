const fetch = require('node-fetch');

const CHATGPT_API_KEY = 'your-api-key-here'; // Replace with your OpenAI API key

/**
 * Fetch response from ChatGPT API for a given query.
 * @param {string} query - The user query.
 * @returns {Promise<string>} - The response from ChatGPT.
 */
async function fetchChatGPTResponse(query) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CHATGPT_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: query }],
            }),
        });

        if (!response.ok) {
            throw new Error(`ChatGPT API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error.message);
        return 'Sorry, I encountered an error while processing your request.';
    }
}

module.exports = { fetchChatGPTResponse };
