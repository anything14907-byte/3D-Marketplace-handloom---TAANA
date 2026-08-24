import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Helper for Anthropic Claude Haiku API
async function callClaudeHaiku(systemPrompt: string, userMessage: string): Promise<string> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (anthropicApiKey && anthropicApiKey !== "MY_ANTHROPIC_API_KEY" && anthropicApiKey.trim().length > 5) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicApiKey.trim(),
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content && Array.isArray(data.content) && data.content[0]?.text) {
          return data.content[0].text;
        }
      } else {
        const errText = await response.text();
        console.warn("Anthropic API returned non-OK status:", response.status, errText);
      }
    } catch (err) {
      console.warn("Anthropic API request failed, falling back to Gemini:", err);
    }
  }

  // Fallback to Gemini if ANTHROPIC_API_KEY is unset or encounters errors
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemPrompt}\n\nUser Request: ${userMessage}`,
      });
      if (response.text) {
        return response.text;
      }
    } catch (gErr) {
      console.warn("Gemini API fallback error:", gErr);
    }
  }

  // Graceful rule-based generation fallback if neither key is active in prototype preview
  return generateFallbackResponse(systemPrompt, userMessage);
}

function generateFallbackResponse(systemPrompt: string, userMessage: string): string {
  if (systemPrompt.includes("extract and structure") || userMessage.toLowerCase().includes("dictation")) {
    return JSON.stringify({
      name: "Handwoven Royal Tussar Silk Saree",
      weaver_name: "Master Weaver Devendra",
      region: "Bhagalpur, Bihar",
      material: "Pure Wild Tussar Silk & Natural Dyes",
      price: 9400,
      description: "Meticulously hand-loomed using ancient interlocked weft techniques, this exquisite weave breathes with organic texture and earthy elegance."
    });
  }
  if (systemPrompt.includes("product description") || userMessage.toLowerCase().includes("material")) {
    return "Hand-spun with generational mastery, this exquisite textile captures the authentic soul of traditional Indian pit-loom weaving. Every thread is intricately interlaced to produce a fluid drape, luminous texture, and enduring heirloom quality.";
  }
  return "Namaste! I am Taana Sutra, your companion for exploring the living heritage of Indian handlooms. From the intricate warp-and-weft (Taana-Baana) of Varanasi to the geometry of Pochampally Ikat, I am here to guide you on weaving traditions, GI certifications, and garment care.";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Static assets routing for public photos
  app.use('/images', express.static(path.join(process.cwd(), 'public/images')));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Download project ZIP endpoints
  app.get(["/api/download-zip", "/download/zip", "/taana-handloom-app.zip"], (req, res) => {
    const zipFilePath = path.join(process.cwd(), 'public', 'taana-handloom-app.zip');
    if (fs.existsSync(zipFilePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="taana-handloom-app.zip"');
      return res.sendFile(zipFilePath);
    }
    return res.status(404).json({ error: "Zip package not found. Please try again in a few seconds." });
  });

  // Download project TAR.GZ endpoint
  app.get(["/api/download-tar", "/download/tar", "/taana-handloom-app.tar.gz"], (req, res) => {
    const tarFilePath = path.join(process.cwd(), 'public', 'taana-handloom-app.tar.gz');
    if (fs.existsSync(tarFilePath)) {
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', 'attachment; filename="taana-handloom-app.tar.gz"');
      return res.sendFile(tarFilePath);
    }
    return res.status(404).json({ error: "Tarball package not found." });
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "MY_ANTHROPIC_API_KEY"),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
      timestamp: new Date().toISOString()
    });
  });

  // Feature 1: Generate description with Claude Haiku API
  app.post("/api/generate-description", async (req, res) => {
    try {
      const { name, material, region } = req.body;
      if (!name && !material && !region) {
        return res.status(400).json({ error: "Please provide product name, material, or region." });
      }

      const systemPrompt = `You are a master Indian textile curator and handloom storyteller for Taana, a platform celebrating authentic Indian weaves.
Write a vivid, culturally grounded, poetic yet precise 2-sentence product description for an authentic handloom item.
Focus on the weave texture, the rhythm of warp & weft (Taana-Baana), the artisan heritage, and sensory drape. Keep it strictly to 2 evocative sentences. Do not use generic buzzwords.`;

      const userMessage = `Product Name: ${name || "Indian Handloom Textile"}
Material: ${material || "Pure Natural Handloom"}
Region / Craft Center: ${region || "Traditional Weaving Cluster, India"}`;

      const description = await callClaudeHaiku(systemPrompt, userMessage);
      const cleanDesc = description.replace(/^["']|["']$/g, "").trim();

      res.json({ description: cleanDesc });
    } catch (err: any) {
      console.error("Error in /api/generate-description:", err);
      res.status(500).json({ error: err.message || "Failed to generate description" });
    }
  });

  // Feature 2: Voice Dictation parser with Claude Haiku API
  app.post("/api/parse-dictation", async (req, res) => {
    try {
      const { transcript, language } = req.body;
      if (!transcript || typeof transcript !== "string") {
        return res.status(400).json({ error: "Transcript is required." });
      }

      const systemPrompt = `You are an AI assistant helping artisanal Indian handloom weavers list their handcrafted products on the Taana marketplace.
The weaver spoke in ${language || "their native language"}.
Extract the product details from the weaver's spoken words and return a strict JSON object with these keys:
{
  "name": "Evocative, clear product title in English (e.g. Handwoven Chanderi Zari Saree, Pashmina Shawl, Sambalpuri Ikat Dupatta)",
  "weaver_name": "Name of the weaver or artisan if spoken, or empty string",
  "region": "Weaving town/region/state (e.g. Varanasi, Uttar Pradesh; Pochampally, Telangana; Chanderi, MP; Phulia, West Bengal)",
  "material": "Textile material (e.g. Mulberry Silk, Khadi Cotton, Tussar Silk, Pashmina Wool, Linen)",
  "price": number in INR rupees (digits only, e.g. 7500. If not mentioned, estimate a realistic fair-trade price between 3500 and 15000),
  "description": "Vivid 2-sentence description in English capturing the weave technique and beauty"
}
Output ONLY the raw JSON object. Do not include markdown code block backticks if possible.`;

      const rawResult = await callClaudeHaiku(systemPrompt, transcript);
      let parsed = null;

      try {
        const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(rawResult);
        }
      } catch (jsonErr) {
        console.warn("Could not parse Claude JSON response directly, creating formatted fallback:", rawResult);
        parsed = {
          name: "Handcrafted Indian Handloom Product",
          weaver_name: "",
          region: "India",
          material: "Handloom Cotton/Silk",
          price: 6500,
          description: rawResult.slice(0, 200)
        };
      }

      res.json({ data: parsed });
    } catch (err: any) {
      console.error("Error in /api/parse-dictation:", err);
      res.status(500).json({ error: err.message || "Failed to parse dictation" });
    }
  });

  // Feature 3: Floating Handloom AI Chatbot (Taana Sutra)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, productContext } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      let systemPrompt = `You are 'Taana Sutra' (ताना सूत्र), an expert Indian Handloom Textile Specialist and artisan champion on the Taana marketplace.
You have encyclopedic knowledge of:
- All Indian traditional weaving traditions (Banarasi, Kanjeevaram, Jamdani, Chanderi, Maheshwari, Pochampally Ikat, Patola, Sambalpuri, Paithani, Tussar, Muga Silk, Pashmina, Kota Doria, Baluchari, Kasavu, Kalamkari, Ajrakh, etc.).
- The difference between warp (Taana) and weft (Baana), pit looms, shuttle types, zari testing, GI tags, and handloom mark certifications.
- Garment drape, styling tips, storage (muslin cloth wrapping, cedar balls), washing (dry clean vs mild reetha soap).
- Fair-trade support for generational artisan families.`;

      if (productContext && productContext.name) {
        systemPrompt += `\n\nCURRENT PRODUCT CONTEXT (The user is viewing this specific textile):
- Name: ${productContext.name}
- Material: ${productContext.material}
- Region: ${productContext.region}
- Weaver: ${productContext.weaver_name || "Master Weaver"}
- Price: ₹${productContext.price}
- Details: ${productContext.description || "N/A"}
When relevant, reference these specific details to answer their questions about how it was made, how to style it, or why this weave is special.`;
      }

      let conversationContext = "";
      if (Array.isArray(history) && history.length > 0) {
        const recent = history.slice(-6);
        conversationContext = recent.map((h: any) => `${h.role === "user" ? "Buyer" : "Taana Sutra"}: ${h.content}`).join("\n");
      }

      const promptToSend = conversationContext 
        ? `Conversation History:\n${conversationContext}\n\nBuyer: ${message}`
        : message;

      const reply = await callClaudeHaiku(systemPrompt, promptToSend);
      res.json({ reply });
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      res.status(500).json({ error: err.message || "Failed to process chat message" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Taana Handloom server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Taana server:", err);
});
