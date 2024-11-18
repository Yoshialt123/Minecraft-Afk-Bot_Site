import fetch from 'node-fetch'; // Ensure this is installed and imported

const API_KEY = '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'; // Replace with your OpenAI API key
const API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Function to send a message to OpenAI's ChatGPT and get a reply.
 * @param {string} userMessage - The user's message.
 * @returns {Promise<string>} - The response from ChatGPT.
 */
export async function chatWithGPT(userMessage) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Specify the GPT model
                messages: [{ role: 'user', content: userMessage }],
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error in chatWithGPT:', error.message);
        return 'Sorry, I could not process your request. Please try again later.';
    }
}
