export type DeepSeaCreature = {
  commonName: string;
  scientificName: string;
  depth: string;
  zone: string;
  fieldNote: string;
};

export const deepSeaCreatures: DeepSeaCreature[] = [
  {
    commonName: "Vampire squid",
    scientificName: "Vampyroteuthis infernalis",
    depth: "600–900 m",
    zone: "Oxygen minimum zone",
    fieldNote: "It turns its webbed arms inside out when threatened, presenting a dark, spined silhouette instead of a cloud of ink.",
  },
  {
    commonName: "Dumbo octopus",
    scientificName: "Grimpoteuthis species",
    depth: "400–7,000 m",
    zone: "Abyssal seafloor",
    fieldNote: "Fin-like ears propel this deep-living octopus above the seafloor, where it searches for worms and small crustaceans.",
  },
  {
    commonName: "Barreleye fish",
    scientificName: "Macropinna microstoma",
    depth: "Mesopelagic Pacific",
    zone: "Twilight zone",
    fieldNote: "Its transparent head reveals tubular eyes that can rotate upward to spot silhouettes overhead, then forward while feeding.",
  },
  {
    commonName: "Giant isopod",
    scientificName: "Bathynomus giganteus",
    depth: "170–2,140 m",
    zone: "Western Atlantic seafloor",
    fieldNote: "A relative of pill bugs, it can go long stretches between meals in the food-scarce deep sea.",
  },
  {
    commonName: "Yeti crab",
    scientificName: "Kiwa tyleri",
    depth: "Around 2,600 m",
    zone: "Antarctic hydrothermal vents",
    fieldNote: "Dense bristles on its arms host bacteria near vent fluids, in one of the most crowded deep-sea habitats known.",
  },
  {
    commonName: "Giant phantom jelly",
    scientificName: "Stygiomedusa gigantea",
    depth: "Open ocean below the surface",
    zone: "Midwater",
    fieldNote: "Four long oral arms trail beneath its bell; unlike many jellies, it does not have the familiar ring of stinging tentacles.",
  },
  {
    commonName: "Black dragonfish",
    scientificName: "Idiacanthus atlanticus",
    depth: "Mesopelagic to bathypelagic",
    zone: "Twilight and midnight zones",
    fieldNote: "Light-producing organs help this predator signal and hunt where sunlight no longer reaches.",
  },
];

export function getDailyCreature(date = new Date()): DeepSeaCreature {
  const dayNumber = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  return deepSeaCreatures[((dayNumber % deepSeaCreatures.length) + deepSeaCreatures.length) % deepSeaCreatures.length];
}
