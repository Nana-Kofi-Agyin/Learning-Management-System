export const lessonGroups = [
  {
    title: 'Introduction',
    items: [
      { id: '01', title: 'Design Foundations', duration: '12:04', active: true },
      { id: '02', title: 'User Psychology', duration: '08:15', active: false },
    ],
  },
  {
    title: 'Deep Dive',
    items: [
      { id: '03', title: 'High Fidelity Prototyping', duration: '24:40', active: false },
      { id: '04', title: 'Micro-Interactions', duration: '18:30', active: false },
      { id: 'Q', title: 'Module Quiz', duration: '15 min', active: false },
    ],
  },
]

export const takeaways = [
  'Mastering the "No-Line" rule for modern visual hierarchies.',
  'Creating realistic micro-interactions using smart animate.',
  'The psychology of layering and tonal depth in user interfaces.',
]

export const resources = [
  {
    title: 'Course Assets',
    description: 'Download the Figma starter kit for this lesson.',
    action: 'Download .FIG',
    badge: null,
  },
  {
    title: 'Reading List',
    description: 'Curated list of 5 must-read articles on spatial design.',
    action: 'Open Library',
    badge: 'Bonus',
  },
]

export const discussion = [
  {
    author: 'Liam Peterson',
    time: '2 hours ago',
    role: null,
    message:
      'The way you explained the glassmorphism blur ratio really clicked for me. Should we always aim for 12px blur or does it depend on the background contrast?',
    likes: 12,
  },
  {
    author: 'Marcus Chen',
    time: '1 hour ago',
    role: 'Instructor',
    message:
      'Great question, Liam. 12px is a safe baseline, but if you have a very busy background, increasing to 24px helps maintain text legibility. Always prioritize the content.',
    likes: null,
  },
]
