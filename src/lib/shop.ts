export type ShopProduct = {
  id: string;
  name: string;
  type: string;
  price: string;
  description: string;
  details: string[];
  mockup: string;
  checkoutUrl: string;
};

export const shopProducts: ShopProduct[] = [
  {
    id: "field-cap",
    name: "Low Tide field cap",
    type: "Six-panel field cap",
    price: "$34",
    description: "A low-profile cotton cap for early launches, pier checks, and long walks beside the water.",
    details: ["Washed navy cotton", "Low Tide Lab mark", "Adjustable brass clasp"],
    mockup: "/mockups/low-tide-field-cap.svg",
    checkoutUrl: "mailto:hello@lowtidelab.dev?subject=Low%20Tide%20field%20cap",
  },
  {
    id: "deck-patch",
    name: "Deck signal patch",
    type: "Embroidered hook-and-loop patch",
    price: "$12",
    description: "A small mission patch for the bag, jacket, or instrument case that goes everywhere with you.",
    details: ["2.5 inch embroidered patch", "Hook backing", "Deep-water signal colors"],
    mockup: "/mockups/deck-signal-patch.svg",
    checkoutUrl: "mailto:hello@lowtidelab.dev?subject=Deck%20signal%20patch",
  },
];
