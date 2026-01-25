/**
 * Test script to verify improved matching algorithm
 * Run: node test-improved-matching.js
 */

import { notificationScheduler } from './src/services/notificationScheduler.js';

// User's real profile
const userProfile = {
  userId: "3383eb45-6c04-4181-9504-07c6018b0c6b",
  name: "Egor",
  role: "Frontend Developer",
  skills: ["React", "Redux", "TypeScript", "JavaScript", "Node.js"],
  experienceLevel: "Any",
  yearsOfExperience: 0,
  location: "chisinau",
  minMatchScore: 50
};

// Test vacancies (from user's examples)
const testVacancies = [
  {
    id: "1",
    title: "C# / .NET Full Stack Developer",
    description: `
      Strong, hands-on experience with C# / .NET (ASP.NET Core) in production systems
      Proven experience working with Kubernetes in real-world, non-trivial environments
      Solid experience using Helm for deployment and configuration management
      Working knowledge of Vue 3 and ability to contribute to frontend development
      Strong understanding of RESTful APIs, distributed systems, and backend architecture
    `,
    location: "Chisinau"
  },
  {
    id: "2",
    title: ".NET Developer",
    description: `
      Day to Day Responsibilities:
      Regularly learn new systems and tools as the OpenLM platform and ecosystem evolve.
      Develop scalable applications using modern technologies.
      Basic knowledge in web technologies, databases, and frameworks such as ASP.NET MVC, Entity Framework SQL Indexes
      Experience with web services (WebAPI/JSON RESTful), GIT, Jenkins
      Additional experience with the following desired but not required: MVC, Microsoft Azure
      Programming fundamentals – deep understanding and proficiency in concepts such as OOP; SOLID, Design Patterns
    `,
    location: "Chisinau"
  },
  {
    id: "3",
    title: "Front End Developer (Angular)",
    description: `
      We're seeking a moderately experienced Front End Developer who can quickly adapt to our projects.
      Requirements:
      - Strong knowledge of HTML, CSS/SCSS, and JS/TS.
      - Solid base in Angular 2+ (components, services, etc.).
      - Good understanding of RxJS.
      - Proficiency in Git version control.
      - Familiarity with programming principles and design patterns for optimizing code.
      
      Collaborate on our Angular projects (back end written in .NET) focusing on truck logistics.
    `,
    location: "Chisinau"
  },
  {
    id: "4",
    title: "PHP Laravel Developer",
    description: `
      Key Responsibilities:
      Develop, test, and maintain application features using PHP and the Laravel framework.
      Build and consume RESTful APIs as part of the application's architecture.
      Write effective unit tests using PHPUnit to ensure code quality and reliability.
      Use Git for version control, including branching, merging, and pull requests.
      Work comfortably within our Docker-based development environment (Laravel Sail) on Linux-based systems.
      Work primarily with MySQL databases, writing and optimizing Eloquent queries.
      
      What We're Looking For (Requirements):
      1-3+ years of professional experience with PHP, with a solid foundation in the Laravel framework.
      Experience building or consuming RESTful APIs.
      Good understanding of OOP principles.
      Proficiency with Git version control.
      Solid experience with MySQL.
      Familiarity with Docker and working in a Linux-based environment.
      
      Bonus Points (Nice to Have):
      Frontend development experience, especially with Angular.
      Experience with PostgreSQL or NoSQL databases like Redis.
      Familiarity with Filament, Livewire, or Tailwind CSS.
    `,
    location: "Chisinau"
  },
  {
    id: "5",
    title: "React Frontend Developer",
    description: `
      We're looking for a skilled React developer to join our team.
      
      Requirements:
      - 2+ years of experience with React and modern JavaScript
      - Strong knowledge of TypeScript
      - Experience with state management (Redux, MobX, or similar)
      - Proficiency in HTML5, CSS3, and responsive design
      - Familiarity with RESTful APIs and asynchronous programming
      - Experience with Git version control
      - Good understanding of modern frontend build tools (Webpack, Vite)
      
      Nice to have:
      - Experience with Next.js or other React frameworks
      - Knowledge of Node.js for backend development
      - Testing experience (Jest, React Testing Library)
      - UI/UX design skills
    `,
    location: "Chisinau, Remote"
  },
  {
    id: "6",
    title: "Full Stack JavaScript Developer",
    description: `
      Join our dynamic team as a Full Stack JavaScript Developer!
      
      Required Skills:
      - Strong proficiency in JavaScript and TypeScript
      - Frontend: React, Redux, modern CSS frameworks
      - Backend: Node.js, Express.js, REST API development
      - Database: MongoDB, PostgreSQL
      - Version control with Git
      - Understanding of microservices architecture
      
      Responsibilities:
      - Build and maintain web applications using React and Node.js
      - Design and implement RESTful APIs
      - Work with databases and optimize queries
      - Collaborate with cross-functional teams
      - Write clean, maintainable code with tests
    `,
    location: "Chisinau"
  }
];

console.log('🧪 Testing Improved Matching Algorithm\n');
console.log('📋 User Profile:');
console.log(`   Role: ${userProfile.role}`);
console.log(`   Skills: ${userProfile.skills.join(', ')}`);
console.log(`   Min Score Threshold: ${userProfile.minMatchScore}\n`);
console.log('═'.repeat(80));
console.log('\n');

testVacancies.forEach((vacancy, index) => {
  const score = notificationScheduler.calculateMatchScore(vacancy, userProfile);
  const passThreshold = score >= userProfile.minMatchScore;
  const icon = passThreshold ? '✅' : '❌';
  const status = passThreshold ? 'PASS' : 'FAIL';
  
  console.log(`${icon} Vacancy ${index + 1}: ${vacancy.title}`);
  console.log(`   Score: ${score}/100 [${status}]`);
  console.log(`   Location: ${vacancy.location}`);
  console.log('');
});

console.log('═'.repeat(80));
console.log('\n📊 Expected Results:');
console.log('   ❌ Vacancy 1 (C#/.NET + Kubernetes): Should FAIL (0-20 pts)');
console.log('   ❌ Vacancy 2 (.NET/ASP.NET MVC): Should FAIL (0-20 pts)');
console.log('   ❌ Vacancy 3 (Angular 2+): Should FAIL (20-40 pts)');
console.log('   ❌ Vacancy 4 (PHP/Laravel): Should FAIL (0-20 pts)');
console.log('   ✅ Vacancy 5 (React/TypeScript): Should PASS (70-90 pts)');
console.log('   ✅ Vacancy 6 (Full Stack JS/React/Node): Should PASS (80-100 pts)');
