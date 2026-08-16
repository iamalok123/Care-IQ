import { Router } from 'express';
import { scenarioController } from '../controllers/scenarioController';

const router = Router();

// GET /api/scenarios
router.get('/', (req, res) => scenarioController.listScenarios(req, res));

// GET /api/scenarios/:id
router.get('/:id', (req, res) => scenarioController.getScenarioById(req, res));

// POST /api/scenarios/:id/load
router.post('/:id/load', (req, res) => scenarioController.loadScenario(req, res));

export default router;
