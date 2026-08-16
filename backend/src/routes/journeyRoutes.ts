import { Router } from 'express';
import { journeyController } from '../controllers/journeyController';

const router = Router();

// GET /api/journeys
router.get('/', (req, res) => journeyController.getJourneys(req, res));

// GET /api/journeys/:id
router.get('/:id', (req, res) => journeyController.getJourneyById(req, res));

// POST /api/journeys
router.post('/', (req, res) => journeyController.createJourney(req, res));

// POST /api/journeys/:id/events
router.post('/:id/events', (req, res) => journeyController.recordEvent(req, res));

export default router;
