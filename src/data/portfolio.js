export const profile = {
  name: 'Deepak Luitel',
  email: 'hello@deepak.dev', // Replace with Deepak's preferred contact address.
  github: 'https://github.com/Deepak3725',
  linkedin: 'https://www.linkedin.com/in/yourusername/',
}

export const projects = [
  {
    number: '01',
    name: 'CourseHub',
    category: 'Full stack web application',
    description: 'An online course marketplace where creators can publish courses and learners can discover and purchase them.',
    technologies: ['Go', 'PostgreSQL', 'HTML', 'CSS', 'JavaScript'],
    visual: 'coursehub',
    visualLabel: 'Concept preview · not a completed client project',
  },
  {
    number: '02',
    name: 'Service Marketplace',
    category: 'Web application concept',
    description: 'Currently working on a platform for discovering local service providers and booking the right person for the job.',
    technologies: ['Go', 'PostgreSQL', 'HTML', 'CSS', 'JavaScript'],
    visual: 'marketplace',
    visualLabel: 'Concept preview · not a completed client project',
  },
  {
    number: '03',
    name: 'Skill Swap',
    category: 'DSA-powered learning platform',
    description: 'Skill Swap is a DSA-powered platform that seamlessly connects learners and mentors based on complementary skill sets. By leveraging HashMaps for fast lookups, Graphs with BFS/DFS for logical learning paths, and Heaps to rank top-rated teachers and resources, the system handles complex algorithmic matching behind a minimal, user-friendly interface (currently working on).',
    technologies: ['HashMaps', 'Graphs (BFS/DFS)', 'Heaps'],
    visual: 'skillswap',
    visualLabel: 'Concept preview · not a completed client project',
  },
]

export const skillGroups = [
  { title: 'Frontend', number: '01', skills: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'] },
  { title: 'Backend', number: '02', skills: ['Go', 'Java', 'Node.js', 'DSA with Java'] },
  { title: 'Database', number: '03', skills: ['MySQL', 'PostgreSQL', 'MongoDB'] },
  { title: 'Data & AI', number: '04', skills: ['Python', 'NumPy', 'pandas', 'AI and machine learning fundamentals'] },
]

export const services = [
  { number: '01', title: 'Business website development', description: 'Modern, responsive websites that help businesses and startups present themselves with clarity.' },
  { number: '02', title: 'Landing page development', description: 'Focused landing pages that explain a product or service and guide visitors to a clear next step.' },
  { number: '03', title: 'Full stack web development', description: 'Useful web applications with connected frontend, backend, and database foundations.' },
  { number: '04', title: 'Website redesign', description: 'A considered refresh for an existing site, improving its visual system, usability, and responsive behavior.' },
  { number: '05', title: 'Data Analysis and Cleaning', description: 'Cleaning, organizing, and transforming datasets to ensure data quality and prepare them for meaningful analysis.' },
  { number: '06', title: 'Statistical Analysis', description: 'Applying statistical methods to analyze data, identify patterns, and extract meaningful insights.' },
  { number: '07', title: 'Database Design', description: 'Designing structured, efficient, and reliable databases to organize and manage business data.' },
]
