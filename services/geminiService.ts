import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, VacancyMatch, ExperienceLevel, WorkplaceType } from "../types";

// Helper to simulate "parsing" and "matching" via AI
export const generateSimulatedMatches = async (profile: UserProfile): Promise<VacancyMatch[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided, returning mock data");
    return generateMockMatches();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Generate 4 realistic job vacancy matches for the following user profile.
      The user is a ${profile.experienceLevel} ${profile.role} located in ${profile.location}.
      Skills: ${profile.skills.join(', ')}.
      Min Salary: ${profile.minSalary} MDL (Moldovan Leu).
      Preferred Workplace: ${profile.preferredWorkplace.join('/')}.
      
      For each vacancy:
      1. Ensure the salary is in MDL or converted to MDL if typically posted in USD/EUR (approx 1 USD = 18 MDL, 1 EUR = 19.5 MDL).
      2. Calculate a realistic match score (0-100).
      3. Include a mix of perfect matches and slightly lower matches.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              vacancy: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  description: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  experienceLevel: { type: Type.STRING, enum: Object.values(ExperienceLevel) },
                  location: { type: Type.STRING },
                  salaryMin: { type: Type.NUMBER },
                  salaryMax: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                  workplace: { type: Type.STRING, enum: Object.values(WorkplaceType) },
                  postedAt: { type: Type.STRING },
                }
              },
              matchScore: { type: Type.NUMBER },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  skillsMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  locationMatch: { type: Type.BOOLEAN },
                  salaryMatch: { type: Type.BOOLEAN },
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as VacancyMatch[];
    }
    return generateMockMatches();
  } catch (error) {
    console.error("Gemini Match Error:", error);
    return generateMockMatches();
  }
};

// Fallback mock data with MDL salaries
const generateMockMatches = (): VacancyMatch[] => {
  return [
    {
      vacancy: {
        id: "1",
        title: "Senior Frontend Developer",
        company: "TechFlow Solutions",
        description: "We are looking for a passionate React developer to lead our dashboard team.",
        skills: ["React", "TypeScript", "Tailwind"],
        experienceLevel: ExperienceLevel.SENIOR,
        location: "Chisinau",
        salaryMin: 45000,
        salaryMax: 65000,
        currency: "MDL",
        workplace: WorkplaceType.HYBRID,
        postedAt: new Date().toISOString()
      },
      matchScore: 92,
      breakdown: {
        skillsMatch: ["React", "TypeScript"],
        missingSkills: [],
        locationMatch: true,
        salaryMatch: true
      }
    },
    {
      vacancy: {
        id: "2",
        title: "Full Stack Engineer",
        company: "Global Systems",
        description: "Join our international team building scalable cloud architecture.",
        skills: ["Node.js", "React", "PostgreSQL", "AWS"],
        experienceLevel: ExperienceLevel.MIDDLE,
        location: "Remote",
        salaryMin: 55000,
        salaryMax: 75000,
        currency: "MDL",
        workplace: WorkplaceType.REMOTE,
        postedAt: new Date(Date.now() - 86400000).toISOString()
      },
      matchScore: 78,
      breakdown: {
        skillsMatch: ["React", "Node.js"],
        missingSkills: ["AWS"],
        locationMatch: true,
        salaryMatch: true
      }
    }
  ];
};