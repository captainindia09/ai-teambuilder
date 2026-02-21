require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');

const USERS = [
  { name: 'Priya Sharma', email: 'priya@demo.com', college: 'BIT Mesra', year: 3, skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'], bio: '2x hackathon winner. Love building clean UIs.' },
  { name: 'Rohit Kumar', email: 'rohit@demo.com', college: 'BIT Mesra', year: 4, skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'], bio: 'Backend dev. Built 3 production APIs.' },
  { name: 'Sneha Mehta', email: 'sneha@demo.com', college: 'BIT Mesra', year: 3, skills: ['Business Strategy', 'Figma', 'UI/UX', 'Pitch Decks'], bio: 'MBA aspirant. Won 2 case competitions.' },
  { name: 'Aditya Singh', email: 'aditya@demo.com', college: 'BIT Mesra', year: 2, skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'], bio: 'ML enthusiast. Kaggle contributor.' },
  { name: 'Neha Gupta', email: 'neha@demo.com', college: 'BIT Mesra', year: 3, skills: ['React Native', 'Flutter', 'JavaScript', 'Firebase'], bio: 'Mobile-first dev. 2 apps on Play Store.' },
  { name: 'Vikram Joshi', email: 'vikram@demo.com', college: 'BIT Mesra', year: 4, skills: ['Java', 'Spring Boot', 'Docker', 'AWS'], bio: 'Full-stack with cloud experience.' },
  { name: 'Ananya Reddy', email: 'ananya@demo.com', college: 'BIT Mesra', year: 2, skills: ['Python', 'Django', 'REST APIs', 'PostgreSQL'], bio: 'Backend dev. Open source contributor.' },
  { name: 'Karan Patel', email: 'karan@demo.com', college: 'BIT Mesra', year: 3, skills: ['React', 'Next.js', 'Node.js', 'GraphQL'], bio: 'Full-stack JS dev. Real-time apps.' },
  { name: 'Ishita Das', email: 'ishita@demo.com', college: 'BIT Mesra', year: 3, skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'User Research'], bio: 'Design-first thinker.' },
  { name: 'Arjun Verma', email: 'arjun@demo.com', college: 'BIT Mesra', year: 4, skills: ['Go', 'Rust', 'Kubernetes', 'Systems Programming'], bio: 'Infra guy. Makes things fast.' },
  { name: 'Riya Chopra', email: 'riya@demo.com', college: 'BIT Mesra', year: 2, skills: ['HTML/CSS', 'JavaScript', 'Bootstrap'], bio: 'Frontend beginner. Quick learner.' },
  { name: 'Manish Tiwari', email: 'manish@demo.com', college: 'BIT Mesra', year: 3, skills: ['Python', 'OpenCV', 'Deep Learning', 'Computer Vision'], bio: 'CV researcher.' },
  { name: 'Divya Nair', email: 'divya@demo.com', college: 'BIT Mesra', year: 3, skills: ['React', 'Redux', 'Node.js', 'MongoDB'], bio: 'MERN stack dev.' },
  { name: 'Saurabh Mishra', email: 'saurabh@demo.com', college: 'BIT Mesra', year: 4, skills: ['Blockchain', 'Solidity', 'Web3.js'], bio: 'Web3 builder.' },
  { name: 'Pooja Saxena', email: 'pooja@demo.com', college: 'BIT Mesra', year: 2, skills: ['Content Writing', 'Marketing', 'SEO', 'Canva'], bio: 'Handles docs, pitch, and marketing.' },
  { name: 'Rahul Bhatt', email: 'rahul@demo.com', college: 'BIT Mesra', year: 3, skills: ['C++', 'Competitive Programming', 'DSA', 'Python'], bio: 'Codeforces expert.' },
];

const PROJECTS = [
  { title: 'FinTrack - Personal Finance Dashboard', description: 'Smart dashboard that tracks expenses and gives AI saving suggestions.', skillsNeeded: ['React', 'Node.js', 'MongoDB', 'REST APIs'], domain: 'fintech', teamSize: 4 },
  { title: 'MedBuddy - Medicine Companion', description: 'Track medicines, dose timing, alerts. AI suggests schedules.', skillsNeeded: ['React', 'Node.js', 'AI/ML', 'MongoDB'], domain: 'healthtech', teamSize: 4 },
  { title: 'CodeCollab - Real-time Code Editor', description: 'Google Docs for code with AI review.', skillsNeeded: ['React', 'WebSocket', 'Node.js', 'Docker'], domain: 'edtech', teamSize: 3 },
  { title: 'SkillSwap - Peer Learning Platform', description: 'Students teach students. AI recommends learning paths.', skillsNeeded: ['Next.js', 'Node.js', 'PostgreSQL'], domain: 'edtech', teamSize: 4 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  await User.deleteMany({});
  await Project.deleteMany({});

  const password = await bcrypt.hash('demo123', 10);
  const users = [];
  for (const u of USERS) {
    const user = await User.create({ ...u, password });
    users.push(user);
    console.log(`  ✅ ${u.name}`);
  }

  for (let i = 0; i < PROJECTS.length; i++) {
    const creator = users[i];
    await Project.create({
      ...PROJECTS[i], creator: creator._id,
      members: [{ user: creator._id, role: 'lead', status: 'accepted' }]
    });
    console.log(`  ✅ ${PROJECTS[i].title}`);
  }

  console.log('\n🎉 Done! Login: priya@demo.com / demo123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
