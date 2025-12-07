import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function chatWithGemini(
  message: string,
  history: { role: "user" | "model"; parts: [{ text: string }] }[],
  userProfile?: any
) {
  if (!apiKey) {
    console.error("Gemini API Key missing. Please set VITE_GEMINI_API_KEY in .env");
    return "I apologize, but I am currently offline (API Key missing). Please check your configuration.";
  }

  try {
    const systemInstruction = `
    You are an advanced AI Loan Assistant for "Project Orion".
    Your goal is to help users apply for loans (Personal, Home, Business).
    
    Current User Profile:
    ${JSON.stringify(userProfile || {}, null, 2)}
    
    Guidelines:
    1. Be professional, empathetic, and concise.
    2. If the user is logged in, use their name and financial data.
    3. Guide them through: Greeting -> Needs Assessment -> Loan Offer -> KYC -> Underwriting -> Sanction.
    4. Since you are running in "Client-Side Fallback Mode", you cannot perform real database actions (KYC, CRM lookup), but you should SIMULATE them to demonstrate the workflow.
    5. Always output clean text.
    `;

    // Construct history with system prompt injected at the start
    // Gemini API doesn't have a separate "system" role in history for the JS SDK in the same way as the REST API sometimes.
    // We will prepend it to the first user message or use a setup turn.
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am the Project Orion Loan Assistant running in client-side mode. I will simulate the loan workflow." }],
        },
        ...history
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Client Error:", error);
    return "I'm having trouble connecting to the AI service right now. Please try again later.";
  }
}
