import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Standard Operating Procedure (SOP) v1.3 - AI Investigative Strategy
 * 1. Reference PATE Data: Check if the product type exists in the known dataset.
 * 2. Multi-Pass Search: Identify primary manufacturers, then hunt for hidden co-packers.
 * 3. Geographic Clustering: Identify manufacturing hubs in North America.
 * 4. Verification: Apply confidence scores based on industrial capacity and inferred throughput.
 */

export interface PlantResult {
  id: string;
  parentCompany: string;
  companyName: string;
  productsMade: string;
  confidence: "High" | "Medium" | "Low";
  cityState: string;
  throughput: string;
  capacity: string;
  lat: number;
  lng: number;
}

// Global instance to handle model initialization once
let genAI: any = null;

function getGenAI() {
  if (!genAI && API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

export async function searchPlants(query: string): Promise<PlantResult[]> {
  const client = getGenAI();
  
  if (!client) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const modelName = "gemini-1.5-flash";
  console.log(`Initializing Gemini Search with model: ${modelName}`);
  console.log(`API Key starts with: ${API_KEY.substring(0, 4)}...`);
  
  const model = client.getGenerativeModel({ model: modelName });

  const prompt = `
  INVESTIGATION TASK: Identify all North American food manufacturing plants producing: "${query}"
  
  AR SOP v1.3 REQUIREMENTS:
  1. IDENTIFY: Primary brand manufacturers and enterprise-level parent companies.
  2. DISCOVER: Hidden co-packers or secondary facilities not immediately obvious.
  3. DATA FIELDS:
     - parentCompany: The ultimate corporate owner (e.g., Tyson, OSI Group).
     - companyName: The specific facility name and location.
     - productsMade: Broad categories (e.g., Protein, IQF, RTE, Bakery).
     - confidence: High (verified), Medium (inferred), Low (potential).
     - cityState: Format "City, State/Province".
     - throughput: Estimated lbs/hr based on industrial standards for this product.
     - capacity: Scale (e.g., Enterprise, Industrial - Tier 1, Specialized).
     - coordinates: Precise lat/lng for mapping.

  OUTPUT FORMAT: Return ONLY a raw JSON array of objects. No markdown, no explanations.
  
  EXAMPLE:
  [
    {
      "id": "1",
      "parentCompany": "OSI Group",
      "companyName": "OSI - Oakland Plant",
      "productsMade": "Protein, IQF, Beef",
      "confidence": "High",
      "cityState": "Oakland, IA",
      "throughput": "18,000 lbs/hr",
      "capacity": "Enterprise",
      "lat": 41.31,
      "lng": -95.39
    }
  ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting if AI includes it
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
}

export async function getCompanyHierarchy(company: string) {
  const client = getGenAI();
  if (!client) return null;

  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `MAP ENTERPRISE HIERARCHY FOR: "${company}"
  Identify Parent Company, Acquisitions, Business Units, and major Plants.
  Return as a clean structured list or tree description.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
