const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;


const sanitize = (text) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").slice(0, 500) : "";

const isMedicineIntent = (text) => {
  const t = text.toLowerCase();

  const patterns = [
    /what.*(take|use).*(fever|pain|cold)/,
    /(which|what).*(medicine|tablet|drug)/,
    /(dosage|dose|mg|how many)/,
    /(paracetamol|ibuprofen|antibiotic)/,
    /(can i take|should i take)/,
    /(best medicine|suggest.*medicine)/,
    /(fever.*what.*take)/,
    /(pain.*what.*take)/,
    /(cold.*what.*take)/,
  ];

  return patterns.some((p) => p.test(t));
};

const isPromptAttack = (text) => {
  const t = text.toLowerCase();

  return (
    t.includes("ignore previous instructions") ||
    t.includes("forget rules") ||
    t.includes("act as doctor") ||
    t.includes("override") ||
    t.includes("you are now") ||
    t.includes("give exact dosage")
  );
};

exports.chatWithAI = async (req, res) => {
  try {
    const message = sanitize(req.body.message);
    const route = sanitize(req.body.route);

    
    if (!message) {
      return res.status(400).json({ message: "Invalid input" });
    }
    
    if (isMedicineIntent(message)) {
      return res.json({
        reply:
          "I can't recommend medicines or dosages. You can try rest, fluids, and light food. If symptoms persist, please consult a doctor.",
      });
    }
    
    if (isPromptAttack(message)) {
      return res.json({
        reply:
          "I'm here to provide safe health guidance only. I can't follow that request.",
      });
    }

    const forbiddenPatterns = [
      "medicine",
      "medicines",
      "medication",
      "tablet",
      "tablets",
      "drug",
      "drugs",
      "dosage",
      "paracetamol",
      "ibuprofen",
      "antibiotic",
      "pill",
      "capsule",
      "which medicine",
      "what should i take",
      "what drug",
      "suggest medicine",
      "konsi dawa",
      "konsi dawai",
      "kaunsi dawa",
      "kaunsi dawai",
      "konsi tablet",
      "kaunsi tablet",
    ];

    const lower = message.toLowerCase();

    if (forbiddenPatterns.some((word) => lower.includes(word))) {
      return res.json({
        reply: "I can't recommend medicines or drugs. Please consult a doctor.",
      });
    }

    // Validate API key
    if (!GROQ_API_KEY) {
      console.error("GROQ API KEY MISSING");
      return res.status(500).json({ message: "AI key missing" });
    }

    let response;

    try {
      response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `
You are Dr. DuffyAI, a professional and safe health assistant.

--------------------------------
🚨 LANGUAGE ENFORCEMENT (STRICT)
--------------------------------
- You MUST respond in English ONLY.
- NEVER use Hindi, Hinglish, or any other language.
- NEVER mix languages.
- If the user writes in Hindi or any non-English language:
  → respond ONLY with:
  "I'm currently responding in English only. Please ask your question in English."

Breaking this rule is NOT allowed.

--------------------------------
🚫 STRICT MEDICAL SAFETY
--------------------------------
- NEVER recommend medicines, tablets, or drugs
- NEVER suggest dosages
- If user asks for medicine → refuse politely

Example:
"I can't recommend medicines, but I can suggest some safe home care."

--------------------------------
✅ WHAT YOU CAN DO
--------------------------------
- Give general health advice
- Suggest SAFE home remedies:
  - rest
  - hydration
  - warm fluids
  - light diet

--------------------------------
⚠️ SERIOUS CONDITION RULE
--------------------------------
If symptoms seem serious:
→ "Please consult a doctor."

--------------------------------
🚫 NON-MEDICAL QUESTIONS
--------------------------------
If question is not health-related:
→ "I'm here to help with health-related questions 😊"

--------------------------------
💬 STYLE
--------------------------------
- Short (3–5 lines)
- Clear, simple English
- No jargon
- No nonsense

--------------------------------
🎯 GOAL
--------------------------------
Be helpful, safe, and human-like — while strictly following rules.
`,
            },
            {
              role: "user",
              content: `Context: ${route}\n\nUser: ${message}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        },
      );
    } catch (err) {
      console.error("===== GROQ ERROR =====");
      console.error("STATUS:", err.response?.status);
      console.error("DATA:", err.response?.data);
      console.error("MESSAGE:", err.message);
      console.error("======================");

      return res.json({
        reply: "AI service is temporarily unavailable. Please try again.",
      });
    }

    const reply =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      "I'm not confident enough to answer that safely.";
    const unsafeWords = [
      "paracetamol",
      "ibuprofen",
      "mg",
      "dosage",
      "take 1",
      "take two",
      "tablet",
      "capsule",
    ];

    const lowerReply = reply.toLowerCase();

    if (unsafeWords.some((w) => lowerReply.includes(w))) {
      reply =
        "I can't recommend medicines or dosages. Please consult a doctor for proper treatment.";
    }

    return res.json({ reply });
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return res.status(500).json({ message: "AI service failed" });
  }
};


exports.listModels = async (req, res) => {
  return res.json({
    message: "Using Groq (no model listing endpoint needed)",
    model: "llama-3.1-8b-instant",
  });
};
