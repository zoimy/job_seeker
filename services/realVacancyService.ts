import { UserProfile, VacancyMatch, ExperienceLevel, WorkplaceType, WorkSchedule, EducationLevel } from '../types';
import { getUserId } from './storageService';

/**
 * Service for fetching real vacancies from backend scraper
 */
export class RealVacancyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  }

  /**
   * Fetch real vacancies from rabota.md via backend
   */
  async fetchRealVacancies(profile: UserProfile): Promise<VacancyMatch[]> {
    try {
      // Optimize query: remove "Developer", "Junior", "Senior", etc. to get broader results
      // e.g. "Junior Frontend Developer" -> "Frontend"
      // e.g. "Internship Front-End" -> matches "Frontend" better than "Frontend Developer"
      const cleanQuery = this.optimizeSearchQuery(profile.role);
      
      console.log(`Searching for sanitized query: "${cleanQuery}" (orig: "${profile.role}")`);

      const response = await fetch(`${this.baseUrl}/api/scrape/rabota-md`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId(),
        },
        body: JSON.stringify({
          query: cleanQuery,
          location: (profile.location || 'chisinau').toLowerCase(),
          searchPeriodDays: profile.searchPeriodDays || 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Scraping failed');
      }

      console.log(`Fetched ${data.count} real vacancies from rabota.md`);

      // Transform scraped data to VacancyMatch format
      return this.transformToMatches(data.vacancies, profile);

    } catch (error) {
      console.error('Error fetching real vacancies:', error);
      throw error;
    }
  }

  /**
   * Transform scraped vacancies to VacancyMatch format
   */
  private transformToMatches(vacancies: any[], profile: UserProfile): VacancyMatch[] {
    return vacancies.map((vacancy: any) => {
      // 1. Enrich vacancy with detected fields first
      const enrichedVacancy = {
        ...vacancy,
        skills: this.extractSkills(vacancy.description, profile.skills),
        experienceLevel: this.detectExperienceLevel(vacancy.title, vacancy.description),
        workplace: this.detectWorkplaceType(vacancy.description),
        schedule: this.detectWorkSchedule(vacancy.description),
        education: this.detectEducation(vacancy.description),
        minYearsExperience: this.detectMinYearsExperience(vacancy.description)
      };

      // 2. Calculate comprehensive match score
      const matchScore = this.calculateAdvancedMatchScore(enrichedVacancy, profile);
      
      // 3. Determine matched and missing skills for UI
      const userSkills = profile.skills || [];
      const vacancySkills = enrichedVacancy.skills || [];

      const skillsMatch = userSkills.filter(skill => 
        vacancySkills.some((vs: string) => vs.toLowerCase().includes(skill.toLowerCase()))
      );
      const missingSkills = vacancySkills.filter((vs: string) => 
        !userSkills.some(ps => vs.toLowerCase().includes(ps.toLowerCase()))
      );

      // 4. Determine Salary Match status
      const salaryMatch = vacancy.salary?.min 
        ? vacancy.salary.min >= profile.minSalary 
        : vacancy.salary?.max 
          ? vacancy.salary.max >= profile.minSalary 
          : true; // Neutral if no salary

      return {
        vacancy: {
          id: vacancy.id,
          title: vacancy.title,
          company: vacancy.company,
          description: vacancy.description,
          skills: enrichedVacancy.skills,
          experienceLevel: enrichedVacancy.experienceLevel,
          location: vacancy.location || profile.location,
          salaryMin: vacancy.salary?.min,
          salaryMax: vacancy.salary?.max,
          currency: vacancy.salary?.currency || 'MDL',
          workplace: enrichedVacancy.workplace,
          schedule: enrichedVacancy.schedule,
          education: enrichedVacancy.education,
          minYearsExperience: enrichedVacancy.minYearsExperience,
          postedAt: vacancy.postedAt,
          url: vacancy.url
        },
        matchScore,
        breakdown: {
          skillsMatch,
          missingSkills: missingSkills.slice(0, 3), // Limit to 3
          locationMatch: vacancy.location?.toLowerCase().includes(profile.location.toLowerCase()) ?? true,
          salaryMatch: salaryMatch
        }
      };
    });
  }

  // ==========================================
  // 🧠 ADVANCED MATCHING ALGORITHM
  // ==========================================

  private calculateAdvancedMatchScore(vacancy: any, profile: UserProfile): number {
    const skillsScore = this.calculateSkillsScore(profile.skills, vacancy.skills, vacancy.description);
    const roleScore = this.calculateRoleScore(profile.role, vacancy.title, vacancy.description);
    const salaryScore = this.calculateSalaryScore(profile.minSalary, vacancy.salary?.min, vacancy.salary?.max);
    const experienceScore = this.calculateExperienceScore(profile.experienceLevel, vacancy.experienceLevel, profile.yearsOfExperience, vacancy.minYearsExperience);
    const locationScore = this.calculateLocationScore(profile.location, vacancy.location, vacancy.workplace, profile.preferredWorkplace);
    const scheduleScore = this.calculateScheduleScore(profile.preferredSchedule, vacancy.schedule);
    
    // NEW Weighted Sum (Total 100)
    // Skills: 45% (increased from 35%)
    // Role: 25% (increased from 15%)
    // Experience: 12%
    // Salary: 10% (decreased from 15%)
    // Location: 5% (decreased from 10%)
    // Schedule: 3% (decreased from 10%)
    
    const totalScore = Math.round(
      (skillsScore * 1.125) +     // 45/40 = 1.125
      (roleScore * 1.25) +        // 25/20 = 1.25
      (experienceScore * 1.2) +   // 12/10 = 1.2
      (salaryScore * 0.667) +     // 10/15 = 0.667
      (locationScore * 0.5) +     // 5/10 = 0.5
      (scheduleScore * 0.3)       // 3/10 = 0.3
    );

    // DEALBREAKER: Role Mismatch - if role score is very low, heavily penalize
    if (roleScore < 5) {
      return Math.round(totalScore * 0.3); // Reduce by 70% if role doesn't match at all
    }

    // DEALBREAKER: Experience Mismatch
    if (experienceScore === 0) {
      return Math.round(totalScore * 0.5); // Reduce by 50%
    }
    
    // DEALBREAKER: Workplace Mismatch (e.g. Remote vs Office) - less harsh
    if (locationScore === 0 && profile.preferredWorkplace.length > 0) {
       return Math.round(totalScore * 0.7); // Reduce by 30%
    }

    return Math.min(100, Math.max(0, totalScore));
  }

  // 1. Skills Match (Max 40 -> adjusted to 45 in total)
  private calculateSkillsScore(userSkills: string[], vacancySkills: string[], description: string): number {
    const maxScore = 40;
    if (!userSkills || userSkills.length === 0) return 0;
    if (!vacancySkills || vacancySkills.length === 0) return maxScore * 0.3;

    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
    const normalizedVacancySkills = vacancySkills.map(s => s.toLowerCase().trim());
    const descLower = description.toLowerCase();

    // Count how many USER skills are found in vacancy (more important!)
    const userSkillsFound = normalizedUserSkills.filter(us => 
      normalizedVacancySkills.some(vs => vs.includes(us) || us.includes(vs)) ||
      descLower.includes(us)
    );

    // Calculate base score from user skills coverage
    const userSkillsCoverage = userSkillsFound.length / userSkills.length;
    let score = userSkillsCoverage * maxScore;

    // Bonus: if vacancy has many matching skills, add small bonus
    const vacancySkillsMatched = normalizedVacancySkills.filter(vs => 
      normalizedUserSkills.some(us => us.includes(vs) || vs.includes(us))
    );
    if (vacancySkillsMatched.length >= 3) score += 5;
    if (vacancySkillsMatched.length >= 5) score += 5;

    return Math.min(maxScore, score);
  }

  // 2. Role Match (Max 20 -> adjusted to 25 in total)
  private calculateRoleScore(userRole: string, vacancyTitle: string, description: string): number {
    const maxScore = 20;
    
    // Safety check for userRole
    if (!userRole) return 0;

    const uRole = userRole.toLowerCase().trim();
    const vTitle = vacancyTitle.toLowerCase().trim();
    const descLower = description.toLowerCase();

    // Exact match in title
    if (vTitle.includes(uRole)) return maxScore;

    // Role synonyms for better matching
    const roleSynonyms: { [key: string]: string[] } = {
      'developer': ['engineer', 'programmer', 'dev', 'software engineer', 'разработчик'],
      'engineer': ['developer', 'programmer', 'dev', 'software engineer', 'инженер'],
      'frontend': ['front-end', 'front end', 'ui developer', 'фронтенд'],
      'backend': ['back-end', 'back end', 'server', 'бэкенд'],
      'fullstack': ['full-stack', 'full stack', 'фулстек'],
      'data scientist': ['data science', 'ml engineer', 'machine learning'],
      'devops': ['sre', 'infrastructure', 'platform engineer'],
      'python': ['python developer', 'python engineer'],
      'java': ['java developer', 'java engineer'],
      'javascript': ['js', 'frontend', 'node'],
    };

    // Check synonyms
    for (const [key, synonyms] of Object.entries(roleSynonyms)) {
      if (uRole.includes(key)) {
        for (const syn of synonyms) {
          if (vTitle.includes(syn)) return maxScore * 0.9;
          if (descLower.includes(syn)) return maxScore * 0.7;
        }
      }
    }

    // Keyword matching
    const uKeywords = uRole.split(/[\s-]+/).filter(w => w.length > 2);
    const vKeywords = vTitle.split(/[\s-]+/).filter(w => w.length > 2);
    const matched = uKeywords.filter(k => vKeywords.some(vk => vk.includes(k) || k.includes(vk)));
    
    if (matched.length > 0) {
      const keywordScore = (matched.length / uKeywords.length) * maxScore;
      return keywordScore;
    }

    // Last resort: check if any user role keyword appears in description
    const descMatched = uKeywords.filter(k => descLower.includes(k));
    if (descMatched.length > 0) {
      return (descMatched.length / uKeywords.length) * maxScore * 0.4;
    }

    return 0;
  }

  // 3. Salary Match (Max 15)
  private calculateSalaryScore(userMin: number, vacMin?: number, vacMax?: number): number {
    const maxScore = 15;
    if (!vacMin && !vacMax) return maxScore * 0.6;

    const min = vacMin || (vacMax ? vacMax * 0.7 : 0);
    const max = vacMax || (vacMin ? vacMin * 1.3 : min * 1.5);

    if (userMin <= min) return maxScore;
    if (userMin <= max) return maxScore * 0.8;

    const deficit = (userMin - max) / userMin;
    if (deficit < 0.1) return maxScore * 0.5;
    if (deficit < 0.2) return maxScore * 0.3;

    return 0;
  }

  // 4. Experience Match (Max 10 -> adjusted to 15 in total)
  private calculateExperienceScore(userLevel: string, vacancyLevel: string, userYears: number, vacMinYears?: number): number {
    const maxScore = 15;
    
    // Safety check for userLevel
    if (!userLevel) return maxScore * 0.5; // Default neutral score if unknown
    
    // Check years first if available (hard constraint)
    if (vacMinYears && userYears > 0) {
      if (userYears >= vacMinYears) return maxScore;
      if (userYears >= vacMinYears - 1) return maxScore * 0.5;
      return 0;
    }

    // Fallback to level logic
    const levels = { 'INTERN': 1, 'JUNIOR': 2, 'MIDDLE': 3, 'SENIOR': 4, 'LEAD': 5, 'ANY': 0 };
    if (vacancyLevel === 'Any') return maxScore;

    const uLvl = levels[userLevel.toUpperCase() as keyof typeof levels] || 3;
    const vLvl = levels[vacancyLevel.toUpperCase() as keyof typeof levels] || 3;

    const diff = uLvl - vLvl;
    if (diff === 0) return maxScore;
    if (diff === 1) return maxScore * 0.8;
    if (diff >= 1) return maxScore * 0.5; // Overqualified
    if (diff === -1) return maxScore * 0.6; // Slightly Underqualified

    return 0;
  }

  // 5. Location & Workplace Match (Max 10)
  private calculateLocationScore(userLoc: string, vacLoc: string, vacWorkplace: string, prefWorkplace: WorkplaceType[]): number {
    const maxScore = 10;
    
    // Safety check for userLoc
    if (!userLoc) return maxScore * 0.5; // Default neutral score if unknown

    const uLoc = userLoc.toLowerCase();
    const vLoc = vacLoc.toLowerCase();
    
    // Check workplace type preference
    const wpMatch = prefWorkplace && prefWorkplace.length > 0 
      ? prefWorkplace.some(wp => wp.toLowerCase() === vacWorkplace.toLowerCase())
      : true;

    if (!wpMatch) return 0; // Wrong workplace type (e.g. wants Remote, job is Office)

    if (vacWorkplace === WorkplaceType.REMOTE) return maxScore;
    if (vLoc.includes(uLoc) || uLoc.includes(vLoc)) return maxScore;
    
    if (vacWorkplace === WorkplaceType.HYBRID && (vLoc.includes(uLoc) || uLoc.includes(vLoc))) {
      return maxScore;
    }

    return 0;
  }

  // 6. Schedule Match (Max 10)
  private calculateScheduleScore(userSchedules: WorkSchedule[], vacancySchedule?: WorkSchedule): number {
    const maxScore = 10;
    if (!vacancySchedule) return maxScore * 0.8; // Assume flexible/standard if not specified
    if (!userSchedules || userSchedules.length === 0) return maxScore; // User doesn't care

    if (userSchedules.includes(vacancySchedule)) return maxScore;
    
    return 0;
  }


  // ==========================================
  // 🛠 DETECTORS & HELPERS
  // ==========================================

  private extractSkills(text: string, userSkills: string[]): string[] {
    const skills: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Check if userSkills exists and is an array
    if (userSkills && Array.isArray(userSkills)) {
      userSkills.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase())) skills.push(skill);
      });
    }
    
    const commonSkills = [
      // Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'C#', 'C++', 'Go', 'Rust', 'Ruby', 'Kotlin', 'Swift',
      // Frontend
      'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'Redux', 'MobX', 'HTML', 'CSS', 'Sass', 'Less', 'Tailwind', 'Bootstrap',
      // Backend
      'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Laravel', '.NET', 'ASP.NET',
      // Databases
      'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
      // Cloud & DevOps
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD', 'Linux', 'Bash',
      // Data Science & AI/ML
      'Machine Learning', 'ML', 'Deep Learning', 'AI', 'LLM', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Scikit-learn',
      'Pandas', 'NumPy', 'Jupyter', 'Data Science', 'Big Data', 'Spark', 'Hadoop', 'Kafka',
      // Other
      'Git', 'REST', 'GraphQL', 'API', 'Microservices', 'Agile', 'Scrum', 'Figma', 'Webpack', 'Vite', 'Testing', 'Jest', 'Pytest'
    ];
    
    commonSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase()) && !skills.includes(skill)) {
        skills.push(skill);
      }
    });

    return Array.from(new Set(skills)).slice(0, 8); 
  }

  private detectExperienceLevel(title: string, description: string): ExperienceLevel {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('lead') || text.includes('principal') || text.includes('architect')) return ExperienceLevel.LEAD;
    if (text.includes('senior') || text.includes('sr.') || text.includes('senio')) return ExperienceLevel.SENIOR;
    if (text.includes('middle') || text.includes('mid-level') || text.includes('medie')) return ExperienceLevel.MIDDLE;
    if (text.includes('junior') || text.includes('jr.') || text.includes('junio')) return ExperienceLevel.JUNIOR;
    if (text.includes('intern') || text.includes('trainee') || text.includes('стажер') || text.includes('probation')) return ExperienceLevel.INTERN;
    
    // Default to ANY if nothing specific found, instead of Middle, to be safer
    // But keeping Middle as fallback is often standard for generic listings unless "no experience" mentioned
    if (text.includes('fara experienta') || text.includes('без опыта') || text.includes('no experience')) return ExperienceLevel.ANY;

    return ExperienceLevel.MIDDLE; 
  }

  private detectWorkplaceType(description: string): WorkplaceType {
    const text = description.toLowerCase();
    
    if (text.includes('remote') || text.includes('удаленно') || text.includes('удаленная') || text.includes('la distanta')) return WorkplaceType.REMOTE;
    if (text.includes('hybrid') || text.includes('гибрид') || text.includes('hibrid')) return WorkplaceType.HYBRID;
    if (text.includes('travel') || text.includes('разъездн') || text.includes('deplasari')) return WorkplaceType.TRAVEL;
    
    return WorkplaceType.OFFICE; 
  }

  private detectWorkSchedule(description: string): WorkSchedule | undefined {
    const text = description.toLowerCase();
    
    if (text.includes('part time') || text.includes('part-time') || text.includes('частичная') || text.includes('jumatate de norma')) return WorkSchedule.PART_TIME;
    if (text.includes('shift') || text.includes('сменн') || text.includes('in ture')) return WorkSchedule.SHIFT_WORK;
    if (text.includes('freelance') || text.includes('свободный')) return WorkSchedule.FREELANCE;
    if (text.includes('flexible') || text.includes('гибкий') || text.includes('flexibil')) return WorkSchedule.FLEXIBLE;
    if (text.includes('full time') || text.includes('full-time') || text.includes('полный') || text.includes('norma deplina')) return WorkSchedule.FULL_TIME;
    
    return undefined;
  }

  private detectEducation(description: string): EducationLevel | undefined {
    const text = description.toLowerCase();
    
    if (text.includes('student')) return EducationLevel.STUDENT;
    if (text.includes('higher') || text.includes('высшее') || text.includes('superioare') || text.includes('degree') || text.includes('bachelor') || text.includes('master')) return EducationLevel.HIGHER;
    if (text.includes('secondary') || text.includes('среднее') || text.includes('medii')) return EducationLevel.SECONDARY;

    return EducationLevel.ANY;
  }

  private detectMinYearsExperience(description: string): number | undefined {
    const text = description.toLowerCase();
    // Look for patterns like "2 years", "3+ years", "от 2 лет", "min 3 ani"
    const regex = /(?:experience|опыт|experienta)[\D]{0,20}(\d+)[\D]{0,10}(?:years|лет|ani)/i;
    const match = text.match(regex);
    
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return undefined;
  }

  private optimizeSearchQuery(role: string): string {
    // Handle undefined/null/empty role
    if (!role || role.trim().length === 0) {
      return 'developer'; // Default fallback search term
    }

    const stopWords = [
      'developer', 'engineer', 'specialist', 'consultant', 
      'junior', 'middle', 'senior', 'lead', 'principal', 
      'intern', 'trainee', 'manager', // "Product Manager" -> "Product" might be too aggressive, but "Manager" usually implies context
      'architect', 'administrator'
    ];
    
    // Exception: if role is JUST "Developer", keep it? No, query will be empty.
    // rabota.md handles "Developer" fine.

    let words = role.toLowerCase().split(/[\s\-/]+/);
    
    // Filter out stop words, BUT ensure we don't return empty string
    const filtered = words.filter(w => !stopWords.includes(w) && w.length > 2);
    
    if (filtered.length === 0) {
       // If everything was filtered (e.g. "Java Developer"), just return the main tech "Java"
       // Actually "Java" is not a stop word.
       // If user entered "Software Engineer", filtered is "software". Correct.
       // If user entered "Developer", filtered is empty. Fallback to original.
       return words[0] || role; 
    }
    
    return filtered.join(' ');
  }
}

export const realVacancyService = new RealVacancyService();
