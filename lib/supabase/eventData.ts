// Current active events for profile creation/editing
export const ALL_EVENTS = [
  {
    slug: "edge_city_lanna_2024",
    name: "Edge City Lanna 2024",
  },
  {
    slug: "aleph_march_2025",
    name: "Aleph March 2025",
  },
  {
    slug: "eth_warsaw_spring_2025",
    name: "ETHWarsaw Spring Hack 2025",
  },
  {
    slug: "eth_bucharest_2025",
    name: "ETHBucharest 2025",
  },
  {
    slug: "eth_dublin_2025",
    name: "ETHDublin 2025",
  },
  {
    slug: "eth_belgrade_2025",
    name: "ETHBelgrade 2025",
  },
] as const;

// Get the type of current event slugs from the constant
type CurrentEventSlug = (typeof ALL_EVENTS)[number]["slug"];

// Helper functions
export const getCurrentEventSlugs = () => ALL_EVENTS.map((event) => event.slug);

export const isCurrentEvent = (slug: CurrentEventSlug) =>
  getCurrentEventSlugs().includes(slug);
