import { Router } from 'express';
import { aiController } from '../controllers/aiController';

const router = Router();

// POST /api/ai/explain
router.post('/explain', (req, res) => aiController.explain(req, res));

// POST /api/ai/questions
router.post('/questions', (req, res) => aiController.generateQuestions(req, res));

// POST /api/ai/rag/query
router.post('/rag/query', (req, res) => aiController.queryRag(req, res));

// POST /api/ai/coverage-confidence
router.post('/coverage-confidence', (req, res) => aiController.getCoverageConfidence(req, res));

// POST /api/ai/stage-guidance
router.post('/stage-guidance', (req, res) => aiController.getStageGuidance(req, res));

export default router;


