export enum ExperienceLevel {
  INTERN = 'INTERN',
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD'
}

export enum WorkplaceType {
  REMOTE = 'REMOTE',
  OFFICE = 'OFFICE',
  HYBRID = 'HYBRID'
}

export interface UserProfile {
  name: string;
  role: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  location: string;
  minSalary: number;
  preferredWorkplace: WorkplaceType[];
  bio: string;
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
  postedAt: string;
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