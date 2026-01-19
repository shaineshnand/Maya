import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body ?? {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Missing OPENAI_API_KEY in environment."
    });
  }

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages must be an array" });
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8
    });

    const reply = response.choices?.[0]?.message?.content ?? "";
    return res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: "Failed to generate response." });
  }
});

app.listen(port, () => {
  console.log(`Maya server running on http://localhost:${port}`);
});
