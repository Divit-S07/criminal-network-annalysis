// controllers/analysisController.js

export const ANALYSIS_STAGES = [
  'validation',
  'extraction',
  'cleaning',
  'normalization',
  'json_generation',
  'ai_analysis',
  'completed',
];

const jobsMap = new Map();

export async function startAnalysis(req, res) {
  const jobId = `job_${Date.now()}`;
  const caseId = req.body?.caseId || `CASE-${Date.now().toString().slice(-4)}`;
  
  const job = {
    jobId,
    status: 'completed',
    progress: { stage: 'completed', percent: 100, message: 'Analysis complete' },
    caseId,
    createdAt: new Date().toISOString(),
  };

  jobsMap.set(jobId, job);
  res.status(202).json({ success: true, data: { jobId, caseId, stages: ANALYSIS_STAGES } });
}

export async function getJob(req, res) {
  const job = jobsMap.get(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, error: 'Analysis job not found' });
  res.json({ success: true, data: job });
}

export async function getJobResults(req, res) {
  const job = jobsMap.get(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, error: 'Analysis job not found' });
  res.json({ success: true, data: { caseId: job.caseId, entities: [], relationships: [] } });
}
