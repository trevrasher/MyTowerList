
export type Tower = {
  id: number;
  name: string;
  difficulty: number;
  creators: Creator[];
  floors: number;
  area: string;
  score: number;
  type: 'tower' | 'mini_tower' | 'steeple' | 'citadel';
  diff_category: string;
};

export type Creator = {
  name: string;
  roblox_user_id: number | null;
  avatar_url: string | null;
};

export const areas = [
  'Ring 0', 'Ring 1', 'Ring 2', 'Ring 3', 'Ring 4', 'Ring 5', 'Ring 6', 'Ring 7', 'Ring 8', 'Ring 9',
  'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9', 'Zone 10',
  'Arcane Area', 'Steelspire Horizon', 'Ashen Towerworks', 'Forgotten Ridge', 'Garden of Eeshöl', 'Lost River',
  'Paradise Atoll', 'Silent Abyss', 'The Starlit Archives'
];

export const areaAcronyms: { [key: string]: string } = {
  "Ring 0": "R0",
  "Ring 1": "R1",
  "Ring 2": "R2",
  "Ring 3": "R3",
  "Ring 4": "R4",
  "Ring 5": "R5",
  "Ring 6": "R6",
  "Ring 7": "R7",
  "Ring 8": "R8",
  "Ring 9": "R9",
  "Zone 1": "Z1",
  "Zone 2": "Z2",
  "Zone 3": "Z3",
  "Zone 4": "Z4",
  "Zone 5": "Z5",
  "Zone 6": "Z6",
  "Zone 7": "Z7",
  "Zone 8": "Z8",
  "Zone 9": "Z9",
  "Zone 10": "Z10",
  "Arcane Area": "AA",
  "Ashen Towerworks": "AT",
  "Forgotten Ridge": "FR",
  "Garden of Eeshöl": "GoE",
  "Lost River": "LR",
  "Paradise Atoll": "PA",
  "Silent Abyss": "SA",
  "The Starlit Archives": "TSA",
  "Steelspire Horizon": "SsH"
};

export const diffColors: { [key: string]: string } = {
  easy: "#59b338ff",
  medium: "#c5c502ff",
  hard: "#b17000ff",
  difficult: "#cc3e3eff",
  challenging: "#720000ff",
  intense: "#000000",
  remorseless: "#a70096ff",
  insane: "#0000FF",
  extreme: "#0389FF",
  terrifying: "#00b4b4ff",
  catastrophic: "#FFFFFF"
};

export function getTowerImageUrl(towerName: string) {
  const fileName = towerName.replace(/ /g, "_") + ".webp";

  return `https://raw.githubusercontent.com/trevrasher/MyTowerList/refs/heads/master/assets/tower_thumbnails/${fileName}`;
}

export function getTowerAreaImage(towerArea: string) {
  const fileName = towerArea.replace(/ /g, "").replace(/ö/g, "o") + ".webp";
  return `https://raw.githubusercontent.com/trevrasher/MyTowerList/refs/heads/master/assets/area_thumbnails/${fileName}`;
}

export function getTowerDifficultyWord(tower: Tower) {
  const decimalStr = tower.difficulty.toString().split(".")[1] || "0";
  const decimalPart = parseFloat("0." + decimalStr);
  if (decimalPart >= 0.00 && decimalPart <= 0.15) return "Bot";
  if (decimalPart >= 0.16 && decimalPart <= 0.35) return "Low";
  if (decimalPart >= 0.36 && decimalPart <= 0.6) return "Mid";
  if (decimalPart >= 0.61 && decimalPart <= 0.8) return "High";
  if (decimalPart >= 0.81 && decimalPart <= 0.99) return "Peak";
  return "";
}

export function getTowerAreaBanner(towerArea: string) {
  const fileName = towerArea.replace(/ /g, "").replace(/ö/g, "o") + ".png";
  return `https://raw.githubusercontent.com/trevrasher/MyTowerList/refs/heads/master/assets/area_banners/${fileName}`;
}

export function redirectToTower(
  towerName: string,
  router: { push: (href: string) => void }
) {
  const slug = encodeURIComponent(towerName);
  router.push(`/towers/${slug}`);
}

export type SortState = 'scoreUp' | 'scoreDown' | 'difficultyUp' | 'difficultyDown';