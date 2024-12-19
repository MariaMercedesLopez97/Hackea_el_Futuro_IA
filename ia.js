const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const apiAIKey = process.env.key;

// Configuración de OpenAI - Nueva sintaxis
const openai = new OpenAI({
    apiKey: apiAIKey,
});

// Endpoint para la interacción
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        
        res.json({ response: response.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Servidor ejecutándose en http://localhost:3000'));