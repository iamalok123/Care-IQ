import { Request, Response } from 'express';
import { aiExplanationEngine } from '../services/aiExplanationEngine';
import { dataRepository } from '../services/dataRepository';
import { matchingEngine } from '../services/matchingEngine';
import { documentRagEngine } from '../services/documentRagEngine';

export class AiController {
  // POST /api/ai/explain
  public explain(req: Request, res: Response): void {
    const { hospital_id, policy_id, patient_name } = req.body;

    const hospital = dataRepository.getHospitalById(hospital_id);
    if (!hospital) {
      res.status(404).json({
        success: false,
        error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital not found' }
      });
      return;
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
  }

  // POST /api/ai/questions
  public generateQuestions(req: Request, res: Response): void {
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
  }

  // POST /api/ai/rag/query
  public queryRag(req: Request, res: Response): void {
    const { query, policy_id } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Please provide a valid question or query string' }
      });
      return;
    }

    const ragResponse = documentRagEngine.queryPolicyRAG(query, policy_id);

    res.json({
      success: true,
      data: ragResponse
    });
  }

  // POST /api/ai/coverage-confidence
  public getCoverageConfidence(req: Request, res: Response): void {
    const { policy_id, hospital_id, patient_id, is_network_cashless, has_room_mismatch, is_preauth_pending, has_consumables_verified } = req.body;

    const confidence = aiExplanationEngine.calculateCoverageConfidence({
      policyId: policy_id,
      hospitalId: hospital_id,
      patientId: patient_id,
      isNetworkCashless: is_network_cashless,
      hasRoomMismatch: has_room_mismatch,
      isPreauthPending: is_preauth_pending,
      hasConsumablesVerified: has_consumables_verified
    });

    res.json({
      success: true,
      data: confidence
    });
  }
}

export const aiController = new AiController();

