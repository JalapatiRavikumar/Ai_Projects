const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const testGemini = async () => {
  try {
    console.log('Testing Gemini API...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you working?");
    console.log('Gemini Response:', result.response.text());
    process.exit(0);
  } catch (error) {
    console.error('Gemini API Failed:', error.message);
    process.exit(1);
  }
};

testGemini();
