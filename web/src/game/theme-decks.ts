interface ThemeDeck {
  name: string;
  deck: number[];
  cover: number;
  description: string;
}

export const Basic: ThemeDeck = {
  name: "Basic",
  description: "A variety of useful cards.",
  cover: 17,
  deck: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25,
  ],
};

export const HeavyHitters: ThemeDeck = {
  name: "Heavy Hitters",
  description: "Some of the hardest hitting cards out there.",
  cover: 11,
  deck: [
    32, 32, 29, 29, 11, 11, 15, 16, 25, 25, 10, 10, 6, 7, 9, 9, 20, 20, 2, 2, 4,
    4, 19, 19, 18,
  ],
};

export const OrganizedCrime: ThemeDeck = {
  name: "Organized Crime",
  description: "Rival gangs bring the heat.",
  cover: 21,
  deck: [
    38, 38, 39, 39, 40, 40, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 27, 28,
    28, 31, 31, 30, 30, 32,
  ],
};

export const RoeGeneration: ThemeDeck = {
  name: "Roe Generation",
  description: "Where it all began.",
  cover: 2,
  deck: [
    1, 1, 2, 2, 33, 33, 34, 34, 35, 35, 36, 36, 37, 37, 41, 42, 42, 43, 18, 18,
    19, 19, 20, 3, 3,
  ],
};

const decks: ThemeDeck[] = [Basic, HeavyHitters, OrganizedCrime, RoeGeneration];

export default decks;
