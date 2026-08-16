import { Router, Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';

const router = Router();

// GET /api/scenarios
router.get('/', (req: Request, res: Response) => {
  const scenarios = dataRepository.listScenarios();
  res.json({
    success: true,
    data: scenarios,
    meta: { total: scenarios.length }
  });
});

// GET /api/scenarios/:id
router.get('/:id', (req: Request, res: Response) => {
  const scenario = dataRepository.getScenarioById(req.params.id as string);
  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: { code: 'SCENARIO_NOT_FOUND', message: 'Scenario not found' }
    });
  }

  res.json({
    success: true,
    data: scenario
  });
});

// POST /api/scenarios/:id/load
router.post('/:id/load', (req: Request, res: Response) => {
  const scenario = dataRepository.getScenarioById(req.params.id as string);
  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: { code: 'SCENARIO_NOT_FOUND', message: 'Scenario not found' }
    });
  }

  // Reload fresh base data
  dataRepository.loadAllData();

  const patient = scenario.patientId ? dataRepository.getPatientById(scenario.patientId) : undefined;
  const policy = scenario.policyId ? dataRepository.getPolicyById(scenario.policyId) : undefined;
  const hospital = scenario.hospitalId ? dataRepository.getHospitalById(scenario.hospitalId) : undefined;
  const journey = scenario.journeyId ? dataRepository.getJourneyById(scenario.journeyId) : undefined;

  res.json({
    success: true,
    message: `Activated scenario: ${scenario.name}`,
    data: {
      scenario,
      patient,
      policy,
      hospital,
      journey
    }
  });
});

export default router;
