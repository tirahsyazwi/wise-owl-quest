export type MissionType = "pattern" | "logic" | "strategy" | "planning" | "spatial" | "sequence";
export type MissionZone = "arrival" | "foundation" | "strategic" | "adaptive" | "advanced";

export interface MissionOption {
  id: string;
  label: string;
  correct: boolean;
}

export interface Mission {
  id: string;
  title: string;
  type: MissionType;
  zone: MissionZone;
  difficulty: number; // 1-5
  question: string;
  hint?: string;
  options: MissionOption[];
  reward: { coins: number; xp: number };
  mapPosition: { x: number; y: number };
}

const typeColors: Record<MissionType, string> = {
  pattern: "hsl(170, 70%, 45%)",
  logic: "hsl(45, 95%, 58%)",
  strategy: "hsl(260, 60%, 55%)",
  planning: "hsl(330, 70%, 60%)",
  spatial: "hsl(25, 90%, 55%)",
  sequence: "hsl(145, 65%, 50%)",
};

export const getTypeColor = (type: MissionType) => typeColors[type];

export const getTypeLabel = (type: MissionType) => {
  const labels: Record<MissionType, string> = {
    pattern: "Pattern",
    logic: "Logic",
    strategy: "Strategy",
    planning: "Planning",
    spatial: "Spatial",
    sequence: "Sequence",
  };
  return labels[type];
};

export const getZoneLabel = (zone: MissionZone) => {
  const labels: Record<MissionZone, string> = {
    arrival: "🌟 Arrival Zone",
    foundation: "🧱 Foundation Zone",
    strategic: "🎯 Strategy Zone",
    adaptive: "🔄 Adaptive Zone",
    advanced: "🚀 Advanced Zone",
  };
  return labels[zone];
};

// ═══════════════════════════════════════
// QUESTION BANK — 25 missions, 5 per zone
// ═══════════════════════════════════════

export const missionBank: Mission[] = [
  // ──── ARRIVAL ZONE (Difficulty 1) ────
  {
    id: "m01",
    title: "Star Path",
    type: "pattern",
    zone: "arrival",
    difficulty: 1,
    question: "What comes next? ⭐ 🌙 ⭐ 🌙 ⭐ ?",
    hint: "Look at the pattern — it goes back and forth!",
    options: [
      { id: "a", label: "🌙", correct: true },
      { id: "b", label: "⭐", correct: false },
      { id: "c", label: "☀️", correct: false },
      { id: "d", label: "🪐", correct: false },
    ],
    reward: { coins: 5, xp: 10 },
    mapPosition: { x: 15, y: 88 },
  },
  {
    id: "m02",
    title: "Color Orbit",
    type: "pattern",
    zone: "arrival",
    difficulty: 1,
    question: "Which color is missing? 🔴 🔵 🟢 🔴 🔵 ?",
    hint: "The colors repeat in the same order.",
    options: [
      { id: "a", label: "🟢", correct: true },
      { id: "b", label: "🔴", correct: false },
      { id: "c", label: "🟡", correct: false },
      { id: "d", label: "🔵", correct: false },
    ],
    reward: { coins: 5, xp: 10 },
    mapPosition: { x: 35, y: 82 },
  },
  {
    id: "m03",
    title: "Counting Stars",
    type: "logic",
    zone: "arrival",
    difficulty: 1,
    question: "Nova has 3 stars. She finds 2 more. How many stars does she have now?",
    hint: "Try adding them together!",
    options: [
      { id: "a", label: "5 stars", correct: true },
      { id: "b", label: "4 stars", correct: false },
      { id: "c", label: "6 stars", correct: false },
      { id: "d", label: "3 stars", correct: false },
    ],
    reward: { coins: 5, xp: 10 },
    mapPosition: { x: 55, y: 86 },
  },
  {
    id: "m04",
    title: "Shape Sort",
    type: "spatial",
    zone: "arrival",
    difficulty: 1,
    question: "Which shape has the most sides? Triangle, Square, or Circle?",
    hint: "Count the straight edges on each shape.",
    options: [
      { id: "a", label: "Square (4 sides)", correct: true },
      { id: "b", label: "Triangle (3 sides)", correct: false },
      { id: "c", label: "Circle (0 sides)", correct: false },
      { id: "d", label: "They're all the same", correct: false },
    ],
    reward: { coins: 5, xp: 10 },
    mapPosition: { x: 75, y: 80 },
  },
  {
    id: "m05",
    title: "Moon Sequence",
    type: "sequence",
    zone: "arrival",
    difficulty: 1,
    question: "Put in order from smallest to biggest: Cat, Mouse, Elephant",
    hint: "Think about which animal is the tiniest!",
    options: [
      { id: "a", label: "Mouse → Cat → Elephant", correct: true },
      { id: "b", label: "Cat → Mouse → Elephant", correct: false },
      { id: "c", label: "Elephant → Cat → Mouse", correct: false },
      { id: "d", label: "Mouse → Elephant → Cat", correct: false },
    ],
    reward: { coins: 5, xp: 15 },
    mapPosition: { x: 88, y: 72 },
  },

  // ──── FOUNDATION ZONE (Difficulty 2) ────
  {
    id: "m06",
    title: "Light Bridge",
    type: "strategy",
    zone: "foundation",
    difficulty: 2,
    question: "You have 7 energy. Bridge A costs 3, Bridge B costs 5, Bridge C costs 4. Which two bridges use exactly 7 energy?",
    hint: "Try adding different pairs together.",
    options: [
      { id: "a", label: "Bridge A (3) + Bridge C (4) = 7", correct: true },
      { id: "b", label: "Bridge A (3) + Bridge B (5) = 8", correct: false },
      { id: "c", label: "Bridge B (5) + Bridge C (4) = 9", correct: false },
      { id: "d", label: "Bridge A (3) + Bridge A (3) = 6", correct: false },
    ],
    reward: { coins: 10, xp: 20 },
    mapPosition: { x: 75, y: 62 },
  },
  {
    id: "m07",
    title: "Number Pattern",
    type: "pattern",
    zone: "foundation",
    difficulty: 2,
    question: "What comes next? 2, 4, 6, 8, ?",
    hint: "Each number goes up by the same amount.",
    options: [
      { id: "a", label: "10", correct: true },
      { id: "b", label: "9", correct: false },
      { id: "c", label: "12", correct: false },
      { id: "d", label: "11", correct: false },
    ],
    reward: { coins: 10, xp: 20 },
    mapPosition: { x: 58, y: 56 },
  },
  {
    id: "m08",
    title: "Treasure Chest",
    type: "logic",
    zone: "foundation",
    difficulty: 2,
    question: "There are 3 treasure chests. One has gold, one has silver, one is empty. The gold chest is NOT red. The empty chest is blue. What color is the gold chest?",
    hint: "Rule out colors one by one.",
    options: [
      { id: "a", label: "Green", correct: true },
      { id: "b", label: "Red", correct: false },
      { id: "c", label: "Blue", correct: false },
      { id: "d", label: "Yellow", correct: false },
    ],
    reward: { coins: 10, xp: 20 },
    mapPosition: { x: 40, y: 60 },
  },
  {
    id: "m09",
    title: "Space Garden",
    type: "planning",
    zone: "foundation",
    difficulty: 2,
    question: "You can plant 4 flowers. Red flowers need 2 spots each, blue flowers need 1 spot. How can you plant the most flowers?",
    hint: "Smaller flowers take less space!",
    options: [
      { id: "a", label: "4 blue flowers (4 spots)", correct: true },
      { id: "b", label: "2 red flowers (4 spots)", correct: false },
      { id: "c", label: "1 red + 1 blue (3 spots)", correct: false },
      { id: "d", label: "1 red flower (2 spots)", correct: false },
    ],
    reward: { coins: 10, xp: 25 },
    mapPosition: { x: 22, y: 55 },
  },
  {
    id: "m10",
    title: "Mirror Image",
    type: "spatial",
    zone: "foundation",
    difficulty: 2,
    question: "If you flip the letter 'b' in a mirror, what does it look like?",
    hint: "Imagine looking at the letter from the other side.",
    options: [
      { id: "a", label: "d", correct: true },
      { id: "b", label: "p", correct: false },
      { id: "c", label: "q", correct: false },
      { id: "d", label: "b (same)", correct: false },
    ],
    reward: { coins: 10, xp: 25 },
    mapPosition: { x: 12, y: 48 },
  },

  // ──── STRATEGIC ZONE (Difficulty 3) ────
  {
    id: "m11",
    title: "Nebula Sort",
    type: "logic",
    zone: "strategic",
    difficulty: 3,
    question: "Three aliens are in a race. Zorp finished before Blip. Blip finished before Mork. Who came in last?",
    hint: "If Zorp is before Blip, and Blip is before Mork…",
    options: [
      { id: "a", label: "Mork", correct: true },
      { id: "b", label: "Blip", correct: false },
      { id: "c", label: "Zorp", correct: false },
      { id: "d", label: "They tied", correct: false },
    ],
    reward: { coins: 15, xp: 30 },
    mapPosition: { x: 25, y: 40 },
  },
  {
    id: "m12",
    title: "Comet Trail",
    type: "pattern",
    zone: "strategic",
    difficulty: 3,
    question: "What comes next? 1, 1, 2, 3, 5, ?",
    hint: "Each number is the sum of the two before it!",
    options: [
      { id: "a", label: "8", correct: true },
      { id: "b", label: "7", correct: false },
      { id: "c", label: "6", correct: false },
      { id: "d", label: "10", correct: false },
    ],
    reward: { coins: 15, xp: 30 },
    mapPosition: { x: 45, y: 42 },
  },
  {
    id: "m13",
    title: "Supply Ship",
    type: "strategy",
    zone: "strategic",
    difficulty: 3,
    question: "Your spaceship can carry 10 kg. Food weighs 3 kg, water weighs 4 kg, fuel weighs 5 kg. You MUST take fuel. What else can you carry?",
    hint: "Fuel (5kg) is required. What fits in the remaining 5 kg?",
    options: [
      { id: "a", label: "Fuel + Food + Water (3+4+5=12) — too heavy!", correct: false },
      { id: "b", label: "Fuel + Food (5+3=8kg) ✓", correct: true },
      { id: "c", label: "Fuel + Water (5+4=9kg) ✓ but less room", correct: false },
      { id: "d", label: "Just fuel (5kg)", correct: false },
    ],
    reward: { coins: 15, xp: 35 },
    mapPosition: { x: 65, y: 38 },
  },
  {
    id: "m14",
    title: "Galaxy Grid",
    type: "spatial",
    zone: "strategic",
    difficulty: 3,
    question: "On a 3×3 grid, the center and all 4 corners are filled. How many squares are empty?",
    hint: "A 3×3 grid has 9 squares total. Count what's filled.",
    options: [
      { id: "a", label: "4 squares empty", correct: true },
      { id: "b", label: "3 squares empty", correct: false },
      { id: "c", label: "5 squares empty", correct: false },
      { id: "d", label: "2 squares empty", correct: false },
    ],
    reward: { coins: 15, xp: 35 },
    mapPosition: { x: 80, y: 35 },
  },
  {
    id: "m15",
    title: "Code Breaker",
    type: "sequence",
    zone: "strategic",
    difficulty: 3,
    question: "If A=1, B=2, C=3... What does the code 3-1-2 spell?",
    hint: "Match each number to its letter in the alphabet.",
    options: [
      { id: "a", label: "CAB", correct: true },
      { id: "b", label: "ABC", correct: false },
      { id: "c", label: "BAC", correct: false },
      { id: "d", label: "CBA", correct: false },
    ],
    reward: { coins: 15, xp: 35 },
    mapPosition: { x: 68, y: 28 },
  },

  // ──── ADAPTIVE ZONE (Difficulty 4) ────
  {
    id: "m16",
    title: "Orbit Plan",
    type: "planning",
    zone: "adaptive",
    difficulty: 4,
    question: "You have 3 tasks: Cook (30 min), Clean (20 min), Read (10 min). You have 1 hour. Can you do all 3, and in what order to finish fastest?",
    hint: "Add up all the times. Do they fit?",
    options: [
      { id: "a", label: "Yes! Any order works (30+20+10 = 60 min)", correct: true },
      { id: "b", label: "No, not enough time", correct: false },
      { id: "c", label: "Only 2 tasks fit", correct: false },
      { id: "d", label: "Only if you skip reading", correct: false },
    ],
    reward: { coins: 20, xp: 40 },
    mapPosition: { x: 50, y: 22 },
  },
  {
    id: "m17",
    title: "Black Hole",
    type: "logic",
    zone: "adaptive",
    difficulty: 4,
    question: "In a group of 5 friends, everyone shakes hands with everyone else once. How many handshakes happen in total?",
    hint: "Person 1 shakes with 4 others, Person 2 with 3 new people…",
    options: [
      { id: "a", label: "10 handshakes", correct: true },
      { id: "b", label: "20 handshakes", correct: false },
      { id: "c", label: "15 handshakes", correct: false },
      { id: "d", label: "8 handshakes", correct: false },
    ],
    reward: { coins: 20, xp: 40 },
    mapPosition: { x: 30, y: 25 },
  },
  {
    id: "m18",
    title: "Warp Jump",
    type: "strategy",
    zone: "adaptive",
    difficulty: 4,
    question: "You can jump 2 or 3 spaces. You need to land exactly on space 7. What jumps should you make?",
    hint: "Try combinations of 2s and 3s that add to 7.",
    options: [
      { id: "a", label: "2 + 2 + 3 = 7 ✓", correct: true },
      { id: "b", label: "3 + 3 = 6 (too short)", correct: false },
      { id: "c", label: "2 + 2 + 2 = 6 (too short)", correct: false },
      { id: "d", label: "3 + 3 + 3 = 9 (too far)", correct: false },
    ],
    reward: { coins: 20, xp: 45 },
    mapPosition: { x: 15, y: 20 },
  },
  {
    id: "m19",
    title: "Crystal Cave",
    type: "pattern",
    zone: "adaptive",
    difficulty: 4,
    question: "Each crystal doubles every hour. If you start with 1 crystal and need 16, how many hours does it take?",
    hint: "1 → 2 → 4 → 8 → ? Count the doublings.",
    options: [
      { id: "a", label: "4 hours", correct: true },
      { id: "b", label: "8 hours", correct: false },
      { id: "c", label: "16 hours", correct: false },
      { id: "d", label: "3 hours", correct: false },
    ],
    reward: { coins: 20, xp: 45 },
    mapPosition: { x: 38, y: 15 },
  },
  {
    id: "m20",
    title: "Robot Maze",
    type: "spatial",
    zone: "adaptive",
    difficulty: 4,
    question: "A robot starts facing North. It turns right, then right again. Which direction is it facing now?",
    hint: "Right from North is East. Right from East is…",
    options: [
      { id: "a", label: "South", correct: true },
      { id: "b", label: "West", correct: false },
      { id: "c", label: "North", correct: false },
      { id: "d", label: "East", correct: false },
    ],
    reward: { coins: 20, xp: 45 },
    mapPosition: { x: 60, y: 12 },
  },

  // ──── ADVANCED ZONE (Difficulty 5) ────
  {
    id: "m21",
    title: "Nova Burst",
    type: "logic",
    zone: "advanced",
    difficulty: 5,
    question: "A farmer has chickens and cows. He counts 8 heads and 26 legs. How many cows are there?",
    hint: "Chickens have 2 legs, cows have 4. If all were chickens, that's 16 legs…",
    options: [
      { id: "a", label: "5 cows", correct: true },
      { id: "b", label: "4 cows", correct: false },
      { id: "c", label: "6 cows", correct: false },
      { id: "d", label: "3 cows", correct: false },
    ],
    reward: { coins: 25, xp: 50 },
    mapPosition: { x: 78, y: 8 },
  },
  {
    id: "m22",
    title: "Time Warp",
    type: "planning",
    zone: "advanced",
    difficulty: 5,
    question: "You need to fill a 5-liter bucket using only a 3-liter and a 2-liter container. What's the fewest number of fills?",
    hint: "Fill the 3-liter and the 2-liter each once…",
    options: [
      { id: "a", label: "2 fills (3L + 2L = 5L)", correct: true },
      { id: "b", label: "3 fills", correct: false },
      { id: "c", label: "4 fills", correct: false },
      { id: "d", label: "It's impossible", correct: false },
    ],
    reward: { coins: 25, xp: 50 },
    mapPosition: { x: 55, y: 5 },
  },
  {
    id: "m23",
    title: "Star Matrix",
    type: "pattern",
    zone: "advanced",
    difficulty: 5,
    question: "In a magic square, each row, column, and diagonal adds to 15. The center is 5, top-left is 2. What goes in the top-right?",
    hint: "The top row must add to 15. 2 + 5 + ? = ... wait, the middle of the top row might not be 5.",
    options: [
      { id: "a", label: "4", correct: false },
      { id: "b", label: "6", correct: true },
      { id: "c", label: "8", correct: false },
      { id: "d", label: "9", correct: false },
    ],
    reward: { coins: 25, xp: 55 },
    mapPosition: { x: 35, y: 3 },
  },
  {
    id: "m24",
    title: "Quantum Riddle",
    type: "strategy",
    zone: "advanced",
    difficulty: 5,
    question: "You have 9 identical-looking coins. One is slightly heavier. Using a balance scale only twice, can you find the heavy coin?",
    hint: "Divide the coins into 3 groups of 3…",
    options: [
      { id: "a", label: "Yes — weigh 3 vs 3, then 1 vs 1 from the heavy group", correct: true },
      { id: "b", label: "No, you need at least 3 weighings", correct: false },
      { id: "c", label: "Yes — weigh 4 vs 4", correct: false },
      { id: "d", label: "No, it's impossible", correct: false },
    ],
    reward: { coins: 30, xp: 60 },
    mapPosition: { x: 18, y: 5 },
  },
  {
    id: "m25",
    title: "Supernova",
    type: "logic",
    zone: "advanced",
    difficulty: 5,
    question: "Three switches control three light bulbs in another room. You can only enter the room once. How do you figure out which switch controls which bulb?",
    hint: "Think about what else a light bulb does besides glow…",
    options: [
      { id: "a", label: "Turn on switch 1 for a while (heat), turn it off, turn on switch 2, then enter", correct: true },
      { id: "b", label: "Turn all on at once", correct: false },
      { id: "c", label: "It's impossible with only one visit", correct: false },
      { id: "d", label: "Flip them one at a time quickly", correct: false },
    ],
    reward: { coins: 30, xp: 65 },
    mapPosition: { x: 50, y: 1 },
  },
];

// Onboarding missions (simpler, tutorial-style)
export const onboardingMissions: Mission[] = [
  {
    id: "onb01",
    title: "Tap the Stars!",
    type: "pattern",
    zone: "arrival",
    difficulty: 1,
    question: "Nova found some stars! Which one is the biggest? ⭐",
    options: [
      { id: "a", label: "The big gold star ⭐", correct: true },
      { id: "b", label: "The tiny dot ·", correct: false },
      { id: "c", label: "The moon 🌙", correct: false },
    ],
    reward: { coins: 3, xp: 5 },
    mapPosition: { x: 50, y: 50 },
  },
  {
    id: "onb02",
    title: "Pick a Color",
    type: "spatial",
    zone: "arrival",
    difficulty: 1,
    question: "Nova's spacesuit needs a color! Which one do you like?",
    options: [
      { id: "a", label: "🔵 Cosmic Blue", correct: true },
      { id: "b", label: "🟢 Galaxy Green", correct: true },
      { id: "c", label: "🟣 Nebula Purple", correct: true },
      { id: "d", label: "🔴 Rocket Red", correct: true },
    ],
    reward: { coins: 3, xp: 5 },
    mapPosition: { x: 50, y: 50 },
  },
  {
    id: "onb03",
    title: "Your First Pattern",
    type: "pattern",
    zone: "arrival",
    difficulty: 1,
    question: "What comes next? 🟡 🟡 🔵 🟡 🟡 ?",
    hint: "The blue ball appears every 3rd spot!",
    options: [
      { id: "a", label: "🔵", correct: true },
      { id: "b", label: "🟡", correct: false },
      { id: "c", label: "🟢", correct: false },
    ],
    reward: { coins: 5, xp: 10 },
    mapPosition: { x: 50, y: 50 },
  },
];

export const getMissionsByZone = (zone: MissionZone) =>
  missionBank.filter((m) => m.zone === zone);

export const getMissionById = (id: string) =>
  [...missionBank, ...onboardingMissions].find((m) => m.id === id);

export const getNextMission = (completedIds: string[]): Mission | null => {
  return missionBank.find((m) => !completedIds.includes(m.id)) || null;
};
