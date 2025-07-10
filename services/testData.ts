import { Technique, TechniqueCategory } from '@/types/technique';
import { TrainingSession, SessionType } from '@/types/session';
import { saveTechnique, saveSession, getTechniques, getSessions } from './storage';

// Standard BJJ techniques covering all categories
const testTechniques: Omit<Technique, 'id' | 'timestamp'>[] = [
  // Submissions
  { name: 'Rear Naked Choke', category: 'Submission', tags: ['Back'], notes: 'Classic blood choke from back control' },
  { name: 'Triangle Choke', category: 'Submission', tags: ['Closed Guard'], notes: 'Fundamental submission from closed guard' },
  { name: 'Armbar', category: 'Submission', tags: ['Mount'], notes: 'Joint lock attacking the elbow from mount' },
  { name: 'Kimura', category: 'Submission', tags: ['Side Control'], notes: 'Shoulder lock from side control' },
  { name: 'Guillotine', category: 'Submission', tags: ['Standing'], notes: 'Front headlock choke' },
  
  // Sweeps
  { name: 'Scissor Sweep', category: 'Sweep', tags: ['Closed Guard'], notes: 'Basic sweep from closed guard' },
  { name: 'Flower Sweep', category: 'Sweep', tags: ['Closed Guard'], notes: 'Pendulum sweep from closed guard' },
  { name: 'Butterfly Sweep', category: 'Sweep', tags: ['Butterfly Guard'], notes: 'Hook sweep from butterfly guard' },
  { name: 'Hip Bump Sweep', category: 'Sweep', tags: ['Closed Guard'], notes: 'Sit-up sweep from closed guard' },
  
  // Escapes
  { name: 'Bridge and Roll', category: 'Escape', tags: ['Mount'], notes: 'Basic mount escape' },
  { name: 'Elbow Escape', category: 'Escape', tags: ['Mount'], notes: 'Shrimping out of mount' },
  { name: 'Frame and Shrimp', category: 'Escape', tags: ['Side Control'], notes: 'Side control escape to guard' },
  { name: 'Knee Shield Recovery', category: 'Escape', tags: ['Half Guard'], notes: 'Creating space in half guard' },
  
  // Passes
  { name: 'Knee Cut Pass', category: 'Guard Pass', tags: ['Half Guard'], notes: 'Slicing through half guard' },
  { name: 'Torreando Pass', category: 'Guard Pass', tags: ['Open Guard'], notes: 'Bullfighter pass' },
  { name: 'Stack Pass', category: 'Guard Pass', tags: ['Closed Guard'], notes: 'Pressure passing closed guard' },
  { name: 'X-Pass', category: 'Guard Pass', tags: ['Open Guard'], notes: 'Cross knee pass' },
  
  // Takedowns
  { name: 'Double Leg', category: 'Takedown', tags: ['Standing', 'Wrestling'], notes: 'Basic wrestling takedown' },
  { name: 'Single Leg', category: 'Takedown', tags: ['Standing', 'Wrestling'], notes: 'Wrestling takedown attacking one leg' },
  { name: 'Osoto Gari', category: 'Takedown', tags: ['Standing', 'Judo'], notes: 'Major outer reap from judo' }
];

// Generate sessions spread over the past year
const generateTestSessions = (): Omit<TrainingSession, 'id'>[] => {
  const sessions: Omit<TrainingSession, 'id'>[] = [];
  const locations = ['Gracie Barra Austin', 'Renzo Gracie Academy', '10th Planet Jiu Jitsu', 'Alliance BJJ', 'Atos HQ'];
  const sessionTypes: SessionType[] = ['gi', 'nogi'];
  const commonSubmissions = ['Armbar', 'Triangle', 'Rear Naked Choke', 'Kimura', 'Guillotine', 'Americana', 'Ezekiel', 'Cross Collar Choke', 'Bow and Arrow', 'Omoplata'];
  
  // Generate 20 sessions spread over the past year
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  for (let i = 0; i < 20; i++) {
    // Random date within the past year
    const randomDays = Math.floor(Math.random() * 365);
    const sessionDate = new Date(oneYearAgo.getTime() + (randomDays * 24 * 60 * 60 * 1000));
    
    // Random session details
    const type = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const satisfaction = Math.floor(Math.random() * 5) + 1;
    
    // Random technique IDs (will be replaced with actual IDs after techniques are created)
    const numTechniques = Math.floor(Math.random() * 5) + 1;
    const techniqueIds: string[] = [];
    
    // Random submissions (0-3 per session)
    const numSubmissions = Math.floor(Math.random() * 4);
    const submissions: string[] = [];
    for (let j = 0; j < numSubmissions; j++) {
      submissions.push(commonSubmissions[Math.floor(Math.random() * commonSubmissions.length)]);
    }
    
    // Generate notes based on satisfaction
    let notes = '';
    if (satisfaction >= 4) {
      notes = ['Great rolls today!', 'Felt really sharp', 'Hit all my moves', 'Excellent training partners'][Math.floor(Math.random() * 4)];
    } else if (satisfaction === 3) {
      notes = ['Decent session', 'Average day on the mats', 'Some good moments'][Math.floor(Math.random() * 3)];
    } else {
      notes = ['Tough day', 'Need to work on defense', 'Got caught a lot', 'Cardio was rough'][Math.floor(Math.random() * 4)];
    }
    
    sessions.push({
      date: sessionDate,
      type,
      location,
      techniqueIds,
      satisfaction: satisfaction as 1 | 2 | 3 | 4 | 5,
      notes,
      submissions,
      submissionCounts: submissions.reduce((counts, sub) => {
        counts[sub] = (counts[sub] || 0) + 1;
        return counts;
      }, {} as Record<string, number>)
    });
  }
  
  return sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const loadTestData = async (force: boolean = false): Promise<void> => {
  try {
    // Check if we already have data
    const existingTechniques = await getTechniques();
    const existingSessions = await getSessions();
    
    if (!force && (existingTechniques.length > 0 || existingSessions.length > 0)) {
      console.log('Test data already exists, skipping...');
      return;
    }
    
    console.log('Loading test data...');
    
    // First, create all techniques
    const createdTechniques: Technique[] = [];
    for (const techniqueData of testTechniques) {
      const technique: Technique = {
        ...techniqueData,
        id: `tech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      await saveTechnique(technique);
      createdTechniques.push(technique);
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`Created ${createdTechniques.length} test techniques`);
    
    // Then create sessions with random technique selections
    const testSessions = generateTestSessions();
    for (const sessionData of testSessions) {
      // Randomly select techniques for this session
      const numTechniques = Math.floor(Math.random() * 5) + 1;
      const selectedTechniques = [...createdTechniques]
        .sort(() => 0.5 - Math.random())
        .slice(0, numTechniques);
      
      const session: TrainingSession = {
        ...sessionData,
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        techniqueIds: selectedTechniques.map(t => t.id)
      };
      
      await saveSession(session);
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`Created ${testSessions.length} test sessions`);
    console.log('Test data loaded successfully!');
  } catch (error) {
    console.error('Error loading test data:', error);
    throw error;
  }
};