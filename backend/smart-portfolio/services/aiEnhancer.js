const axios = require("axios");
const { getCached, setCache } = require("./cache");

const API_KEY = process.env.OPENAI_API_KEY;

function localEnhance(text) {
  return `Developed and executed: ${text}, delivering measurable project outcomes.`;
}

async function enhanceText(text) {
  // 1. CHECK CACHE
  const cached = getCached(text);
  if (cached) {
    console.log("Cache hit");
    return cached;
  }

  // 2. NO KEY → fallback
  if (!API_KEY) {
    return localEnhance(text);
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Rewrite this as a strong, professional resume bullet point using action verbs: ${text}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const output = response.data.choices[0].message.content;

    // 3. SAVE CACHE
    setCache(text, output);

    return output;

  } catch (err) {
    console.log("Fallback used");
    return localEnhance(text);
  }
}

module.exports = enhanceText;