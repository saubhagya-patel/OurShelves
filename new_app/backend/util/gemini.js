import { GoogleGenAI } from "@google/genai";

// Initialize the model
const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
const model = process.env.GEMINI_AI_MODEL;

/**
 * Generates a summary from a list of reviews.
 * @param {string[]} reviews - An array of review text.
 * @returns {Promise<string>} The AI-generated summary.
 */
export async function generateSummaryFromReviews(reviews) {
    const reviewText = reviews.join("\n");

    const prompt = `
    I will provide you with a list of user reviews for a book.
    Your task is to synthesize these opinions into a single, concise paragraph (3-4 sentences)
    that summarizes the overall sentiment. Do not use bullet points.
    
    Reviews:
    ---
    ${reviewText}
    ---
  `;

    try {
        const response = await genAI.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "Please act as a literary critic. Keep the reviews to the point.",
                thinkingConfig: {
                    thinkingBudget: 0,
                }
            }
        })
        const res = response.text;
        return res;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate AI summary.");
    }
}
