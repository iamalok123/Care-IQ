import { Request, Response } from 'express';
import { aiExplanationEngine } from '../services/aiExplanationEngine';
import { dataRepository } from '../services/dataRepository';
import { matchingEngine } from '../services/matchingEngine';
import { documentRagEngine } from '../services/documentRagEngine';

export class AiController {
  // POST /api/ai/explain
  public async explain(req: Request, res: Response): Promise<void> {
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
    const explanation = await aiExplanationEngine.explainHospitalMatchAsync(currentMatch, patient_name || 'the patient');

    res.json({
      success: true,
      data: explanation
    });
  }

  // POST /api/ai/questions
  public generateQuestions(req: Request, res: Response): void {
    const { hospital_name, insurer_name, stage, is_room_exceeded } = req.body;

    // No `|| 'the hospital'`. An unnamed hospital is passed through as unnamed,
    // and the generator writes questions that do not name one, rather than
    // producing text that reads as though we know which hospital this is.
    const questions = aiExplanationEngine.generateQuestionsToAsk({
      hospitalName: typeof hospital_name === 'string' && hospital_name.trim() ? hospital_name.trim() : undefined,
      insurerName: typeof insurer_name === 'string' && insurer_name.trim() ? insurer_name.trim() : undefined,
      stage: stage,
      isRoomExceeded: is_room_exceeded
    });

    res.json({
      success: true,
      data: questions
    });
  }

  // POST /api/ai/rag/query
  public async queryRag(req: Request, res: Response): Promise<void> {
    const { query, policy_id } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Please provide a valid question or query string' }
      });
      return;
    }

    const ragResponse = await documentRagEngine.queryPolicyRAGAsync(query, policy_id);

    res.json({
      success: true,
      data: ragResponse
    });
  }

  // POST /api/ai/rag/query/stream (SSE)
  public async streamRag(req: Request, res: Response): Promise<void> {
    const { query, policy_id } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Please provide a valid question or query string' }
      });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const ragResponse = await documentRagEngine.queryPolicyRAGStream(query, policy_id, (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      });

      res.write(
        `data: ${JSON.stringify({
          final: true,
          answer: ragResponse.answer,
          citations: ragResponse.citations,
          confidence: ragResponse.confidence,
          uncertaintyNotes: ragResponse.uncertaintyNotes,
          disclaimer: ragResponse.disclaimer
        })}\n\n`
      );
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err?.message || 'Stream error' })}\n\n`);
      res.end();
    }
  }


  // POST /api/ai/coverage-confidence
  public getCoverageConfidence(req: Request, res: Response): void {
    const {
      policy_id,
      hospital_id,
      patient_id,
      selected_room_category,
      procedure_id,
      is_network_cashless,
      has_room_mismatch,
      is_preauth_pending,
      has_consumables_verified
    } = req.body;

    // Booleans are only forwarded when the caller actually sent one. Omitting
    // them means "derive from the database"; forwarding undefined would be the
    // same thing, but forwarding a coerced false would be a silent claim.
    const confidence = aiExplanationEngine.calculateCoverageConfidence({
      policyId: policy_id,
      hospitalId: hospital_id,
      patientId: patient_id,
      selectedRoomCategory: selected_room_category,
      procedureId: procedure_id,
      ...(typeof is_network_cashless === 'boolean' ? { isNetworkCashless: is_network_cashless } : {}),
      ...(typeof has_room_mismatch === 'boolean' ? { hasRoomMismatch: has_room_mismatch } : {}),
      ...(typeof is_preauth_pending === 'boolean' ? { isPreauthPending: is_preauth_pending } : {}),
      ...(typeof has_consumables_verified === 'boolean'
        ? { hasConsumablesVerified: has_consumables_verified }
        : {})
    });

    res.json({
      success: true,
      data: confidence
    });
  }

  // POST /api/ai/stage-guidance
  public async getStageGuidance(req: Request, res: Response): Promise<void> {
    const { stage, policy_id, hospital_id, patient_name, procedure_name, is_room_mismatch } = req.body;

    try {
      const guidance = await aiExplanationEngine.generateStageGuidance({
        stage: stage || 'ADMISSION',
        policyId: policy_id,
        hospitalId: hospital_id,
        patientName: patient_name,
        procedureName: procedure_name,
        isRoomMismatch: is_room_mismatch
      });

      res.json({
        success: true,
        data: guidance
      });
    } catch (err: any) {
      console.error('Error generating stage guidance:', err);
      res.status(500).json({
        success: false,
        error: { code: 'STAGE_GUIDANCE_ERROR', message: err.message || 'Failed to generate stage guidance' }
      });
    }
  }
}

export const aiController = new AiController();


