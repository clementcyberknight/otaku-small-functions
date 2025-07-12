const { GoogleGenerativeAI } = require("@google/generative-ai");
const functions = require("@google-cloud/functions-framework");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

functions.http("generateTitle", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { firstMessage } = req.body;
  if (!firstMessage) {
    return res
      .status(400)
      .json({ error: 'Missing "firstMessage" in request body.' });
  }

  const prompt = `
    Generate a concise, 2-5 word title for the following user conversation starter.
    Do not add any punctuation like quotes or periods to the title itself.
    The title should be suitable for a chat history list.
    make user it not generic like generate title, but specific to the content of the message like the token name or what the conversation is about.

    User Prompt: "Explain how AI works"
    Title: How AI Works

    User Prompt: "Write a python script that reverses a string and sorts a list"
    Title: Python Scripting Help

    User Prompt: "What are some good places to visit in Japan for a 2-week trip this summer?"
    Title: Japan Summer Trip

    User Prompt: "${firstMessage}"
    Title:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const title = response.text().trim();

    console.log(`Generated title: "${title}" for prompt: "${firstMessage}"`);

    res.status(200).json({ title: title });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate title from AI service." });
  }
});
