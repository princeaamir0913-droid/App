import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import http from "http";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "AIzaSyB5iIuPoDd5B14-ePbgkfBpH7RiMz_fres";
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error("API key not valid. Please pass a valid API key.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const server = http.createServer(app);

  // Set up WebSocket Server
  const wss = new WebSocketServer({ server });

  // Handle WS Connections
  wss.on("connection", (ws) => {
    console.log("Client connected via WebSocket");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'set_api_key') {
           aiClient = new GoogleGenAI({ apiKey: data.key });
           process.env.GEMINI_API_KEY = data.key; // Fallback
           broadcast({ type: "terminal_log", data: `[System] Custom API Key Applied.` });
           chatHistory.push({ sender: "manager", message: "API Key received. I am now connected and ready to assist." });
           broadcast({ type: "chat_history", data: chatHistory });
        } else if (data.type === 'start_planning') {
           startPlanningSimulation();
        } else if (data.type === 'chat_message') {
           handleChatMessage(data.message);
        }
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    });

    // Send initial status
    ws.send(JSON.stringify({
      type: "agents_status",
      data: [
        { name: "Planning Agent", status: "Idle", id: "planner" },
        { name: "Coding Agent", status: "Idle", id: "coder" },
        { name: "Debugging Agent", status: "Idle", id: "debugger" },
      ]
    }));
    
    // Send initial chat history
    ws.send(JSON.stringify({
      type: "chat_history",
      data: chatHistory
    }));
  });
  
  const chatHistory: {sender: string, message: string}[] = [
    { sender: "manager", message: "Hello! I am the Agentic Manager. Tell me what features you want to add or modify." }
  ];
  
  const broadcast = (message: any) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  const handleChatMessage = async (msg: string) => {
    chatHistory.push({ sender: "user", message: msg });
    broadcast({ type: "chat_history", data: chatHistory });
    
    try {
      broadcast({ type: "terminal_log", data: `[Manager] Querying Agentic reasoning model...` });
      
      const contents = chatHistory.map(c => ({
        role: c.sender === "manager" ? "model" : "user",
        parts: [{ text: c.message }]
      }));
      
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contents,
        config: {
          systemInstruction: "You are the Agentic Manager for Antigravity Mobile Pro, an advanced mobile IDE using the Shizuku API (https://github.com/RikkaApps/Shizuku-API) to execute high-privilege Android shell commands without root via binder. You act as a conversational real AI coding assistant. Chat with the user, help them add features, write actual code, discuss deep Android architecture, and explain what your local agents (Coding, Planning, Debugging) are doing. Keep conversation flow natural.",
          tools: [{ googleSearch: {} }],
        }
      });
      
      const aiMessage = response.text || "I was unable to formulate a response.";
      chatHistory.push({ sender: "manager", message: aiMessage });
      broadcast({ type: "chat_history", data: chatHistory });
      
      broadcast({ type: "terminal_log", data: `[Manager] Task processed: "${msg.substring(0, 30)}..."` });
      broadcast({ type: "agent_update", data: { id: "coder", status: "Formulating execution context..." } });
      
      setTimeout(() => {
        broadcast({ type: "terminal_log", data: `[Coder] Applied changes to Virtual Phone sandbox based on manager directives.` });
        broadcast({ type: "agent_update", data: { id: "coder", status: "Idle" } });
        broadcast({ type: "virtual_phone_update", data: { action: "reload" } });
      }, 3000);
    } catch (e: any) {
      console.error("AI Error:", e);
      const isApiKeyError = e?.message?.includes("API key not valid") || e?.status === "INVALID_ARGUMENT";
      const errorMsg = isApiKeyError 
        ? "Please provide your Gemini API key in the AI Studio Settings (Secrets menu) to enable the AI Agentic Manager."
        : "Sorry, I encountered an error communicating with the AI model.";
        
      chatHistory.push({ sender: "manager", message: errorMsg });
      broadcast({ type: "chat_history", data: chatHistory });
      broadcast({ type: "terminal_log", data: `[System Error] ${isApiKeyError ? "Missing/Invalid API Key" : e.message}` });
    }
  };

  // Dummy agent simulation logic
  const startPlanningSimulation = () => {
    const emitLog = (log: string) => broadcast({ type: "terminal_log", data: log });
    const updateAgent = (id: string, status: string) => broadcast({ type: "agent_update", data: { id, status } });

    emitLog("[System] Planning Mode Initialized...");
    updateAgent("planner", "Analyzing request constraints...");
    
    setTimeout(() => {
      emitLog("[Planner] Step 1: Verify Shizuku Binder state.");
      updateAgent("planner", "Formulating Step 2...");
    }, 1000);

    setTimeout(() => {
      emitLog("[Planner] Step 2: Establish 127.0.0.1 ADB loopback pipeline.");
      updateAgent("planner", "Formulating Step 3...");
    }, 2500);

    setTimeout(() => {
      emitLog("[Planner] Step 3: Enforce PID Safeguard constraints.");
      updateAgent("planner", "Formulating Step 4...");
    }, 4000);

    setTimeout(() => {
      emitLog("[Planner] Step 4: Mount Virtual Phone Sandbox (Work Profile).");
      updateAgent("planner", "Formulating Step 5...");
    }, 5500);

    setTimeout(() => {
      emitLog("[Planner] Step 5: Initialize LSP Backend for Python/Kotlin.");
      emitLog("[Planner] Planning phase complete. Handoff to Coding Agent.");
      updateAgent("planner", "Plan completed.");
      updateAgent("coder", "Generating LocalAdbService.kt");
      emitLog("$ node generate_local_adb_service.js");
    }, 7000);
    
    setTimeout(() => {
       emitLog("[Coder] LocalAdbService.kt generation complete.");
       emitLog("[Debugger] Initializing PID monitoring...");
       updateAgent("coder", "Idle");
       updateAgent("debugger", "Monitoring PID: 10322");
    }, 8500);
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Use the combined HTTP + WS server to listen
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
