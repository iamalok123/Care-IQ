import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';

export class ScenarioController {
  // GET /api/scenarios
  public listScenarios(_req: Request, res: Response): void {
    const scenarios = dataRepository.listScenarios();
    res.json({
      success: true,
      data: scenarios,
      meta: { total: scenarios.length }
    });
  }

  // GET /api/scenarios/:id
  public getScenarioById(req: Request, res: Response): void {
    const scenario = dataRepository.getScenarioById(req.params.id as string);
    if (!scenario) {
      res.status(404).json({
        success: false,
        error: { code: 'SCENARIO_NOT_FOUND', message: 'Scenario not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: scenario
    });
  }

  // POST /api/scenarios/:id/load
  public loadScenario(req: Request, res: Response): void {
    const scenario = dataRepository.getScenarioById(req.params.id as string);
    if (!scenario) {
      res.status(404).json({
        success: false,
        error: { code: 'SCENARIO_NOT_FOUND', message: 'Scenario not found' }
      });
      return;
    }

    // Reload fresh base data
    dataRepository.loadAllData();

    const patient = scenario.patientId ? dataRepository.getPatientById(scenario.patientId) : undefined;
    const policy = scenario.policyId 
      ? dataRepository.getPolicyById(scenario.policyId) 
      : scenario.patientId 
      ? dataRepository.getPoliciesByPatientId(scenario.patientId)[0] 
      : undefined;
    const hospital = scenario.hospitalId ? dataRepository.getHospitalById(scenario.hospitalId) : undefined;
    
    let journey = scenario.journeyId ? dataRepository.getJourneyById(scenario.journeyId) : undefined;
    if (!journey && scenario.patientId) {
      const patientJourneys = dataRepository.getJourneys().filter((j) => j.patient_id === scenario.patientId);
      if (patientJourneys.length > 0) {
        journey = patientJourneys[0];
      }
    }

    const verificationItems = scenario.patientId ? dataRepository.getVerificationItems(scenario.patientId) : [];

    res.json({
      success: true,
      message: `Activated scenario: ${scenario.name}`,
      data: {
        scenario,
        patient,
        policy,
        hospital,
        journey,
        verificationItems
      }
    });
  }
}

export const scenarioController = new ScenarioController();
