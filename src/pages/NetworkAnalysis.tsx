
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import cytoscape, { type Core, type EventObject } from "cytoscape";

import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RefreshCw,
  Search,
  Filter,
  X,
  Phone,
  Car,
  CreditCard,
  MapPin,
  Briefcase,
  Users,
  AlertTriangle,
  Eye,
  Network,
  Upload,
} from "lucide-react";

import { useData } from "@/context/DataContext";
import type { Entity, Relationship, Alert } from "@/types";

// ─────────────────────────────────────────────
// Color scheme
// ─────────────────────────────────────────────

const typeColors: Record<string, string> = {
  PERSON: "#22d3ee",
  PHONE: "#a78bfa",
  VEHICLE: "#34d399",
  ACCOUNT: "#fbbf24",
  LOCATION: "#f87171",
  CASE: "#818cf8",
  ORGANIZATION: "#fb923c",
  EVENT: "#e879f9",
};

// ─────────────────────────────────────────────
// Entity icons
// ─────────────────────────────────────────────

const typeIcons: Record<string, typeof Users> = {
  PERSON: Users,
  PHONE: Phone,
  VEHICLE: Car,
  ACCOUNT: CreditCard,
  LOCATION: MapPin,
  CASE: Briefcase,
};

// ─────────────────────────────────────────────
// Entity Panel
// ─────────────────────────────────────────────

function EntityPanel({
  entity,
  relationships,
  allEntities,
  onClose,
  onNavigate,
}: {
  entity: Entity | null;
  relationships: Relationship[];
  allEntities: Entity[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  if (!entity) return null;

  const getEntityLabel = (id: string) => {
    const e = allEntities.find((n) => n.id === id);
    return e ? e.label : id;
  };

  const getEntityType = (id: string) => {
    const e = allEntities.find((n) => n.id === id);
    return e ? e.type : "";
  };

  const relByType = relationships.filter(
    (r) => r.source === entity.id || r.target === entity.id
  );

  return (
    <div className="flex h-full w-80 flex-col border-l border-white/[0.06] bg-[#0e0f14]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{
              backgroundColor: typeColors[entity.type] || "#666",
            }}
          />

          <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
            {entity.type}
          </span>
        </div>

        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/60"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {/* Name */}
        <h3 className="text-sm font-semibold text-white/90">
          {entity.label}
        </h3>

        <p className="mt-0.5 text-[11px] text-white/30">
          ID: {entity.id}
        </p>

        {/* Properties */}
        <div className="mt-4 space-y-2">
          {Object.entries(entity.properties || {}).map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between gap-3 text-[11px]"
            >
              <span className="text-white/30 capitalize">
                {k}
              </span>

              <span className="break-all text-right text-white/60">
                {String(v)}
              </span>
            </div>
          ))}
        </div>

        {/* Cases */}
        <div className="mt-5">
          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
            Cases
          </h4>

          <div className="space-y-1">
            {(entity.cases || []).map((c) => (
              <div
                key={c}
                className="rounded-md bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/50"
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Network Importance */}
        <div className="mt-5">
          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
            Network Importance
          </h4>

          <span
            className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${
              entity.networkImportance === "High"
                ? "bg-cyan-500/10 text-cyan-400"
                : entity.networkImportance === "Medium"
                ? "bg-amber-500/10 text-amber-400"
                : "bg-white/[0.05] text-white/40"
            }`}
          >
            {entity.networkImportance}
          </span>
        </div>

        {/* Relationships */}
        <div className="mt-5">
          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
            Relationships ({relByType.length})
          </h4>

          <div className="space-y-1.5">
            {relByType.map((r) => {
              const otherId =
                r.source === entity.id ? r.target : r.source;

              const otherType = getEntityType(otherId);

              return (
                <button
                  key={r.id}
                  onClick={() => onNavigate(otherId)}
                  className="flex w-full items-center gap-2 rounded-md bg-white/[0.03] px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        typeColors[otherType] || "#666",
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] text-white/60">
                      {getEntityLabel(otherId)}
                    </div>

                    <div className="text-[10px] text-white/25">
                      {r.type}
                    </div>
                  </div>

                  <div className="text-[10px] text-white/20">
                    {r.confidence}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence summary */}
        <div className="mt-5">
          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
            Evidence
          </h4>

          <div className="rounded-md bg-white/[0.03] px-3 py-2">
            <div className="text-xs text-white/50">
              {relByType.length} supporting records
            </div>

            <div className="mt-1 flex gap-2 text-[10px]">
              <span className="text-cyan-400/60">
                {
                  relByType.filter(
                    (r) => r.status === "OBSERVED"
                  ).length
                }{" "}
                observed
              </span>

              <span className="text-amber-400/60">
                {
                  relByType.filter(
                    (r) => r.status === "INFERRED"
                  ).length
                }{" "}
                inferred
              </span>

              <span className="text-green-400/60">
                {
                  relByType.filter(
                    (r) => r.status === "MULTI-SOURCE"
                  ).length
                }{" "}
                multi-source
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-2">
          <a
            href="/app/evidence"
            className="flex flex-1 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[10px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/60"
          >
            View Evidence
          </a>

          <a
            href="/app/timeline"
            className="flex flex-1 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[10px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/60"
          >
            View Timeline
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-5 rounded-md border border-white/[0.04] bg-white/[0.01] p-2.5">
          <p className="text-[10px] leading-relaxed text-white/20">
            These are investigative leads, not criminality verdicts.
            All relationships require investigator interpretation.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Network Page
// ─────────────────────────────────────────────

export default function NetworkAnalysis() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [selectedEntity, setSelectedEntity] =
    useState<Entity | null>(null);

  const [selectedRels, setSelectedRels] = useState<
    Relationship[]
  >([]);

  const [allNodes, setAllNodes] = useState<Entity[]>([]);
  const [allEdges, setAllEdges] = useState<Relationship[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchQ, setSearchQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [relTypeFilter, setRelTypeFilter] = useState("");

  const [selectedRel, setSelectedRel] =
    useState<Relationship | null>(null);

  const [showConnectors, setShowConnectors] =
    useState(false);

  const [connectorAlerts, setConnectorAlerts] =
    useState<Alert[]>([]);

  const [searchParams] = useSearchParams();

  const {
    entities,
    relationships,
    alerts,
    findConnectors,
    hasData,
  } = useData();

  // ─────────────────────────────────────────────
  // Sync graph data
  // ─────────────────────────────────────────────

  useEffect(() => {
    console.log("Network data:", {
      entities,
      relationships,
      alerts,
      hasData,
    });

    setAllNodes(Array.isArray(entities) ? entities : []);
    setAllEdges(
      Array.isArray(relationships) ? relationships : []
    );

    setLoading(false);
  }, [entities, relationships, alerts, hasData]);

  // ─────────────────────────────────────────────
  // Build Cytoscape
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (
      loading ||
      !containerRef.current ||
      allNodes.length === 0
    ) {
      return;
    }

    // Destroy previous graph before creating a new one
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    const elements: cytoscape.ElementDefinition[] = [];

    // ─────────────────────────────────────────────
    // Add nodes
    // ─────────────────────────────────────────────

    const nodeIds = new Set<string>();

    allNodes.forEach((n) => {
      if (!n?.id) return;

      nodeIds.add(n.id);

      elements.push({
        data: {
          id: n.id,
          label: n.label || n.id,
          type: n.type || "UNKNOWN",
          importance: n.networkImportance || "Low",
        },

        classes: (n.type || "unknown").toLowerCase(),
      });
    });

    // ─────────────────────────────────────────────
    // Add ONLY valid edges
    //
    // This prevents the Cytoscape crash:
    //
    // Can not create edge ... with nonexistent target
    // ─────────────────────────────────────────────

    let skippedRelationships = 0;

    allEdges.forEach((r) => {
      if (!r?.id || !r.source || !r.target) {
        skippedRelationships++;
        return;
      }

      const sourceExists = nodeIds.has(r.source);
      const targetExists = nodeIds.has(r.target);

      if (!sourceExists || !targetExists) {
        skippedRelationships++;

        console.warn(
          "Skipping invalid relationship:",
          {
            relationshipId: r.id,
            source: r.source,
            target: r.target,
            sourceExists,
            targetExists,
          }
        );

        return;
      }

      elements.push({
        data: {
          id: r.id,
          source: r.source,
          target: r.target,
          label: r.type || "ASSOCIATED_WITH",
          confidence: r.confidence ?? 0,
          status: r.status || "OBSERVED",
        },

        classes: `edge ${String(
          r.status || "OBSERVED"
        )
          .toLowerCase()
          .replace("-", "")}`,
      });
    });

    if (skippedRelationships > 0) {
      console.warn(
        `Network graph skipped ${skippedRelationships} invalid relationship(s).`
      );
    }

    // ─────────────────────────────────────────────
    // Create Cytoscape
    // ─────────────────────────────────────────────

    let cy: Core;

    try {
      cy = cytoscape({
        container: containerRef.current,

        elements,

        style: [
          {
            selector: "node",

            style: {
              label: "data(label)",

              "background-color": (
                ele: cytoscape.NodeSingular
              ) =>
                typeColors[ele.data("type")] || "#666",

              width: (
                ele: cytoscape.NodeSingular
              ) =>
                ele.data("importance") === "High"
                  ? 28
                  : ele.data("importance") === "Medium"
                  ? 22
                  : 16,

              height: (
                ele: cytoscape.NodeSingular
              ) =>
                ele.data("importance") === "High"
                  ? 28
                  : ele.data("importance") === "Medium"
                  ? 22
                  : 16,

              color: "rgba(255,255,255,0.6)",

              "font-size": "9px",

              "text-valign": "bottom",

              "text-margin-y": 4,

              "text-outline-color": "#0a0b10",

              "text-outline-width": 2,

              "border-width": 0,

              opacity: 0.85,
            },
          },

          {
            selector: "node.highlighted",

            style: {
              "border-width": 2,
              "border-color": "#22d3ee",
              opacity: 1,
            },
          },

          {
            selector: "node.dimmed",

            style: {
              opacity: 0.1,
            },
          },

          {
            selector: "node.connector",

            style: {
              "border-width": 2,
              "border-color": "#fbbf24",
              opacity: 1,
            },
          },

          {
            selector: "edge",

            style: {
              width: 1,

              "line-color": "rgba(255,255,255,0.08)",

              "curve-style": "bezier",

              opacity: 0.5,
            },
          },

          {
            selector: "edge.highlighted",

            style: {
              "line-color": "#22d3ee",
              width: 2,
              opacity: 0.8,
            },
          },

          {
            selector: "edge.dimmed",

            style: {
              opacity: 0.05,
            },
          },
        ],

        // Use grid first for stability.
        // You can change this back to cose later.
        layout: {
          name: "grid",
          animate: true,
          animationDuration: 500,
        },

        minZoom: 0.2,
        maxZoom: 3,

        // Use Cytoscape's default wheel sensitivity.
        // This removes the warning from the original code.
      });
    } catch (error) {
      console.error(
        "Failed to create Cytoscape graph:",
        error
      );

      return;
    }

    cyRef.current = cy;

    // ─────────────────────────────────────────────
    // Node click
    // ─────────────────────────────────────────────

    cy.on(
      "tap",
      "node",
      (evt: EventObject) => {
        const node = evt.target;
        const id = node.id();

        const entity = allNodes.find(
          (n) => n.id === id
        );

        if (!entity) return;

        setSelectedEntity(entity);

        const rels = allEdges.filter(
          (r) =>
            r.source === id ||
            r.target === id
        );

        setSelectedRels(rels);

        const connected = new Set<string>([id]);

        rels.forEach((r) => {
          connected.add(r.source);
          connected.add(r.target);
        });

        cy.elements().removeClass(
          "highlighted dimmed"
        );

        cy.elements().forEach((ele) => {
          if (connected.has(ele.id())) {
            ele.addClass("highlighted");
          } else {
            ele.addClass("dimmed");
          }
        });
      }
    );

    // ─────────────────────────────────────────────
    // Edge click
    // ─────────────────────────────────────────────

    cy.on(
      "tap",
      "edge",
      (evt: EventObject) => {
        const edge = evt.target;

        const rel = allEdges.find(
          (r) => r.id === edge.id()
        );

        if (!rel) return;

        setSelectedRel(rel);
        setSelectedEntity(null);

        const srcNode =
          cy.getElementById(rel.source);

        const tgtNode =
          cy.getElementById(rel.target);

        cy.elements().removeClass(
          "highlighted dimmed connector"
        );

        srcNode.addClass("highlighted");
        tgtNode.addClass("highlighted");

        edge.addClass("highlighted");

        cy.elements().forEach((ele) => {
          if (
            ele.id() !== rel.source &&
            ele.id() !== rel.target &&
            ele.id() !== rel.id
          ) {
            ele.addClass("dimmed");
          }
        });
      }
    );

    // ─────────────────────────────────────────────
    // Background click
    // ─────────────────────────────────────────────

    cy.on(
      "tap",
      (evt: EventObject) => {
        if (evt.target === cy) {
          setSelectedEntity(null);
          setSelectedRel(null);
          setSelectedRels([]);

          cy.elements().removeClass(
            "highlighted dimmed connector"
          );
        }
      }
    );

    // ─────────────────────────────────────────────
    // URL entity parameter
    // ─────────────────────────────────────────────

    const entityParam =
      searchParams.get("entity");

    if (entityParam) {
      const entity = allNodes.find(
        (n) => n.id === entityParam
      );

      if (entity) {
        setTimeout(() => {
          const node =
            cy.getElementById(entityParam);

          if (node.length) {
            node.emit("tap");

            cy.animate(
              {
                center: {
                  eles: node,
                },

                zoom: 1.5,
              },
              {
                duration: 400,
              }
            );
          }
        }, 500);
      }
    }

    // ─────────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────────

    return () => {
      cy.destroy();

      if (cyRef.current === cy) {
        cyRef.current = null;
      }
    };
  }, [
    loading,
    allNodes,
    allEdges,
    searchParams,
  ]);

  // ─────────────────────────────────────────────
  // Type filter
  // ─────────────────────────────────────────────

  useEffect(() => {
    const cy = cyRef.current;

    if (!cy) return;

    if (!typeFilter) {
      cy.nodes().removeClass(
        "dimmed highlighted"
      );

      cy.edges().removeClass(
        "dimmed highlighted"
      );

      return;
    }

    cy.elements().forEach((ele: any) => {
      if (ele.isNode()) {
        const match =
          ele.data("type") === typeFilter;

        ele.toggleClass(
          "dimmed",
          !match
        );

        ele.toggleClass(
          "highlighted",
          match
        );
      } else {
        ele.addClass("dimmed");
      }
    });
  }, [typeFilter]);

  // ─────────────────────────────────────────────
  // Search filter
  // ─────────────────────────────────────────────

  useEffect(() => {
    const cy = cyRef.current;

    if (!cy) return;

    if (!searchQ.trim()) {
      cy.elements().removeClass(
        "dimmed highlighted"
      );

      return;
    }

    const q = searchQ.toLowerCase();

    cy.elements().forEach((ele) => {
      const label = String(
        ele.data("label") || ""
      ).toLowerCase();

      const id = String(
        ele.id() || ""
      ).toLowerCase();

      const match =
        label.includes(q) ||
        id.includes(q);

      ele.toggleClass(
        "highlighted",
        match
      );

      ele.toggleClass(
        "dimmed",
        !match
      );
    });
  }, [searchQ]);

  // ─────────────────────────────────────────────
  // Relationship filter
  // ─────────────────────────────────────────────

  useEffect(() => {
    const cy = cyRef.current;

    if (!cy) return;

    if (!relTypeFilter) {
      cy.edges().removeClass(
        "dimmed highlighted"
      );

      return;
    }

    cy.edges().forEach((edge) => {
      const match =
        edge.data("label") ===
        relTypeFilter;

      edge.toggleClass(
        "highlighted",
        match
      );

      edge.toggleClass(
        "dimmed",
        !match
      );
    });
  }, [relTypeFilter]);

  // ─────────────────────────────────────────────
  // Find connectors
  // ─────────────────────────────────────────────

  const handleFindConnectors =
    useCallback(() => {
      const cy = cyRef.current;

      if (!cy) return;

      const connectors =
        findConnectors();

      const connectorAlertList =
        alerts.filter(
          (a) =>
            a.type ===
            "Potential Cross-Network Connector"
        );

      setConnectorAlerts(
        connectorAlertList
      );

      cy.elements().removeClass(
        "highlighted dimmed connector"
      );

      const connectorIds = new Set(
        connectors.map((c) => c.id)
      );

      cy.elements().forEach((ele) => {
        if (
          ele.isNode() &&
          connectorIds.has(ele.id())
        ) {
          ele.addClass("connector");
        } else {
          ele.addClass("dimmed");
        }
      });

      setShowConnectors(true);
    }, [
      findConnectors,
      alerts,
    ]);

  // ─────────────────────────────────────────────
  // Navigate to entity
  // ─────────────────────────────────────────────

  const handleNavigate =
    useCallback((id: string) => {
      const cy = cyRef.current;

      if (!cy) return;

      const node =
        cy.getElementById(id);

      if (!node.length) {
        console.warn(
          "Entity does not exist in graph:",
          id
        );

        return;
      }

      node.emit("tap");

      cy.animate(
        {
          center: {
            eles: node,
          },

          zoom: 1.5,
        },
        {
          duration: 400,
        }
      );
    }, []);

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xs text-white/30">
          Loading network graph...
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Empty graph
  // ─────────────────────────────────────────────

  if (
    !hasData &&
    allNodes.length === 0
  ) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md text-center">
          <Network className="mx-auto mb-3 size-8 text-white/15" />

          <h2 className="text-sm font-semibold text-white/70">
            Network is empty
          </h2>

          <p className="mt-2 text-[11px] leading-relaxed text-white/30">
            Upload investigation records to
            build the relationship graph.
            Entities and relationships are
            generated from your files.
          </p>

          <a
            href="/app/upload"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
          >
            <Upload className="size-3" />
            Upload data
          </a>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Main UI
  // ─────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* Main graph */}
      <div className="relative flex-1">

        {/* Toolbar */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">

          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 px-2.5 py-1.5">
            <Search className="size-3 text-white/30" />

            <input
              type="text"
              placeholder="Search entity..."
              value={searchQ}
              onChange={(e) =>
                setSearchQ(e.target.value)
              }
              className="w-36 bg-transparent text-[11px] text-white/70 placeholder:text-white/20 outline-none"
            />
          </div>

          {/* Entity type filter */}
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 px-2 py-1">
            <Filter className="size-3 text-white/30" />

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
              className="bg-transparent text-[11px] text-white/60 outline-none"
            >
              <option
                value=""
                className="bg-[#14151c]"
              >
                All types
              </option>

              {Object.keys(typeColors).map(
                (t) => (
                  <option
                    key={t}
                    value={t}
                    className="bg-[#14151c]"
                  >
                    {t}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Relationship filter */}
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 px-2 py-1">
            <select
              value={relTypeFilter}
              onChange={(e) =>
                setRelTypeFilter(
                  e.target.value
                )
              }
              className="bg-transparent text-[11px] text-white/60 outline-none"
            >
              <option
                value=""
                className="bg-[#14151c]"
              >
                All relationships
              </option>

              {[
                "CONTACTED",
                "USED_BY",
                "OWNS",
                "PAYS",
                "RECEIVES",
                "VISITED",
                "MEETS",
                "ASSOCIATED_WITH",
              ].map((t) => (
                <option
                  key={t}
                  value={t}
                  className="bg-[#14151c]"
                >
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Connector */}
          <button
            onClick={
              handleFindConnectors
            }
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            <AlertTriangle className="size-3" />
            Find Connectors
          </button>
        </div>

        {/* Zoom controls */}
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-1">

          <button
            onClick={() => {
              const cy = cyRef.current;

              if (!cy || !containerRef.current)
                return;

              cy.zoom({
                level: cy.zoom() * 1.3,
                renderedPosition: {
                  x:
                    containerRef.current
                      .offsetWidth / 2,
                  y:
                    containerRef.current
                      .offsetHeight / 2,
                },
              });
            }}
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 text-white/40 transition-colors hover:text-white/70"
          >
            <ZoomIn className="size-3.5" />
          </button>

          <button
            onClick={() => {
              const cy = cyRef.current;

              if (!cy || !containerRef.current)
                return;

              cy.zoom({
                level: cy.zoom() / 1.3,
                renderedPosition: {
                  x:
                    containerRef.current
                      .offsetWidth / 2,
                  y:
                    containerRef.current
                      .offsetHeight / 2,
                },
              });
            }}
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 text-white/40 transition-colors hover:text-white/70"
          >
            <ZoomOut className="size-3.5" />
          </button>

          <button
            onClick={() =>
              cyRef.current?.fit(
                undefined,
                40
              )
            }
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 text-white/40 transition-colors hover:text-white/70"
          >
            <Maximize className="size-3.5" />
          </button>

          <button
            onClick={() => {
              const cy =
                cyRef.current;

              if (!cy) return;

              cy.elements().removeClass(
                "highlighted dimmed connector"
              );

              setSelectedEntity(null);
              setSelectedRel(null);
              setSelectedRels([]);
              setShowConnectors(false);

              cy.layout({
                name: "grid",
                animate: true,
              }).run();
            }}
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 text-white/40 transition-colors hover:text-white/70"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 px-3 py-2.5">

          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
            Entity Types
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            {Object.entries(
              typeColors
            )
              .slice(0, 6)
              .map(([type, color]) => (
                <div
                  key={type}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor:
                        color,
                    }}
                  />

                  <span className="text-[10px] text-white/40">
                    {type.toLowerCase()}
                  </span>
                </div>
              ))}
          </div>

          <div className="mt-2 border-t border-white/[0.06] pt-1.5 text-[10px] text-white/20">
            Click node to inspect · Drag
            to pan · Scroll to zoom
          </div>
        </div>

        {/* Cytoscape */}
        <div
          ref={containerRef}
          className="size-full bg-[#0a0b10]"
        />
      </div>

      {/* Entity panel */}
      <EntityPanel
        entity={selectedEntity}
        relationships={selectedRels}
        allEntities={allNodes}
        onClose={() => {
          setSelectedEntity(null);
          setSelectedRels([]);

          cyRef.current?.elements().removeClass(
            "highlighted dimmed connector"
          );
        }}
        onNavigate={handleNavigate}
      />

      {/* Relationship detail */}
      {selectedRel &&
        !selectedEntity && (
          <div className="flex h-full w-80 flex-col border-l border-white/[0.06] bg-[#0e0f14]">

            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                Relationship
              </span>

              <button
                onClick={() => {
                  setSelectedRel(null);

                  cyRef.current?.elements().removeClass(
                    "highlighted dimmed connector"
                  );
                }}
                className="text-white/30 hover:text-white/60"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-4 py-4">

              <div className="space-y-3 text-center">

                <div className="rounded-lg bg-white/[0.03] p-2 text-xs text-white/60">
                  {allNodes.find(
                    (n) =>
                      n.id ===
                      selectedRel.source
                  )?.label ||
                    selectedRel.source}
                </div>

                <div className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/60">
                  {selectedRel.type}
                </div>

                <div className="rounded-lg bg-white/[0.03] p-2 text-xs text-white/60">
                  {allNodes.find(
                    (n) =>
                      n.id ===
                      selectedRel.target
                  )?.label ||
                    selectedRel.target}
                </div>
              </div>

              <div className="mt-6 space-y-3">

                <div className="flex justify-between gap-3 text-[11px]">
                  <span className="text-white/30">
                    Source
                  </span>

                  <span className="text-right text-white/60">
                    {selectedRel.evidence?.source ||
                      "Unknown"}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-[11px]">
                  <span className="text-white/30">
                    Evidence ID
                  </span>

                  <span className="text-right text-white/60">
                    {selectedRel.evidence
                      ?.recordId ||
                      "Unknown"}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-[11px]">
                  <span className="text-white/30">
                    Timestamp
                  </span>

                  <span className="text-right text-white/60">
                    {selectedRel.evidence
                      ?.timestamp
                      ? new Date(
                          selectedRel
                            .evidence
                            .timestamp
                        ).toLocaleString(
                          "en-IN"
                        )
                      : "Unknown"}
                  </span>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-white/30">
                    Confidence
                  </span>

                  <span className="text-white/60">
                    {selectedRel.confidence}%
                  </span>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-white/30">
                    Status
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      selectedRel.status ===
                      "MULTI-SOURCE"
                        ? "bg-green-500/10 text-green-400"
                        : selectedRel.status ===
                          "OBSERVED"
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {selectedRel.status}
                  </span>
                </div>

                {selectedRel.evidence
                  ?.sources && (
                  <div>
                    <div className="mb-1 text-[10px] text-white/30">
                      Sources
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {selectedRel.evidence.sources.map(
                        (s) => (
                          <span
                            key={s}
                            className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/40"
                          >
                            {s}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-md border border-white/[0.04] bg-white/[0.01] p-2.5">
                <p className="text-[10px] leading-relaxed text-white/20">
                  View Source Record —
                  every relationship must
                  be presented as
                  evidence-backed information.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Connector alerts */}
      {showConnectors && (
        <div className="absolute bottom-20 left-1/2 z-20 w-96 max-w-[90vw] -translate-x-1/2">

          <div className="rounded-xl border border-amber-500/20 bg-[#14151c] p-4 shadow-2xl">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />

                <span className="text-xs font-medium text-amber-400">
                  Potential Cross-Network
                  Connectors
                </span>
              </div>

              <button
                onClick={() =>
                  setShowConnectors(false)
                }
                className="text-white/30 hover:text-white/60"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2">

              {connectorAlerts.length ===
                0 && (
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-[11px] text-white/30">
                  No potential cross-network
                  connectors found.
                </div>
              )}

              {connectorAlerts.map(
                (alert) => {
                  const entity =
                    allNodes.find(
                      (n) =>
                        n.id ===
                        alert.entity
                    );

                  return (
                    <div
                      key={alert.id}
                      className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                    >
                      <div className="text-xs font-medium text-white/70">
                        {entity?.label ||
                          alert.entity}
                      </div>

                      <div className="mt-1 text-[11px] text-white/40">
                        {alert.reason}
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-[10px] text-white/25">
                        <span>
                          {alert.confidence}%
                          confidence
                        </span>

                        <span>
                          {alert.evidenceCount}{" "}
                          records
                        </span>
                      </div>

                      <div className="mt-2">
                        <button
                          onClick={() =>
                            handleNavigate(
                              alert.entity
                            )
                          }
                          className="flex items-center gap-1 text-[10px] text-cyan-400/60 hover:text-cyan-400"
                        >
                          <Eye className="size-3" />
                          View in graph
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <p className="mt-2 text-[9px] text-white/15">
              These are investigative leads,
              not criminality verdicts. Further
              analysis is required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

