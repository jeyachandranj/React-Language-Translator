const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: "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" });
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://jeyachandranj:jj.jeyan@cluster0.pe8ib.mongodb.net/translate', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const translationSchema = new mongoose.Schema({
    q: String,
    source: String,
    target: String,
    translatedText: String,
});

const Translation = mongoose.model('Translation', translationSchema);

app.post('/api/translate', async (req, res) => {
    const { q, source, target } = req.body;
    
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Translate the following text and only output is translate word not making sentence responce only target language and only for q word not making sentence from ${source} to ${target}: "${q}"`,
                },
            ],
            model: "llama3-8b-8192", // Replace with appropriate model
        });

        const translatedText = chatCompletion.choices[0]?.message?.content || "";
        res.json({ translatedText });

    } catch (err) {
        console.error("Error during translation:", err);
        res.status(500).json({ error: "Translation failed." });
    }
});

app.post('/api/save-translation', async (req, res) => {
    const { q, source, target, translatedText } = req.body;
    try {
        const newTranslation = new Translation({ q, source, target, translatedText });
        await newTranslation.save();
        res.status(200).json({ message: "Translation saved successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.get('/api/history', async (req, res) => {
    try {
        const translations = await Translation.find().sort({ _id: -1 }).limit(10);
        res.status(200).json(translations);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
