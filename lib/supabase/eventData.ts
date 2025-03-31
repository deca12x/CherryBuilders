// Current active events for profile creation/editing
export const CURRENT_EVENTS = [
  {
    slug: "eth_bucharest_2025",
    name: "ETHBucharest 2025",
  },
  {
    slug: "eth_taipei_2025",
    name: "ETHGlobal Taipei 2025",
  },
] as const;

// Get the type of current event slugs from the constant
type CurrentEventSlug = (typeof CURRENT_EVENTS)[number]["slug"];

// Helper functions
export const getCurrentEventSlugs = () =>
  CURRENT_EVENTS.map((event) => event.slug);

export const isCurrentEvent = (slug: CurrentEventSlug) =>
  getCurrentEventSlugs().includes(slug);
