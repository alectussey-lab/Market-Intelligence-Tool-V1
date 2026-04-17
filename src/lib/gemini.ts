import { GoogleGenerativeAI } from "@google/generative-ai";
import pattyData from "../data/patty_data.json";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface CompanyRecord {
  id: string;
  parentCompany: string;
  companyName: string;
  productsMade: string;
  confidence: 'High' | 'Medium' | 'Low';
  cityState: string;
  throughput: string;
  capacity: string;
  lat: number;
  lng: number;
}

export interface HierarchyNode {
  name: string;
  type: 'parent' | 'unit' | 'acquisition' | 'segment' | 'cluster' | 'plant';
  details?: string;
  children?: HierarchyNode[];
  status?: 'Active' | 'Under Review' | 'Strategic';
}

const SYSTEM_PROMPT = `
You are an expert Corporate Investigator specializing in the North American food manufacturing industry.
Your goal is to identify facilities and manufacturers for a specific product type.

### INVESTIGATION STRATEGY (SOP v1.2)
1. **PATE Data Reference**: Start by checking the provided PATE reference data for known facilities making the product.
2. **Primary Manufacturers**: Identify major publicly known plants and parent companies for this product category.
3. **Hidden Intelligence (Deep Search)**: 
   - Identify "hidden" facilities: plants that operate under obscure business unit names or have been recently acquired.
   - Uncover Co-Packers: Identify major co-manufacturing facilities that likely produce this product for private labels or major brands.
   - Geographic Inference: If a major hub (e.g., Springdale, AR for poultry) is identified, look for secondary facilities in that cluster.
4. **Confidence Scoring**:
   - **High**: Facility is confirmed in PATE data or major industry registries.
   - **Medium**: Inferred from parent company business units or secondary research.
   - **Low**: Potential co-packer or "hidden" facility based on geographic hub location.

### OUTPUT FORMAT
Return a valid JSON array of objects following the CompanyRecord interface.
Each object must have: id, parentCompany, companyName, productsMade, confidence, cityState, throughput, capacity, lat, lng.
Ensure coordinates (lat, lng) are as accurate as possible for North America.

REFERENCE DATA (PATE):
${JSON.stringify(pattyData.slice(0, 100))} // Using a sample of PATE data to keep context window clean
`;

export async function searchPlants(query: string): Promise<CompanyRecord[]> {
  if (!API_KEY) {
    console.error("Gemini API Key is missing");
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  INVESTIGATION TASK: Identify all North American food manufacturing plants producing: "${query}"
  
  Please perform a multi-pass search to uncover both obvious manufacturers and hidden co-packers/shadow facilities.
  
  Return ONLY the JSON array.
  `;

  try {
    const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON if AI wrapped it in markdown
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
}

export async function getCompanyHierarchy(companyName: string): Promise<HierarchyNode> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const HIERARCHY_PROMPT = `
  You are an expert in Corporate Intelligence.
  Build a complete TOP-DOWN hierarchical map for the company: "${companyName}"
  
  The hierarchy must follow this EXACT structure:
  1. Root (parent company)
  2. Business Units (Major divisions)
  3. Acquisitions/Segments (Sub-units or major acquired brands)
  4. Regional Clusters (Geographic groupings of plants)
  5. Processing Plants (Individual facility names and locations)

  Return a valid JSON object following the HierarchyNode interface:
  {
    "name": string,
    "type": "parent" | "unit" | "acquisition" | "segment" | "cluster" | "plant",
    "details": string,
    "status": "Active" | "Under Review" | "Strategic",
    "children": HierarchyNode[]
  }

  Ensure the output is deep and comprehensive (at least 3-4 business units, each with multiple clusters and plants).
  Return ONLY the JSON object.
  `;

  try {
    const result = await model.generateContent(HIERARCHY_PROMPT);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Hierarchy Search Error:", error);
    throw error;
  }
}
