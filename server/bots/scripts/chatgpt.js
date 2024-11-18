const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const OPENAI_API_KEY = 'your-chatgpt-api-key'; // Replace with your actual API key

async function chatWithGPT(message) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            console.error(`OpenAI API Error: ${response.status} ${response.statusText}`);
            return 'Sorry, I couldn\'t process your request right now. Please try again later.';
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'I didn\'t understand that. Can you rephrase?';
    } catch (error) {
        console.error('Error communicating with OpenAI API:', error);
        return 'An error occurred while trying to communicate with the AI. Please try again later.';
    }
}

module.exports = { chatWithGPT };
