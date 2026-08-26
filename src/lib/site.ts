export const INTAKE_URL = "https://tally.so/r/gDPYa4";

export const ORG = {
  name: "TECH-UP Rural-Digital Empowerment NPC",
  shortName: "TECH-UP",
  tagline: "Bridging Rural Gaps Through Digital Opportunity",
  email: "info@techup.org.za",
  websiteLabel: "www.techup.org.za",
  websiteUrl: "https://www.techup.org.za",
  registrationNumber: "K2026577450",
  location: "Rustenburg Local Municipality, North West Province, South Africa",
  status: "Active Non-Profit Company (NPC)",
} as const;

export const DIRECTORS = [
  { name: "Onnalenna Molothlekgi", photo: null },
  { name: "Keamogetswe Soma", photo: "keamogetswe-soma" },
  { name: "Kgatoentle Chimoya", photo: "kgatoentle-chimoya" },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "What We Do", href: "#what-we-do" },
  { label: "Tertiary Support", href: "#tertiary-support" },
  { label: "Leadership", href: "#leadership" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

export const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
