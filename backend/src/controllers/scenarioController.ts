import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';

export class ScenarioController {
  // GET /api/scenarios
  public listScenarios(_req: Request, res: Response): void {
    const demos = dataRepository.getDemoProfiles();
    res.json({
      success: true,
      data: demos,
      meta: { total: demos.length }
    });
  }

  // GET /api/scenarios/:id
  public getScenarioById(req: Request, res: Response): void {
    const demo = dataRepository.getDemoProfiles().find((p) => p.id === req.params.id);
    if (!demo) {
      res.status(404).json({
        success: false,
        error: { code: 'SCENARIO_NOT_FOUND', message: 'Scenario not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: demo
    });
  }

  // POST /api/scenarios/:id/load
  public loadScenario(req: Request, res: Response): void {
    const demo = dataRepository.getDemoProfiles().find((p) => p.id === req.params.id);
    if (!demo) {
      res.status(404).json({
        success: false,
        error: { code: 'SCENARIO_NOT_FOUND', message: 'Scenario not found' }
      });
      return;
    }

    const patient = demo;
    const policy = dataRepository.getPoliciesByPatientId(demo.id)[0];
    const journeys = dataRepository.getJourneys().filter((j) => j.patient_id === demo.id);
    const journey = journeys[0];
    const hospital = journey ? dataRepository.getHospitalById(journey.hospital_id) : undefined;
    const verificationItems = dataRepository.getVerificationItems(demo.id);

    res.json({
      success: true,
      message: `Activated demo: ${demo.display_name}`,
      data: {
        scenario: demo,
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
