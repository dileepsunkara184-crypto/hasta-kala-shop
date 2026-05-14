import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getBusinessSuggestions(salesHistory: any[], products: any[]) {
  const prompt = `
    As a business consultant for "Hasta-Kala Shop", an artisan marketplace, analyze the following sales data and products.
    Provide 3 concise, actionable suggestions for the vendor.
    Include trending items, production advice, and inventory tips.
    
    Products: ${JSON.stringify(products)}
    Sales History (Recent): ${JSON.stringify(salesHistory.slice(0, 20))}
    
    Format the response as a JSON array of objects with 'text' and 'type' (info, trending, warning).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [
      { text: "Keep tracking your sales to get AI insights.", type: "info" }
    ];
  }
}

export async function chatWithAssistant(history: { role: string, content: string }[], message: string) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are the Hasta-Kala Assistant. Help artisans manage their shop, track sales, and give business advice. Be polite and helpful."
    }
  });

  try {
    const result = await chat.sendMessage({
      message: message
    });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm sorry, I'm having trouble connecting right now.";
  }
}
