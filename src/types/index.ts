export type EntityType =
  | "PERSON"
  | "PHONE"
  | "VEHICLE"
  | "ACCOUNT"
  | "LOCATION"
  | "CASE"
  | "ORGANIZATION"
  | "EVENT";

export type RelationshipType =
  | "CONTACTED"
  | "USED_BY"
  | "OWNS"
  | "PAYS"
  | "RECEIVES"
  | "APPEARS_IN"
  | "VISITED"
  | "ASSOCIATED_WITH"
  | "MEETS"
  | "PARTICIPATES_IN";

export type EvidenceStatus = "OBSERVED" | "INFERRED" | "MULTI-SOURCE";
export type AlertStatus = "NEW" | "UNDER_REVIEW" | "REVIEWED" | "DISMISSED";
export type CaseStatus = "Active" | "Under Review" | "Closed";

export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  properties: Record<string, string>;
  cases: string[];
  networkImportance: "Low" | "Medium" | "High";
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  evidence: EvidenceRecord;
  confidence: number;
  status: EvidenceStatus;
}

export interface EvidenceRecord {
  id: string;
  source: string;
  recordId: string;
  timestamp: string;
  confidence: number;
  status: EvidenceStatus;
  sources?: string[];
}

export interface EvidenceItem {
  id: string;
  source: string;
  entity: string;
  entityType: EntityType;
  relationship: string;
  relationshipType: RelationshipType;
  timestamp: string;
  confidence: number;
  status: EvidenceStatus;
  recordId: string;
  caseId: string;
  details: string;
}

export interface Case {
  id: string;
  name: string;
  date: string;
  location: string;
  persons: number;
  relationships: number;
  status: CaseStatus;
  lastUpdated: string;
  description: string;
}

export interface Alert {
  id: string;
  type: string;
  entity: string;
  reason: string;
  confidence: number;
  evidenceCount: number;
  createdTime: string;
  status: AlertStatus;
  details: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  entity: string;
  entityType: EntityType;
  description: string;
  source: string;
  caseId: string;
  lat?: number;
  lng?: number;
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  entities: string[];
  cases: string[];
  events: TimelineEvent[];
}

export interface DashboardStats {
  totalCases: number;
  persons: number;
  phones: number;
  vehicles: number;
  accounts: number;
  relationships: number;
  alerts: number;
}

export interface SearchResult {
  entity: Entity;
  relationships: Relationship[];
  relatedCases: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  records: number;
  status: "uploaded" | "validated" | "normalized" | "entities_extracted" | "relationships_created" | "graph_updated" | "complete";
}

export interface Report {
  id: string;
  caseId: string;
  generatedAt: string;
  content: string;
}

export interface NetworkStats {
  relationshipsByType: { name: string; value: number }[];
  casesByMonth: { name: string; value: number }[];
  entityDistribution: { name: string; value: number }[];
  activityOverTime: { name: string; value: number }[];
}
