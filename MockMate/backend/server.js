require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes')
const questionRoutes = require('./routes/questionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const coachMateRoutes = require('./routes/coachMateRoutes');
const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateConceptExplanation, analyzeTranscript, cleanupTranscript, generatePDFData } = require("./controllers/aiController");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://mockmateapp.vercel.app",
      "https://mockmate.vercel.app",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
      /\.onrender\.com$/,
      /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware to handle CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://mockmateapp.vercel.app",
      "https://mockmate.vercel.app",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
      /\.onrender\.com$/,
      /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

connectDB()

// Middleware
app.use(express.json()); // <-- This must be before your routes

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coach', coachMateRoutes);

app.post("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);
app.post("/api/ai/analyze-transcript", protect, analyzeTranscript);
app.post("/api/ai/cleanup-transcript", protect, cleanupTranscript);
app.post("/api/ai/generate-pdf-data", protect, generatePDFData);

// Health check endpoint for debugging
app.get("/api/health", (req, res) => {
  const runningPort = server.address()?.port;
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    mongoUri: process.env.MONGO_URI ? "SET" : "MISSING",
    port: runningPort || Number(process.env.BACKEND_PORT || process.env.PORT) || 5003
  });
});

// Test endpoint for AI setup
app.get("/test-ai", async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    res.json({
      status: "AI Setup OK",
      hasKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      modelName: "gemini-1.5-flash"
    });
  } catch (error) {
    res.status(500).json({
      status: "AI Setup Failed",
      error: error.message,
      stack: error.stack
    });
  }
});

// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Chat Events
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined chat room: ${data}`);
  });

  socket.on("send_message", (data) => {
    // Add socket.id as author if not present, or trust client?
    // Client sends author: "User" currently. We will fix client to send socket.id or handle it there.
    // For now, just relay.
    socket.to(data.room).emit("receive_message", data);
  });

  // WebRTC Video Events
  socket.on("join-room", ({ room }) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined video room: ${room}`);
    // Notify others that a user joined (triggers initiator)
    socket.to(room).emit("user-joined", socket.id);
  });

  socket.on("signal", (payload) => {
    // payload = { room, signal }
    const { room, signal } = payload;
    // If it's an offer, send as 'other-user' to the other peer
    // If it's an answer or candidate, send as 'signal'
    if (signal.type === 'offer') {
      socket.to(room).emit('other-user', { signal, id: socket.id });
    } else {
      socket.to(room).emit('signal', { signal, id: socket.id });
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Serve static files from the React app
const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.use((req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, "index.html"));
    } else {
      res.status(404).json({ message: "API route not found" });
    }
  });
}

// Start Server
const PREFERRED_PORT = Number(process.env.BACKEND_PORT || process.env.PORT) || 5003;
const MAX_PORT_ATTEMPTS = 20;
const BACKEND_PORT_FILE = path.resolve(__dirname, "../frontend/.backend-port");

const writeRuntimePort = (port) => {
  try {
    fs.writeFileSync(BACKEND_PORT_FILE, String(port), "utf8");
  } catch (error) {
    console.warn("Could not write runtime backend port file:", error.message);
  }
};

const startServerWithFallback = (port, attempt = 0) => {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Trying ${nextPort}...`);
      startServerWithFallback(nextPort, attempt + 1);
      return;
    }

    console.error("Failed to start server:", error);
    process.exit(1);
  });

  server.listen(port, "0.0.0.0", () => {
    writeRuntimePort(port);
    console.log(`Server running on port ${port}`);
  });
};

startServerWithFallback(PREFERRED_PORT);

module.exports = app;
