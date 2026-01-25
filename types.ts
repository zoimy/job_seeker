export enum ExperienceLevel {
  INTERN = 'Intern',
  JUNIOR = 'Junior',
  MIDDLE = 'Middle',
  SENIOR = 'Senior',
  LEAD = 'Lead',
  ANY = 'Any' // New
}

export enum WorkplaceType {
  REMOTE = 'Remote',
  OFFICE = 'Office',
  HYBRID = 'Hybrid',
  TRAVEL = 'Travel' // New
}

export enum WorkSchedule {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  SHIFT_WORK = 'Shift Work',
  FREELANCE = 'Freelance',
  FLEXIBLE = 'Flexible'
}

export enum EducationLevel {
  ANY = 'Any',
  HIGHER = 'Higher',
  SECONDARY = 'Secondary',
  STUDENT = 'Student'
}

export interface UserProfile {
  name: string;
  role: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number; // New
  location: string;
  minSalary: number;
  perferredCurrency: 'MDL' | 'EUR' | 'USD'; // Note: typo in original 'perferred' maintained or fixed? Let's keep it to avoid breaks if used elsewhere, but ideally fix. I see 'perferredCurrency' in original.
  preferredWorkplace: WorkplaceType[];
  preferredSchedule: WorkSchedule[]; // New
  education: EducationLevel; // New
  bio: string;
  searchPeriodDays?: number;
}

export interface Vacancy {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  workplace: WorkplaceType;
  schedule?: WorkSchedule; // New
  minYearsExperience?: number; // New
  education?: EducationLevel; // New
  postedAt: string;
  url?: string; // Link to original vacancy
}

export interface VacancyMatch {
  vacancy: Vacancy;
  matchScore: number; // 0-100
  breakdown: {
    skillsMatch: string[]; // Matched skills
    missingSkills: string[];
    locationMatch: boolean;
    salaryMatch: boolean;
  };
}

// Integration Types
export type ServiceType = 'telegram' | 'email' | 'slack' | 'discord' | 'whatsapp' | 'instagram' | 'webhook';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'premium';

export interface IntegrationConnectionInfo {
  username?: string;
  email?: string;
  channel?: string;
  webhookUrl?: string;
  chatId?: string; // For Telegram
}

export interface IntegrationSettings {
  frequency?: 'instant' | 'daily' | 'weekly';
  format?: 'compact' | 'detailed' | 'html' | 'text';
  notifyOn?: {
    description?: boolean;
    salary?: boolean;
    skills?: boolean;
    company?: boolean;
  };
}

export interface Integration {
  id: ServiceType;
  name: string;
  description: string;
  status: IntegrationStatus;
  isPremium: boolean;
  connectionInfo?: IntegrationConnectionInfo;
  settings?: IntegrationSettings;
  lastNotification?: Date;
}