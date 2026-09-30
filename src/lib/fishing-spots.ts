export type FishingSpot = {
  id: string;
  name: string;
  region: string;
  community: string;
  coordinates: { latitude: number; longitude: number };
  species: string[];
  style: string;
  approach: string;
  waterNote: string;
  mapUrl: string;
  levelUrl?: string;
};

const azgfdMap = "https://fishandboataz.azgfd.com/";

export const fishingSpots: FishingSpot[] = [
  {
    id: "upper-lake-mary",
    name: "Upper Lake Mary",
    region: "Flagstaff lakes",
    community: "Flagstaff",
    coordinates: { latitude: 34.94, longitude: -111.47 },
    species: ["Northern pike", "Walleye", "Largemouth bass", "Catfish"],
    style: "Large high-country reservoir",
    approach: "Work weed edges and points for warmwater fish. Wind can push bait to a shoreline; switch to protected coves when gusts build.",
    waterNote: "Upper Lake Mary levels vary with seasonal runoff and drought. Check current access and regulations before heading out.",
    mapUrl: azgfdMap,
  },
  {
    id: "fool-hollow",
    name: "Fool Hollow Lake",
    region: "White Mountains",
    community: "Show Low",
    coordinates: { latitude: 34.22, longitude: -110.02 },
    species: ["Rainbow trout", "Largemouth bass", "Channel catfish"],
    style: "Forest lake with shore and boat access",
    approach: "Try small lures or bait near points and accessible shoreline. Check the trout stocking schedule for the latest planting week.",
    waterNote: "AZGFD publishes a lake-level camera for Fool Hollow; verify the latest level, ramp, and campground conditions before travel.",
    mapUrl: azgfdMap,
    levelUrl: "https://azgfd.jefulleralert.com/foolhollow/",
  },
  {
    id: "big-lake",
    name: "Big Lake",
    region: "White Mountains",
    community: "Apache-Sitgreaves National Forest",
    coordinates: { latitude: 33.86, longitude: -109.41 },
    species: ["Brook trout", "Cutthroat trout", "Rainbow trout"],
    style: "High-elevation trout fishery",
    approach: "Start with light line and small presentations. Cover shorelines early, then look for cooler, wind-protected water as the day warms.",
    waterNote: "A high-country destination with seasonal weather and access changes. Confirm road, campground, and lake conditions before driving in.",
    mapUrl: azgfdMap,
    levelUrl: "https://azgfd.jefulleralert.com/biglake/",
  },
  {
    id: "woods-canyon",
    name: "Woods Canyon Lake",
    region: "Mogollon Rim",
    community: "Rim Lakes Recreation Area",
    coordinates: { latitude: 34.33, longitude: -110.93 },
    species: ["Brown trout", "Rainbow trout", "Tiger trout"],
    style: "Small forest lake",
    approach: "A good lake for methodical shoreline laps. Try compact spinners, small spoons, or trout bait, and adjust depth before changing locations.",
    waterNote: "Popular with families and anglers; facilities and access are seasonal. Check the forest service status before making the trip.",
    mapUrl: azgfdMap,
  },
  {
    id: "willow-springs",
    name: "Willow Springs Lake",
    region: "Mogollon Rim",
    community: "Rim Lakes Recreation Area",
    coordinates: { latitude: 34.32, longitude: -110.99 },
    species: ["Rainbow trout", "Tiger trout"],
    style: "Large Rim lake",
    approach: "Cover open shoreline with small moving lures, then slow down with bait or flies if fish are cruising near the surface.",
    waterNote: "A popular cold-water fishery. Check current road, campground, and stocking information before heading up the Rim.",
    mapUrl: azgfdMap,
  },
  {
    id: "lees-ferry",
    name: "Lees Ferry",
    region: "Colorado River",
    community: "Glen Canyon National Recreation Area",
    coordinates: { latitude: 36.86, longitude: -111.59 },
    species: ["Rainbow trout"],
    style: "Tailwater river fishery",
    approach: "A technical trout reach. Small nymphs and streamers are common starting points; drift boat conditions and flows matter more than air temperature alone.",
    waterNote: "Special regulations apply on this rainbow trout reach. Check current Glen Canyon flows, access notices, and Arizona regulations before fishing.",
    mapUrl: azgfdMap,
    levelUrl: "https://www.usbr.gov/uc/water/crsp/cs/gcd.html",
  },
  {
    id: "lake-powell",
    name: "Lake Powell · Arizona side",
    region: "Colorado River",
    community: "Page",
    coordinates: { latitude: 36.99, longitude: -111.49 },
    species: ["Striped bass", "Smallmouth bass", "Largemouth bass", "Walleye"],
    style: "Vast desert reservoir",
    approach: "Scan for bait and surface activity before choosing a pattern. Rocky points and coves give bass anglers a useful starting structure.",
    waterNote: "The shoreline, launch access, and ramp availability shift with reservoir elevation. Check current Bureau of Reclamation and marina notices.",
    mapUrl: azgfdMap,
    levelUrl: "https://www.usbr.gov/uc/water/crsp/cs/gcd.html",
  },
];

export const defaultFishingSpot = fishingSpots[0];
