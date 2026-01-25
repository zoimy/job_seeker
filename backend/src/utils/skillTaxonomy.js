/**
 * Skill Taxonomy - Categorizes skills into tech stacks and identifies incompatible technologies
 */

// Frontend Frameworks (mutually exclusive - pick one primary)
export const FRONTEND_FRAMEWORKS = {
  react: ['react', 'react.js', 'reactjs', 'react native', 'next.js', 'nextjs', 'gatsby'],
  angular: ['angular', 'angular 2', 'angular 2+', 'angular.js', 'angularjs'],
  vue: ['vue', 'vue.js', 'vue 3', 'vue 2', 'vuejs', 'nuxt', 'nuxt.js'],
  svelte: ['svelte', 'sveltekit'],
  ember: ['ember', 'ember.js']
};

// Backend Languages (often exclusive per role)
export const BACKEND_LANGUAGES = {
  javascript: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'express', 'nest.js', 'nestjs'],
  typescript: ['typescript', 'ts'],
  python: ['python', 'django', 'flask', 'fastapi'],
  java: ['java', 'spring', 'spring boot', 'hibernate'],
  csharp: ['c#', 'csharp', '.net', 'dotnet', 'asp.net', 'asp.net core', 'entity framework'],
  php: ['php', 'laravel', 'symfony', 'wordpress'],
  ruby: ['ruby', 'rails', 'ruby on rails'],
  go: ['go', 'golang'],
  rust: ['rust'],
  kotlin: ['kotlin'],
  swift: ['swift']
};

// DevOps/Infrastructure Tools
export const DEVOPS_TOOLS = {
  containers: ['docker', 'kubernetes', 'k8s', 'helm', 'openshift'],
  cloud: ['aws', 'azure', 'gcp', 'google cloud', 'cloud'],
  ci_cd: ['jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci']
};

// State Management (context-specific)
export const STATE_MANAGEMENT = {
  react: ['redux', 'mobx', 'zustand', 'recoil', 'context api'],
  angular: ['ngrx', 'ngxs', 'akita'],
  vue: ['vuex', 'pinia']
};

// Common/Universal Skills (compatible with everything)
export const UNIVERSAL_SKILLS = [
  'git', 'github', 'gitlab', 'bitbucket',
  'html', 'html5', 'css', 'css3', 'scss', 'sass', 'less',
  'rest api', 'restful', 'graphql', 'api',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
  'testing', 'jest', 'mocha', 'cypress', 'selenium',
  'agile', 'scrum', 'kanban',
  'ui/ux', 'responsive design', 'mobile-first'
];

/**
 * Get the tech stack category for a skill
 * @param {string} skill - The skill to categorize
 * @returns {object|null} - { category: 'frontend', family: 'react' } or null
 */
export function getSkillCategory(skill) {
  const normalized = skill.toLowerCase().trim();
  
  // Check frontend frameworks
  for (const [family, keywords] of Object.entries(FRONTEND_FRAMEWORKS)) {
    if (keywords.some(kw => normalized.includes(kw) || kw.includes(normalized))) {
      return { category: 'frontend', family };
    }
  }
  
  // Check backend languages
  for (const [family, keywords] of Object.entries(BACKEND_LANGUAGES)) {
    if (keywords.some(kw => normalized.includes(kw) || kw.includes(normalized))) {
      return { category: 'backend', family };
    }
  }
  
  // Check state management
  for (const [family, keywords] of Object.entries(STATE_MANAGEMENT)) {
    if (keywords.some(kw => normalized.includes(kw) || kw.includes(normalized))) {
      return { category: 'state', family };
    }
  }
  
  // Check universal skills
  if (UNIVERSAL_SKILLS.some(kw => normalized.includes(kw) || kw.includes(normalized))) {
    return { category: 'universal', family: 'common' };
  }
  
  return null;
}

/**
 * Check if two skills are incompatible (competing technologies)
 * @param {string} skill1 
 * @param {string} skill2 
 * @returns {boolean} - true if incompatible
 */
export function areSkillsIncompatible(skill1, skill2) {
  const cat1 = getSkillCategory(skill1);
  const cat2 = getSkillCategory(skill2);
  
  if (!cat1 || !cat2) return false;
  
  // Same category but different family = incompatible
  // e.g., React vs Angular, PHP vs Node.js
  if (cat1.category === cat2.category && cat1.family !== cat2.family) {
    // Exception: JavaScript and TypeScript are compatible
    if ((cat1.family === 'javascript' && cat2.family === 'typescript') ||
        (cat1.family === 'typescript' && cat2.family === 'javascript')) {
      return false;
    }
    return true;
  }
  
  return false;
}

/**
 * Find skills in text that match any of the given keywords
 * @param {string} text - Text to search
 * @param {string[]} skills - Skills to search for
 * @returns {string[]} - Matched skills
 */
export function findMatchingSkills(text, skills) {
  const normalized = text.toLowerCase();
  const matches = [];
  
  for (const skill of skills) {
    const skillLower = skill.toLowerCase();
    if (normalized.includes(skillLower)) {
      matches.push(skill);
    }
  }
  
  return matches;
}

/**
 * Calculate skill overlap and incompatibility
 * @param {string[]} profileSkills - User's skills
 * @param {string} vacancyText - Vacancy title + description
 * @returns {object} - { matched: [], incompatible: [], matchRatio: 0-1 }
 */
export function analyzeSkillMatch(profileSkills, vacancyText) {
  const matched = findMatchingSkills(vacancyText, profileSkills);
  const matchRatio = profileSkills.length > 0 ? matched.length / profileSkills.length : 0;
  
  // Find incompatible skills mentioned in vacancy
  const incompatible = [];
  const normalizedText = vacancyText.toLowerCase();
  
  for (const profileSkill of profileSkills) {
    // Check all known skills for incompatibility
    const allSkills = [
      ...Object.values(FRONTEND_FRAMEWORKS).flat(),
      ...Object.values(BACKEND_LANGUAGES).flat()
    ];
    
    for (const potentialSkill of allSkills) {
      if (normalizedText.includes(potentialSkill) && 
          areSkillsIncompatible(profileSkill, potentialSkill)) {
        incompatible.push(potentialSkill);
      }
    }
  }
  
  return {
    matched,
    incompatible: [...new Set(incompatible)], // Remove duplicates
    matchRatio
  };
}
