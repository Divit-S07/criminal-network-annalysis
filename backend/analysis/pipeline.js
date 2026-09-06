// analysis/pipeline.js
import { fileExtractionAdapter } from '../extraction/adapter.js';
import { cleanDocument, cleanCsvRecords } from '../preprocessing/clean.js';
import { detectRecordType } from '../preprocessing/normalize.js';
import { geminiExtractEntitiesRelationships } from '../ai/gemini.js';
import { computeGraphAnalytics } from './graphAnalytics.js';
import { generateAlerts } from './alerts.js';

export async function runAnalysisPipeline(jobId, sourceFiles, userId, { caseId, caseName } = {}) {
  return { success: true, jobId };
}
