// controllers/networkController.js — graph + analytics for the Cytoscape frontend

export async function getNetwork(req, res) {
  res.json({
    success: true,
    data: {
      nodes: [],
      edges: [],
      alerts: [],
      analytics: {
        totalNodes: 0,
        totalEdges: 0,
        density: 0,
        centralEntities: [],
        bridgeEntities: [],
      },
    },
  });
}
