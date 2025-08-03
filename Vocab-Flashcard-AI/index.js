// index.js — Backend server for Adrian's AI Vocab Quizzer

const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/ask", async (req, res) => {
  const { word, userInput } = req.body;

  const prompt = `
You are a vocabulary tutor. The target word is "${word}". The student guessed: "${userInput}".

Decide if the guess is correct, close-enough, or incorrect:
- If it's correct or close enough in meaning, respond like this:
  {"result":"Correct! '${word}' means: <short definition>.","correct":true}

- If it's incorrect, respond like this:
  {"result":"Hint: <give a subtle, vague clue>.","correct":false}

Return ONLY valid JSON. No explanation or extra text.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    });

    let content = completion.choices[0].message.content.trim();

    // Try to extract JSON object even if extra text is returned
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}") + 1;
    const jsonString = content.slice(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);

    res.json(parsed);
  } catch (err) {
    console.error("❌ Failed to parse or fetch from OpenAI:", err);
    res.json({
      result: "There was an issue understanding your guess. Please try again.",
      correct: false
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
