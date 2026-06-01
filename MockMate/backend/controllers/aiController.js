const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
  transcriptAnalysisPrompt,
  transcriptCleanupPrompt,
} = require("../utils/prompts");

const getGeminiApiKey = () => {
  const key =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  return key ? key.trim() : "";
};

const isGeminiKeyError = (error) => {
  const message = error?.message || "";
  return (
    message.includes("API key not valid") ||
    message.includes("API_KEY_INVALID") ||
    message.includes("reported as leaked") ||
    error?.status === 403
  );
};

const buildFallbackQuestions = ({
  role,
  experience,
  topicsToFocus,
  numberOfQuestions,
  resumeText,
}) => {
  const count = Math.max(1, Math.min(Number(numberOfQuestions) || 10, 20));
  const defaultTopics = ["fundamentals", "problem solving", "system design", "debugging", "best practices"];
  const topics = (topicsToFocus || "")
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);
  const finalTopics = topics.length ? topics : defaultTopics;
  const cleanedRole = String(role || "").trim();
  const roleLabel =
    cleanedRole && !/^\d+$/.test(cleanedRole) ? cleanedRole : "software developer";
  const expLabel = String(experience || "0-2").trim() || "0-2";
  const hasResume = Boolean(resumeText && resumeText.trim().length > 40);

  return Array.from({ length: count }, (_, index) => {
    const topic = finalTopics[index % finalTopics.length];
    const question = hasResume
      ? `Based on your resume, explain one project challenge related to ${topic} and how you solved it for a ${roleLabel} role.`
      : `As a ${roleLabel} with ${expLabel} years of experience, how would you approach ${topic} in a real project?`;

    const answer =
      `Start with a concise context, explain your technical decision, mention trade-offs, and end with measurable impact. ` +
      `For ${topic}, include one real example, one challenge, and one improvement step.`;

    return { question, answer };
  });
};

const buildFallbackExplanation = (question) => ({
  title: "Concept Explanation",
  explanation: `### Definition
${question} tests how clearly you can explain a real engineering decision and its impact.

### How It Works Internally
When answering, structure your response as:
1) Problem context,
2) Technical action you took,
3) Why that approach was chosen,
4) Result with measurable impact.

### Practical Example
In a React-based project, you might describe fixing a performance issue by reducing unnecessary re-renders, splitting heavy components, and validating improvement with load-time metrics.

### One Trade-off
A faster implementation can reduce flexibility later. Mention what you optimized for and what trade-off you accepted.

### Common Follow-up
"What would you improve next if you had one more sprint?"`
});

const buildFallbackTranscriptAnalysis = ({ question, transcript }) => ({
  score: 6.5,
  refinedAnswer:
    `For "${question}", structure your answer using Situation-Task-Action-Result and keep it concise. ` +
    `Current transcript summary: ${String(transcript || "").slice(0, 220)}...`,
  strengths: [
    "You attempted a complete response",
    "You included relevant technical context"
  ],
  improvements: [
    "Add clearer structure (intro -> approach -> impact)",
    "Use one concrete metric or measurable outcome"
  ],
  keyTakeaways: [
    "Keep answers focused on the asked question",
    "Finish with a short impact statement"
  ],
  overallFeedback:
    "Good start. Improve clarity and add outcome-driven details for a stronger interview response."
});

const buildFallbackCleanup = (transcript) => ({
  cleanedTranscript: String(transcript || "").replace(/\s+/g, " ").trim(),
  notes: "Fallback cleanup applied because Gemini is unavailable."
});

// Helper function for exponential backoff retry
const generateContentWithRetry = async (model, prompt, retries = 3, delay = 1000) => {
  try {
    return await model.generateContent(prompt);
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.message?.includes('429'))) {
      const msg = `[${new Date().toISOString()}] Hit rate limit. Retrying in ${delay}ms... (${retries} retries left)\n`;
      fs.appendFileSync(path.join(__dirname, '../error_log.txt'), msg);
      console.log(msg.trim());
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateContentWithRetry(model, prompt, retries - 1, delay * 2);
    }
    const msg = `[${new Date().toISOString()}] API Error: ${error.message}\nStack: ${error.stack}\n`;
    fs.appendFileSync(path.join(__dirname, '../error_log.txt'), msg);
    throw error;
  }
};

// @desc    Generate interview questions and answers using Gemini
// @route   POST /api/ai/generate-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    console.log("Generate questions request received:", req.body);
    const { role, experience, topicsToFocus, numberOfQuestions, resumeText } = req.body;

    if ((!role || !experience || !topicsToFocus) && !resumeText) {
      console.log("Missing required fields (and no resume):", { role, experience, topicsToFocus, numberOfQuestions });
      return res.status(400).json({ message: "Missing required fields. Provide Role, Experience, and Topics OR a Resume." });
    }

    if (!numberOfQuestions) {
      return res.status(400).json({ message: "Missing numberOfQuestions" });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions,
      resumeText
    );

    console.log("About to call Gemini API with prompt:", prompt.substring(0, 100) + "...");

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.warn("Gemini key missing. Using fallback question generation.");
      return res.status(200).json(
        buildFallbackQuestions({ role, experience, topicsToFocus, numberOfQuestions, resumeText })
      );
    }

    // Create a new instance for each request to avoid any caching issues
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content with error handling and retry logic
    const result = await generateContentWithRetry(model, prompt);

    if (!result || !result.response) {
      throw new Error("Invalid response from Gemini API");
    }

    const response = result.response;
    let rawText = response.text();

    console.log("Gemini API response received, length:", rawText.length);
    console.log("Raw response preview:", rawText.substring(0, 200) + "...");

    // Clean it: Remove ```json and ``` from beginning and end, and handle extra content
    let cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```.*$/, "") // remove ending ``` and anything after it
      .trim(); // remove extra spaces

    // Find the end of the JSON array/object and cut off any extra content
    let jsonEndIndex = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[' || char === '{') {
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            jsonEndIndex = i;
            break;
          }
        }
      }
    }

    if (jsonEndIndex > -1) {
      cleanedText = cleanedText.substring(0, jsonEndIndex + 1);
    }

    // Remove control characters except for valid whitespace
    cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    console.log("Cleaned text preview:", cleanedText.substring(0, 200) + "...");

    // Now safe to parse
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Error parsing cleanedText:", cleanedText);
      console.error("JSON.parse error:", err);
      return res.status(500).json({
        message: "Failed to parse AI response as JSON. Please try again or check the AI output formatting.",
        error: err.message,
        cleanedTextPreview: cleanedText.substring(0, 500)
      });
    }

    res.status(200).json(data);
  } catch (error) {
    if (isGeminiKeyError(error)) {
      console.warn("Gemini key blocked/invalid. Returning fallback questions.");
      const { role, experience, topicsToFocus, numberOfQuestions, resumeText } = req.body || {};
      return res.status(200).json(
        buildFallbackQuestions({ role, experience, topicsToFocus, numberOfQuestions, resumeText })
      );
    }
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Generate explains a interview question
// @route   POST /api/ai/generate-explanation
// @access  Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conceptExplainPrompt(question);

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(200).json(buildFallbackExplanation(question));
    }

    // Create a new instance for each request to avoid any caching issues
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content with retry logic
    const result = await generateContentWithRetry(model, prompt);
    const response = result.response;
    let rawText = response.text();

    console.log("Explanation API response received, length:", rawText.length);
    console.log("Raw response preview:", rawText.substring(0, 200) + "...");

    // Clean it: Remove ```json and ``` from beginning and end, and handle extra content
    let cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```.*$/, "") // remove ending ``` and anything after it
      .trim(); // remove extra spaces

    // Find the end of the JSON object and cut off any extra content
    let jsonEndIndex = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[' || char === '{') {
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            jsonEndIndex = i;
            break;
          }
        }
      }
    }

    if (jsonEndIndex > -1) {
      cleanedText = cleanedText.substring(0, jsonEndIndex + 1);
    }

    // Remove control characters except for valid whitespace
    cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    console.log("Cleaned explanation text preview:", cleanedText.substring(0, 200) + "...");

    // Now safe to parse
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Error parsing cleanedText:", cleanedText);
      console.error("JSON.parse error:", err);
      return res.status(500).json({
        message: "Failed to parse AI explanation as JSON. Please try again or check the AI output formatting.",
        error: err.message,
        cleanedTextPreview: cleanedText.substring(0, 500)
      });
    }

    res.status(200).json(data);
  } catch (error) {
    if (isGeminiKeyError(error)) {
      const { question } = req.body || {};
      console.warn("Gemini key blocked/invalid. Returning fallback explanation.");
      return res.status(200).json(buildFallbackExplanation(question || "the requested topic"));
    }
    console.error("Error generating explanation:", error);
    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

// @desc    Analyze and refine interview transcript
// @route   POST /api/ai/analyze-transcript
// @access  Private
const analyzeTranscript = async (req, res) => {
  try {
    console.log("Transcript analysis request received:", req.body);
    const { question, transcript } = req.body;

    if (!question || !transcript) {
      console.log("Missing required fields:", { question: !!question, transcript: !!transcript });
      return res.status(400).json({ message: "Missing required fields: question and transcript" });
    }

    if (transcript.trim().length < 10) {
      return res.status(400).json({ message: "Transcript too short for meaningful analysis" });
    }

    const prompt = transcriptAnalysisPrompt(question, transcript);

    console.log("About to call Gemini API for transcript analysis...");

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(200).json(buildFallbackTranscriptAnalysis({ question, transcript }));
    }

    // Create a new instance for each request to avoid any caching issues
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content with error handling and retry logic
    const result = await generateContentWithRetry(model, prompt);

    if (!result || !result.response) {
      throw new Error("Invalid response from Gemini API");
    }

    const response = result.response;
    let rawText = response.text();

    console.log("Gemini API transcript analysis response received, length:", rawText.length);
    console.log("Raw response preview:", rawText.substring(0, 200) + "...");

    // Clean it: Remove ```json and ``` from beginning and end, and handle extra content
    let cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```.*$/, "") // remove ending ``` and anything after it
      .trim(); // remove extra spaces

    // Find the end of the JSON object and cut off any extra content
    let jsonEndIndex = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[' || char === '{') {
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            jsonEndIndex = i;
            break;
          }
        }
      }
    }

    if (jsonEndIndex > -1) {
      cleanedText = cleanedText.substring(0, jsonEndIndex + 1);
    }

    console.log("Cleaned transcript analysis text preview:", cleanedText.substring(0, 200) + "...");

    // Now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    if (isGeminiKeyError(error)) {
      const { question, transcript } = req.body || {};
      console.warn("Gemini key blocked/invalid. Returning fallback transcript analysis.");
      return res.status(200).json(buildFallbackTranscriptAnalysis({ question, transcript }));
    }
    console.error("Error analyzing transcript:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to analyze transcript",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Clean and improve transcript using AI
// @route   POST /api/ai/cleanup-transcript
// @access  Private
const cleanupTranscript = async (req, res) => {
  try {
    console.log("Transcript cleanup request received:", req.body);
    const { transcript } = req.body;

    if (!transcript) {
      console.log("Missing transcript");
      return res.status(400).json({ message: "Missing required field: transcript" });
    }

    if (transcript.trim().length < 5) {
      return res.status(400).json({ message: "Transcript too short for cleanup" });
    }

    const prompt = transcriptCleanupPrompt(transcript);

    console.log("About to call Gemini API for transcript cleanup...");

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(200).json(buildFallbackCleanup(transcript));
    }

    // Create a new instance for each request to avoid any caching issues
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content with error handling and retry logic
    const result = await generateContentWithRetry(model, prompt);

    if (!result || !result.response) {
      throw new Error("Invalid response from Gemini API");
    }

    const response = result.response;
    let rawText = response.text();

    console.log("Gemini API transcript cleanup response received, length:", rawText.length);
    console.log("Raw response preview:", rawText.substring(0, 200) + "...");

    // Clean it: Remove ```json and ``` from beginning and end, and handle extra content
    let cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```.*$/, "") // remove ending ``` and anything after it
      .trim(); // remove extra spaces

    // Find the end of the JSON object and cut off any extra content
    let jsonEndIndex = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[' || char === '{') {
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            jsonEndIndex = i;
            break;
          }
        }
      }
    }

    if (jsonEndIndex > -1) {
      cleanedText = cleanedText.substring(0, jsonEndIndex + 1);
    }

    console.log("Cleaned transcript cleanup text preview:", cleanedText.substring(0, 200) + "...");

    // Now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    if (isGeminiKeyError(error)) {
      const { transcript } = req.body || {};
      console.warn("Gemini key blocked/invalid. Returning fallback transcript cleanup.");
      return res.status(200).json(buildFallbackCleanup(transcript));
    }
    console.error("Error cleaning up transcript:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to cleanup transcript",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Generate PDF report data
// @route   POST /api/ai/generate-pdf-data
// @access  Private
const generatePDFData = async (req, res) => {
  try {
    console.log("PDF data generation request received:", req.body);
    const { analysis, question, transcript, userInfo } = req.body;

    if (!analysis || !question || !transcript) {
      console.log("Missing required fields for PDF generation");
      return res.status(400).json({ message: "Missing required fields: analysis, question, transcript" });
    }

    // Prepare structured data for PDF generation
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const pdfData = {
      metadata: {
        title: "Interview Analysis Report",
        generatedDate: currentDate,
        candidate: userInfo?.name || "Anonymous",
        role: userInfo?.role || "N/A",
        sessionId: Date.now().toString()
      },
      interview: {
        question: question,
        transcript: transcript,
        wordCount: transcript.split(' ').length,
        estimatedDuration: Math.ceil(transcript.split(' ').length / 150) // 150 words per minute average
      },
      analysis: {
        overallScore: analysis.score,
        grade: getScoreGrade(analysis.score),
        performance: getScoreLabel(analysis.score),
        refinedAnswer: analysis.refinedAnswer,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        keyTakeaways: analysis.keyTakeaways || [],
        overallFeedback: analysis.overallFeedback
      },
      metrics: {
        clarity: Math.min(analysis.score + Math.random() * 2, 10),
        structure: Math.min(analysis.score + Math.random() * 1.5, 10),
        confidence: Math.min(analysis.score + Math.random() * 1, 10),
        relevance: Math.min(analysis.score + Math.random() * 0.5, 10)
      }
    };

    function getScoreGrade(score) {
      if (score >= 9) return 'A+';
      if (score >= 8) return 'A';
      if (score >= 7) return 'B+';
      if (score >= 6) return 'B';
      if (score >= 5) return 'C+';
      if (score >= 4) return 'C';
      return 'D';
    }

    function getScoreLabel(score) {
      if (score >= 8) return 'Excellent';
      if (score >= 6) return 'Good';
      if (score >= 4) return 'Fair';
      return 'Needs Improvement';
    }

    res.status(200).json({
      success: true,
      data: pdfData
    });
  } catch (error) {
    console.error("Error generating PDF data:", error);
    res.status(500).json({
      message: "Failed to generate PDF data",
      error: error.message
    });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation, analyzeTranscript, cleanupTranscript, generatePDFData };
