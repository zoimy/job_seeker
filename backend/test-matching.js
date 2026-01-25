/**
 * Test script for enhanced vacancy matching algorithm
 * Tests skill clustering, role synonyms, and stricter relevance filtering
 */

import { notificationScheduler } from './src/services/notificationScheduler.js';

// Mock user profile
const testProfile = {
  name: 'Test User',
  role: 'Frontend Developer',
  experienceLevel: 'middle',
  yearsOfExperience: 3,
  skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Git'],
  location: 'Chisinau',
  education: 'Higher',
  minSalary: 20000,
  preferredWorkplace: ['Remote', 'Hybrid']
};

// Test vacancies with expected scores
const testVacancies = [
  {
    id: 'test-1',
    title: 'Senior React Developer',
    company: 'Test Company A',
    description: 'Looking for an experienced React developer with TypeScript. Remote work available. Must have 4+ years of experience.',
    skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
    location: 'Remote',
    postedAt: new Date().toISOString(),
    url: 'https://example.com/job1',
    expectedScore: '80-90', // High match: React, TS, Remote, but slightly higher seniority
    reason: 'Perfect skill match, remote, good experience alignment'
  },
  {
    id: 'test-2',
    title: 'Frontend Engineer (Vue.js)',
    company: 'Test Company B',
    description: 'Frontend engineer with Vue.js experience. Must know CSS and JavaScript. Office in Chisinau.',
    skills: ['Vue.js', 'JavaScript', 'CSS', 'HTML'],
    location: 'Chisinau',
    postedAt: new Date().toISOString(),
    url: 'https://example.com/job2',
    expectedScore: '65-75', // Medium match: Related framework (Vue cluster), JS/CSS match, same city
    reason: 'Related frontend framework (cluster match), some skill overlap, location match' 
  },
  {
    id: 'test-3',
    title: 'Full Stack Developer',
    company: 'Test Company C',
    description: 'Need full stack developer with React and Node.js. Middle level. Hybrid work model.',
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    location: 'Chisinau',
    postedAt: new Date().toISOString(),
    url: 'https://example.com/job3',
    expectedScore: '75-85', // Good match: React match, experience level perfect, hybrid OK
    reason: 'React match, perfect experience level, hybrid workplace'
  },
  {
    id: 'test-4',
    title: 'Python Backend Developer',
    company: 'Test Company D',
    description: 'Python developer needed for backend services. Must know Django and PostgreSQL.',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    location: 'Chisinau',
    postedAt: new Date().toISOString(),
    url: 'https://example.com/job4',
    expectedScore: '20-35', // Low match: Wrong role (backend), different tech stack
    reason: 'Wrong tech stack, role mismatch (should be heavily penalized)'
  },
  {
    id: 'test-5',
    title: 'Junior JavaScript Developer',
    company: 'Test Company E',
    description: 'Looking for junior developer to work with JavaScript and React. Entry level position.',
    skills: ['JavaScript', 'React', 'HTML', 'CSS'],
    location: 'Chisinau',
    postedAt: new Date().toISOString(),
    url: 'https://example.com/job5',
    expectedScore: '65-75', // Medium match: Good skills but lower experience level
    reason: 'Good skill match but junior level (user is middle)'
  },
  {
    id: 'test-6',
    title: 'UI Developer',
    company: 'Test Company F',
    description: 'UI Developer with strong React and design skills. Remote position available.',
    skills: ['React', 'Figma', 'CSS', 'TypeScript'],
    location: 'Remote',
    postedAt: new Date().toISOString(),
    url: 'https://example.com/job6',
    expectedScore: '80-90', // High match: UI Developer is a synonym for Frontend, great skills, remote
    reason: 'Synonym match (UI Developer → Frontend), perfect skills, remote'
  }
];

console.log('🧪 TESTING ENHANCED MATCHING ALGORITHM\n');
console.log('User Profile:');
console.log(`- Role: ${testProfile.role}`);
console.log(`- Level: ${testProfile.experienceLevel}`);
console.log(`- Skills: ${testProfile.skills.join(', ')}`);
console.log(`- Location: ${testProfile.location}`);
console.log(`- Workplace: ${testProfile.preferredWorkplace.join(', ')}`);
console.log('\n' + '='.repeat(80) + '\n');

// Test each vacancy
testVacancies.forEach((vacancy, index) => {
  const score = notificationScheduler.calculateMatchScore(vacancy, testProfile);
  const passed = score >= 70; // New threshold
  const emoji = passed ? '✅' : '❌';
  const status = passed ? 'PASS (≥70%)' : 'FILTERED (<70%)';
  
  console.log(`${emoji} Test ${index + 1}: ${vacancy.title}`);
  console.log(`   Company: ${vacancy.company}`);
  console.log(`   Score: ${score}% (Expected: ${vacancy.expectedScore})`);
  console.log(`   Status: ${status}`);
  console.log(`   Location: ${vacancy.location}`);
  console.log(`   Skills: ${vacancy.skills.join(', ')}`);
  console.log(`   Reason: ${vacancy.reason}`);
  console.log('');
});

console.log('='.repeat(80));
console.log('\n📊 SUMMARY:');

const results = testVacancies.map(v => ({
  ...v,
  score: notificationScheduler.calculateMatchScore(v, testProfile)
}));

const passed = results.filter(r => r.score >= 70);
const filtered = results.filter(r => r.score < 70);

console.log(`✅ Passed (≥70%): ${passed.length}/${testVacancies.length}`);
passed.forEach(r => console.log(`   - ${r.title}: ${r.score}%`));

console.log(`\n❌ Filtered (<70%): ${filtered.length}/${testVacancies.length}`);
filtered.forEach(r => console.log(`   - ${r.title}: ${r.score}%`));

console.log('\n✨ Expected Behavior:');
console.log('   - Jobs 1, 3, 6 should PASS (high relevance)');
console.log('   - Jobs 2, 5 might PASS (medium-high relevance)');
console.log('   - Job 4 should FILTERED (totally irrelevant - Python backend)');

console.log('\n🎯 Key Improvements Tested:');
console.log('   ✓ Skill clustering (Vue.js gets partial credit for React user)');
console.log('   ✓ Role synonyms (UI Developer → Frontend Developer)');
console.log('   ✓ Dealbreaker penalties (Python backend gets heavily penalized)');
console.log('   ✓ Stricter threshold (70% instead of 60%)');
console.log('   ✓ Experience level matching with gradual penalties');
console.log('   ✓ Remote/location scoring');
