// api/chat.js - This runs on Vercel's servers, hidden from users.

export default async function handler(req, res) {
    // 1. Get the API key from Vercel Environment Variables
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured" });
    }

    // 2. Forward the request from your frontend to Groq
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        // 3. Send the answer back to your frontend
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from Groq" });
    }
}