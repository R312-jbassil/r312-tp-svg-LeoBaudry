// src/pages/api/generateSVG.js
import { OpenAI } from "openai";

const OR_TOKEN = import.meta.env.OR_TOKEN; // Ta clé OpenRouter
const OR_URL   = "https://openrouter.ai/api/v1"; // Base URL OpenRouter

export const POST = async ({ request }) => {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Aucun message fourni" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new OpenAI({
      baseURL: OR_URL,
      apiKey: OR_TOKEN,
    });

    // Message système pour guider le modèle
    const systemMessage = {
      role: "system",
      content:
        "You are an SVG code generator. Generate SVG code for the following messages. Include unique ids for each part of the SVG.",
    };

    // Appel à l’API OpenRouter
    const chatCompletion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [systemMessage, ...messages],
      extra_headers: {
        "HTTP-Referer": "http://localhost:4321", // optionnel, ton site
        "X-Title": "SVG Generator",              // optionnel
      },
    });

    const messageContent =
      chatCompletion.choices?.[0]?.message?.content || "";

    // Extraction du SVG
    const svgMatch = messageContent.match(/<svg[\s\S]*?<\/svg>/i);
    const svgCode = svgMatch ? svgMatch[0] : messageContent;

    return new Response(JSON.stringify({ svg: svgCode }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur API SVG:", err);
    return new Response(JSON.stringify({ error: "Erreur API SVG" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
