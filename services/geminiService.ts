import { UserProfile, VacancyMatch } from "../types";
import { realVacancyService } from "./realVacancyService";

/**
 * Fetch ONLY real vacancies from rabota.md
 * No AI generation, no mock data - only real jobs!
 */
export const generateSimulatedMatches = async (profile: UserProfile): Promise<VacancyMatch[]> => {
  try {
    console.log('🔍 Fetching REAL vacancies from rabota.md...');
    console.log(`Search: ${profile.role} in ${profile.location} (last ${profile.searchPeriodDays || 1} days)`);
    
    const realVacancies = await realVacancyService.fetchRealVacancies(profile);
    
    if (realVacancies && realVacancies.length > 0) {
      console.log(`✅ Found ${realVacancies.length} real vacancies!`);
      return realVacancies;
    } else {
      console.warn('⚠️ No vacancies found matching your criteria');
      console.log('Try:');
      console.log('  - Different search query');
      console.log('  - Longer search period (7 or 14 days)');
      console.log('  - Different location');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch real vacancies:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Make sure backend is running: cd backend && npm start');
    
    // Return empty array instead of fake data
    return [];
  }
};