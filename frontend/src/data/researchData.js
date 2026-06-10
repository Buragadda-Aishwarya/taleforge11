
export const appConfig = {
  navLinks: [
    { label: "Documentation", href: "#" },
    { label: "Resources", href: "#" },
    { label: "Nexus Research", href: "#" }
  ],
  suggestions: [
    "Ancient Rome",
    "Cybernetic Biology",
    "FTL Travel Ethics",
    "Victorian Esotericism"
  ],
  bottomNavTabs: [
    { id: "manuscript", label: "Manuscript", icon: "PenLine" },
    { id: "lore", label: "Lore", icon: "BookOpen" },
    { id: "nexus", label: "Nexus", icon: "Network" },
    { id: "engine", label: "Engine", icon: "Cpu" },
    { id: "profile", label: "Profile", icon: "UserCircle" }
  ]
};

export const mockResearchData = {
  id: "req_123",
  query: "Logistics of a Martian Colony",
  summary: {
    title: "Roman Praetorian Logistics",
    paragraph: "The Praetorian Guard operated not just, but specialized military intelligence and logistical hub within the Roman Empire. Their supply chains were prioritized over standard legions, utilizing the Cursus Publicus—the state-run courier and transportation service.",
    keyFindings: [
      "Stationary camps (Castra Praetoria) featured advanced granaries capable of holding two years of emergency rations.",
      "Direct administrative control over imperial naval shipments ensured consistent grain and luxury goods delivery."
    ]
  },
  timeline: [
    { year: "27 BC", label: "Formation", subLabel: "Augustus Establishes", isCore: false },
    { year: "23 AD", label: "Consolidation", subLabel: "Sejanus' Influence", isCore: true },
    { year: "193 AD", label: "Crisis", subLabel: "Auctioning Throne", isCore: false },
    { year: "312 AD", label: "Disband", subLabel: "Constantine I", isCore: false }
  ],
  impact: {
    character: {
        title: "Character Concept",
        description: "\"Marcus Aurelius Varrus: A logistics officer who predicts a coup through food supply anomalies.\""
    },
    worldRule: {
        title: "World Rule",
        description: "\"The Imperial Courier Tax: Every major city must provide fresh horses or face military sanction.\""
    }
  },
  sources: [
    { name: "The Praetorian Guard: A History", institution: "Oxford Academy, 2019", isWeb: false },
    { name: "Military Supply Chains of Rome", institution: "Digital Archives", isWeb: true }
  ],
  contextModes: [
    "Equestrian Class", "Grain Trade", "Ostia Port", "Tiber River", "Secret Service"
  ]
};
