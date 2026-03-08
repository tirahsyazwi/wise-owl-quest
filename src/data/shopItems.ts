export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "owl-outfit" | "spaceship";
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const shopItems: ShopItem[] = [
  // ── OWL OUTFITS ──
  {
    id: "owl-astronaut",
    name: "Astronaut Suit",
    description: "A shiny spacesuit for Nova!",
    price: 30,
    category: "owl-outfit",
    emoji: "🧑‍🚀",
    rarity: "common",
  },
  {
    id: "owl-detective",
    name: "Detective Hat",
    description: "A magnifying glass and hat for mystery missions",
    price: 50,
    category: "owl-outfit",
    emoji: "🕵️",
    rarity: "common",
  },
  {
    id: "owl-wizard",
    name: "Wizard Robes",
    description: "Magical robes that shimmer with stardust",
    price: 80,
    category: "owl-outfit",
    emoji: "🧙",
    rarity: "rare",
  },
  {
    id: "owl-pirate",
    name: "Space Pirate",
    description: "Arrr! A cosmic pirate hat and eyepatch",
    price: 60,
    category: "owl-outfit",
    emoji: "🏴‍☠️",
    rarity: "common",
  },
  {
    id: "owl-ninja",
    name: "Stealth Ninja",
    description: "Silent and swift — a ninja outfit for Nova",
    price: 100,
    category: "owl-outfit",
    emoji: "🥷",
    rarity: "rare",
  },
  {
    id: "owl-superhero",
    name: "Superhero Cape",
    description: "A flowing cape that sparkles with cosmic energy",
    price: 150,
    category: "owl-outfit",
    emoji: "🦸",
    rarity: "epic",
  },
  {
    id: "owl-robot",
    name: "Mecha Armor",
    description: "Transform Nova into a powerful mecha owl!",
    price: 200,
    category: "owl-outfit",
    emoji: "🤖",
    rarity: "epic",
  },
  {
    id: "owl-galaxy",
    name: "Galaxy Form",
    description: "Nova becomes one with the cosmos itself",
    price: 500,
    category: "owl-outfit",
    emoji: "🌌",
    rarity: "legendary",
  },

  // ── SPACESHIP CUSTOMIZATIONS ──
  {
    id: "ship-flames",
    name: "Flame Thrusters",
    description: "Fiery exhaust trails behind your ship",
    price: 40,
    category: "spaceship",
    emoji: "🔥",
    rarity: "common",
  },
  {
    id: "ship-rainbow",
    name: "Rainbow Trail",
    description: "Leave a beautiful rainbow in your wake",
    price: 70,
    category: "spaceship",
    emoji: "🌈",
    rarity: "rare",
  },
  {
    id: "ship-stealth",
    name: "Stealth Hull",
    description: "A sleek dark hull that blends with space",
    price: 90,
    category: "spaceship",
    emoji: "🛸",
    rarity: "rare",
  },
  {
    id: "ship-crystal",
    name: "Crystal Wings",
    description: "Gleaming crystal wings that refract starlight",
    price: 120,
    category: "spaceship",
    emoji: "💎",
    rarity: "epic",
  },
  {
    id: "ship-nebula",
    name: "Nebula Engine",
    description: "An engine powered by condensed nebula gas",
    price: 160,
    category: "spaceship",
    emoji: "🌀",
    rarity: "epic",
  },
  {
    id: "ship-star",
    name: "Star Cruiser",
    description: "The ultimate ship — forged from a dying star",
    price: 400,
    category: "spaceship",
    emoji: "⭐",
    rarity: "legendary",
  },
];

export const rarityColors: Record<ShopItem["rarity"], string> = {
  common: "hsl(220, 10%, 70%)",
  rare: "hsl(210, 80%, 60%)",
  epic: "hsl(280, 70%, 60%)",
  legendary: "hsl(45, 95%, 58%)",
};

export const rarityBgColors: Record<ShopItem["rarity"], string> = {
  common: "hsl(220, 10%, 70%, 0.12)",
  rare: "hsl(210, 80%, 60%, 0.12)",
  epic: "hsl(280, 70%, 60%, 0.12)",
  legendary: "hsl(45, 95%, 58%, 0.12)",
};
