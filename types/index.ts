export interface Profile {
  id: string;
  stellar_address: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Observation {
  id: string;
  observer_id: string;
  location: { lat: number; lng: number };
  latitude: number;
  longitude: number;
  observed_at: string;
  // Appearance
  cap_shape: string | null;
  cap_color: string | null;
  cap_size_cm: number | null;
  cap_surface: string | null;
  underside_type: UndersideType | null;
  underside_color: string | null;
  underside_spacing: string | null;
  gill_attachment: string | null;
  stem_color: string | null;
  stem_height_cm: number | null;
  stem_hollow: boolean | null;
  stem_ring: boolean | null;
  flesh_color: string | null;
  bruise_color: string | null;
  // Smell
  smell: string | null;
  // Advanced appearance
  cap_margin: string | null;
  stem_shape: string | null;
  stem_surface: string | null;
  stem_base: string | null;
  has_volva: boolean | null;
  flesh_consistency: string | null;
  color_change: string | null;
  has_latex: boolean | null;
  latex_color: string | null;
  taste: string | null;
  // Environment
  substrate: string | null;
  habitat: string | null;
  growth_pattern: GrowthPattern | null;
  // Advanced environment
  ecological_role: string | null;
  associated_trees: string | null;
  season: string | null;
  // Spore print
  spore_print_color: string | null;
  // Identification
  proposed_species: string | null;
  confidence: Confidence | null;
  notes: string | null;
  // Status
  status: ObservationStatus;
  verified_species: string | null;
  // Meta
  created_at: string;
  updated_at: string;
  // On-chain / IPFS
  ipfs_metadata_cid?: string | null;
  ipfs_photo_cids?: string[];
  nft_asset_code?: string | null;
  nft_tx_hash?: string | null;
  // Joined
  photos?: ObservationPhoto[];
  observer?: Profile;
  comments?: Comment[];
}

export interface ObservationPhoto {
  id: string;
  observation_id: string;
  storage_path: string;
  photo_type: PhotoType;
  sort_order: number;
  created_at: string;
}

export interface Comment {
  id: string;
  observation_id: string;
  author_id: string;
  body: string;
  comment_type: CommentType;
  suggested_species: string | null;
  created_at: string;
  author?: Profile;
}

export type UndersideType = "gills" | "pores" | "teeth" | "smooth";
export type GrowthPattern = "alone" | "cluster" | "ring" | "scattered";
export type Confidence = "guess" | "somewhat" | "pretty_sure" | "no_idea";
export type ObservationStatus = "unverified" | "discussing" | "community_id" | "unknown";
export type PhotoType = "cap_top" | "underside" | "stem" | "cross_section" | "habitat" | "other";
export type CommentType = "discussion" | "agree" | "disagree" | "suggest";

// Flagging
export type FlagReason =
  | "inappropriate_content"
  | "spam"
  | "wrong_content"
  | "duplicate"
  | "misleading_id"
  | "low_quality"
  | "other";

export type FlagStatus = "pending" | "reviewed_valid" | "reviewed_dismissed";

export interface Flag {
  id: string;
  observation_id: string;
  flagger_id: string;
  reason: FlagReason;
  details: string | null;
  status: FlagStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  flagger?: Profile;
}

export const FLAG_REASONS = [
  "inappropriate_content",
  "spam",
  "wrong_content",
  "duplicate",
  "misleading_id",
  "low_quality",
  "other",
] as const;

export const CAP_SHAPES = [
  "convex", "flat", "conical", "bell-shaped", "funnel", "umbonate",
  "depressed", "irregular", "spherical",
] as const;

export const CAP_SURFACES = [
  "smooth", "scaly", "fibrous", "sticky", "dry", "hairy", "wrinkled",
] as const;

export const SUBSTRATES = [
  "soil", "dead wood", "living tree", "leaf litter", "dung",
  "mulch", "grass", "moss", "other",
] as const;

export const HABITATS = [
  "deciduous forest", "coniferous forest", "mixed forest", "grassland",
  "garden", "park", "wetland", "roadside", "urban", "other",
] as const;

export const SMELLS = [
  "none", "mushroomy", "anise", "almond", "fishy", "foul",
  "chemical", "fruity", "garlic", "other",
] as const;

// Advanced dropdown options
export const CAP_MARGINS = [
  "entire", "undulate", "striate", "involute", "revolute",
  "lobulate", "fimbriate", "dentate",
] as const;

export const GILL_ATTACHMENTS = [
  "free", "adnate", "decurrent", "sinuate", "subdecurrent",
] as const;

export const GILL_SPACINGS = [
  "crowded", "spaced", "distant",
] as const;

export const STEM_SHAPES = [
  "cylindrical", "clavate", "bulbous", "fusiform", "ventricose",
] as const;

export const STEM_SURFACES = [
  "smooth", "fibrillose", "striate", "reticulate", "scaly", "pruinose",
] as const;

export const STEM_BASES = [
  "equal", "bulbous", "radicating", "with_volva", "with_rhizomorphs",
] as const;

export const FLESH_CONSISTENCIES = [
  "firm", "fragile", "elastic", "spongy", "fibrous", "waxy",
] as const;

export const COLOR_CHANGES = [
  "none", "bluing", "reddening", "blackening", "yellowing", "browning",
] as const;

export const TASTES = [
  "mild", "bitter", "acrid", "floury", "none",
] as const;

export const ECOLOGICAL_ROLES = [
  "mycorrhizal", "saprotrophic", "parasitic",
] as const;

export const SEASONS = [
  "spring", "summer", "autumn", "winter", "year_round",
] as const;

export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  cap_top: "Cap (top view)",
  underside: "Underside (gills/pores)",
  stem: "Stem",
  cross_section: "Cross section",
  habitat: "Habitat / surroundings",
  other: "Other",
};

export const STATUS_LABELS: Record<ObservationStatus, string> = {
  unverified: "Unverified",
  discussing: "Under Discussion",
  community_id: "Community ID",
  unknown: "Unknown",
};

export const STATUS_COLORS: Record<ObservationStatus, string> = {
  unverified: "#9CA3AF",
  discussing: "#F59E0B",
  community_id: "#10B981",
  unknown: "#8B5CF6",
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  guess: "Just a guess",
  somewhat: "Somewhat confident",
  pretty_sure: "Pretty sure",
  no_idea: "No idea",
};
