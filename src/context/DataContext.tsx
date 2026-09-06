import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type {
  Case, Entity, Relationship, EvidenceItem, Alert, TimelineEvent, Location,
  DashboardStats, SearchResult,
} from "@/types";
import {
  extractFileContentLocally,
  generateStructuredJson,
  sendStructuredJsonToGemini,
} from "@/lib/localExtraction";

// ── Context shape ──
interface DataCtx {
  cases: Case[];
  entities: Entity[];
  relationships: Relationship[];
  evidence: EvidenceItem[];
  alerts: Alert[];
  timeline: TimelineEvent[];
  locations: Location[];
  hasData: boolean;
  stats: DashboardStats;
  processUpload: (fileInput: File | File[], category: string) => Promise<void>;
  updateAlertStatus: (id: string, status: Alert["status"]) => void;
  searchEntities: (query: string) => SearchResult[];
  findConnectors: () => Entity[];
  loadSampleData: () => void;
  resetData: () => void;
}

const DataContext = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<Case[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const stateRef = useRef({ cases, entities, relationships, evidence, alerts, timeline, locations });
  useEffect(() => {
    stateRef.current = { cases, entities, relationships, evidence, alerts, timeline, locations };
  }, [cases, entities, relationships, evidence, alerts, timeline, locations]);

  // Process single or multiple uploaded files as ONE investigation
  const processUpload = useCallback(async (fileInput: File | File[], _category: string) => {
    const files = Array.isArray(fileInput) ? fileInput : [fileInput];
    if (files.length === 0) return;

    // 1. Local extraction & reading of all uploaded files
    const extractedFilesData = [];
    for (const f of files) {
      const extracted = await extractFileContentLocally(f);
      extractedFilesData.push(extracted);
    }

    // 2. Generate structured JSON locally (No original files sent to Gemini)
    const structuredJson = generateStructuredJson(extractedFilesData);
console.log('[Info] Sending structured data to AI, size:', JSON.stringify(structuredJson).length, 'bytes');

    // 3. Send ONLY structured JSON to Gemini AI (or local analysis engine fallback)
    const payload = await sendStructuredJsonToGemini(structuredJson);

    // Ensure IDs are unique for this specific upload batch to avoid collisions with previous uploads
    const suffix = `_U${Date.now()}`;
    const pCase = { ...payload.case, id: payload.case.id + suffix };
    
    const pEntities = payload.entities.map((e) => ({
      ...e,
      id: e.id + suffix,
      cases: e.cases.map((c) => c + suffix),
    }));
    
    const pRelationships = payload.relationships.map((r) => ({
      ...r,
      id: r.id + suffix,
      source: r.source + suffix,
      target: r.target + suffix,
      evidence: r.evidence ? { ...r.evidence, id: r.evidence.id + suffix } : r.evidence,
    }));
    
    const pEvidence = payload.evidence.map((ev) => ({
      ...ev,
      id: ev.id + suffix,
      entity: ev.entity + suffix,
      relationship: ev.relationship + suffix,
      caseId: ev.caseId + suffix,
    }));
    
    const pAlerts = payload.alerts.map((a) => ({
      ...a,
      id: a.id + suffix,
      entity: a.entity + suffix,
    }));
    
    const pTimeline = payload.timeline.map((t) => ({
      ...t,
      id: t.id + suffix,
      entity: t.entity + suffix,
      caseId: t.caseId + suffix,
    }));
    
    const pLocations = payload.locations.map((l) => ({
      ...l,
      id: l.id + suffix,
      entities: l.entities.map((e) => e + suffix),
      cases: l.cases.map((c) => c + suffix),
    }));

    // 4. Append current investigation results to the previous ones
    setCases((prev) => [...prev, pCase]);
    setEntities((prev) => [...prev, ...pEntities]);
    setRelationships((prev) => [...prev, ...pRelationships]);
    setEvidence((prev) => [...prev, ...pEvidence]);
    setAlerts((prev) => [...prev, ...pAlerts]);
    setTimeline((prev) => [...prev, ...pTimeline]);
    setLocations((prev) => [...prev, ...pLocations]);
  }, []);

  const updateAlertStatus = useCallback((id: string, status: Alert["status"]) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const searchEntities = useCallback(
    (query: string): SearchResult[] => {
      const q = query.toLowerCase();
      return entities
        .filter((e) => e.id.toLowerCase().includes(q) || e.label.toLowerCase().includes(q) || Object.values(e.properties).some((v) => v.toLowerCase().includes(q)))
        .map((entity) => ({
          entity,
          relationships: relationships.filter((r) => r.source === entity.id || r.target === entity.id),
          relatedCases: entity.cases,
        }));
    },
    [entities, relationships]
  );

  const findConnectors = useCallback((): Entity[] => {
    const degree = new Map<string, number>();
    relationships.forEach((r) => {
      degree.set(r.source, (degree.get(r.source) || 0) + 1);
      degree.set(r.target, (degree.get(r.target) || 0) + 1);
    });
    return entities.filter((e) => e.type === "PERSON" && ((degree.get(e.id) || 0) >= 2 || e.cases.length >= 2));
  }, [entities, relationships]);

  const loadSampleData = useCallback(() => {
    // Clean reset as sample mock data is removed per requirements
    setCases([]);
    setEntities([]);
    setRelationships([]);
    setEvidence([]);
    setAlerts([]);
    setTimeline([]);
    setLocations([]);
  }, []);

  const resetData = useCallback(() => {
    setCases([]);
    setEntities([]);
    setRelationships([]);
    setEvidence([]);
    setAlerts([]);
    setTimeline([]);
    setLocations([]);
  }, []);

  const stats: DashboardStats = {
    totalCases: cases.length,
    persons: entities.filter((e) => e.type === "PERSON").length,
    phones: entities.filter((e) => e.type === "PHONE").length,
    vehicles: entities.filter((e) => e.type === "VEHICLE").length,
    accounts: entities.filter((e) => e.type === "ACCOUNT").length,
    relationships: relationships.length,
    alerts: alerts.filter((a) => a.status === "NEW").length,
  };

  const value: DataCtx = {
    cases, entities, relationships, evidence, alerts, timeline, locations,
    hasData: entities.length > 0 && relationships.length > 0,
    stats,
    processUpload, updateAlertStatus, searchEntities, findConnectors, loadSampleData, resetData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}