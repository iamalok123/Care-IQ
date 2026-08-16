import { Router, Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { verificationItemSchema } from '../schemas/zodSchemas';

const router = Router();

// GET /api/verification-items
router.get('/', (req: Request, res: Response) => {
  const patientId = req.query.patient_id as string | undefined;
  const journeyId = req.query.journey_id as string | undefined;

  const items = dataRepository.getVerificationItems(patientId, journeyId);
  res.json({
    success: true,
    data: items,
    meta: { total: items.length }
  });
});

// POST /api/verification-items/:id/resolve
router.post('/:id/resolve', (req: Request, res: Response) => {
  const item = dataRepository.resolveVerificationItem(req.params.id as string);
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: 'Verification item not found' }
    });
  }

  res.json({
    success: true,
    data: item
  });
});

// POST /api/verification-items
router.post('/', (req: Request, res: Response) => {
  const parsed = verificationItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') }
    });
  }

  const newItem = {
    ...parsed.data,
    id: parsed.data.id || `ver-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  dataRepository.addVerificationItem(newItem as any);

  res.status(201).json({
    success: true,
    data: newItem
  });
});

export default router;
