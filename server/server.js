const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/translator', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const translationSchema = new mongoose.Schema({
    q: String,
    source: String,
    target: String,
    translatedText: String,
});

const Translation = mongoose.model('Translation', translationSchema);

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
