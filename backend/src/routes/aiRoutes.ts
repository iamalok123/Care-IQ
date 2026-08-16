import { Router, Request, Response } from 'express';
import { aiExplanationEngine } from '../services/aiExplanationEngine';
import { dataRepository } from '../services/dataRepository';
import { matchingEngine } from '../services/matchingEngine';

const router = Router();

// POST /api/ai/explain
router.post('/explain', (req: Request, res: Response) => {
  const { hospital_id, policy_id, patient_name } = req.body;

  const hospital = dataRepository.getHospitalById(hospital_id);
  if (!hospital) {
    return res.status(404).json({
      success: false,
      error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital not found' }
    });
  }

  const matches = matchingEngine.matchHospitals({
    city: hospital.city,
    policyId: policy_id
  });

  const currentMatch = matches.find((m) => m.hospital.id === hospital_id) || matches[0];
  const explanation = aiExplanationEngine.explainHospitalMatch(currentMatch, patient_name || 'the patient');

  res.json({
    success: true,
    data: explanation
  });
});

// POST /api/ai/questions
router.post('/questions', (req: Request, res: Response) => {
  const { hospital_name, insurer_name, stage, is_room_exceeded } = req.body;

  const questions = aiExplanationEngine.generateQuestionsToAsk({
    hospitalName: hospital_name || 'the hospital',
    insurerName: insurer_name,
    stage: stage,
    isRoomExceeded: is_room_exceeded
  });

  res.json({
    success: true,
    data: questions
  });
});

export default router;
