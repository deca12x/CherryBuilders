// Current active events for profile creation/editing
export const ALL_EVENTS = [
  {
    slug: "edge_city_lanna_2024",
    name: "Edge City Lanna 2024",
    // Promotional fields
    title: "Edge City Lanna - past",
    url: "",
    image: "",
    alt: "",
    active: false,
  },
  {
    slug: "eth_bucharest_2025",
    name: "ETHBucharest 2025",
    // Promotional fields
    title: "ETH Bucharest - past",
    url: "",
    image: "",
    alt: "",
    active: false,
  },
  {
    slug: "eth_dublin_2025",
    name: "ETHDublin 2025",
    // Promotional fields
    title: "ETHDublin - past",
    url: "",
    image: "",
    alt: "",
    active: false,
  },
  {
    slug: "eth_belgrade_2025",
    name: "ETHBelgrade 2025",
    // Promotional fields
    title: "ETHBelgrade 2025 - past",
    url: "",
    image: "",
    alt: "",
    active: false,
  },
  {
    slug: "celo_proofofship_2025",
    name: "Celo Proof of Ship 2025",
    // Promotional fields
    title: "Proof of Ship - monthly online",
    url: "https://celoplatform.notion.site/Proof-of-Ship-17cd5cb803de8060ba10d22a72b549f8",
    image: "/images/eventDialogProofOfShip.png",
    alt: "Proof of Ship event promotion",
    active: true,
  },
  {
    slug: "mantle_cookathon_2025",
    name: "Mantle Cookathon 2025",
    // Promotional fields
    title: "Cookathon - monthly online",
    url: "https://www.cookathon.dev/",
    image: "/images/eventDialogCookathon.png",
    alt: "Cookathon event promotion",
    active: true,
  },
  {
    slug: "eth_rome_2025",
    name: "ETHRome 2025",
    // Promotional fields
    title: "ETHRome - Oct 17-19",
    url: "https://www.ethrome.org/",
    image: "/images/eventDialogRome.png",
    alt: "ETH Rome event promotion",
    active: true,
  },
  {
    slug: "eth_warsaw_2025",
    name: "ETHWarsaw 2025",
    // Promotional fields
    title: "ETHWarsaw - Sep 5-7",
    url: "https://www.ethwarsaw.dev/",
    image: "/images/eventDialogWarsaw.png",
    alt: "ETH Warsaw event promotion",
    active: true,
  },
  {
    slug: "aleph_2025",
    name: "Aleph 2025",
    // Promotional fields
    title: "Aleph Hackathon - Aug 29-31",
    url: "https://alephhackathon.notion.site/",
    image: "/images/eventDialogAleph2.png",
    alt: "Aleph Hackathon event promotion",
    active: true,
  },
] as const;

// Get the type of current event slugs from the constant
type CurrentEventSlug = (typeof ALL_EVENTS)[number]["slug"];

// Helper functions
export const getCurrentEventSlugs = () => ALL_EVENTS.map((event) => event.slug);

export const isCurrentEvent = (slug: CurrentEventSlug) =>
  getCurrentEventSlugs().includes(slug);

// Helper function to get events with promotional data
export const getPromotionalEvents = () =>
  ALL_EVENTS.filter((event) => event.title && event.url && event.image);

// Helper function to get active events
export const getActiveEvents = () => ALL_EVENTS.filter((event) => event.active);
