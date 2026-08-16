import { Request, Response } from 'express';
import fs from 'fs';
import crypto from 'crypto';
import { dataRepository } from '../services/dataRepository';
import { policyExtractionEngine } from '../services/policyExtractionEngine';
import {
  Document,
  InsurancePolicy,
  PolicyRule,
  PolicyExclusion,
  DataStatus,
  VerificationStatus,
  ConfidenceLevel,
  RoomCategoryCode
} from '../types/domain';

export class DocumentController {
  // GET /api/documents
  public getDocuments(_req: Request, res: Response): void {
    const docs = dataRepository.getDocuments();
    res.json({
      success: true,
      data: docs,
      meta: { total: docs.length }
    });
  }

  // GET /api/documents/:id
  public getDocumentById(req: Request, res: Response): void {
    const doc = dataRepository.getDocumentById(req.params.id as string);
    if (!doc) {
      res.status(404).json({
        success: false,
        error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found' }
      });
      return;
    }

    const extraction = dataRepository.getExtractionByDocumentId(doc.id);
    const evidence = extraction ? dataRepository.getEvidenceByExtractionId(extraction.id) : [];

    res.json({
      success: true,
      data: {
        ...doc,
        extraction,
        evidence
      }
    });
  }

  // POST /api/documents/upload
  public uploadDocument(req: Request, res: Response): void {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE_PROVIDED', message: 'Please attach a document file' }
        });
        return;
      }

      const fileBuffer = fs.readFileSync(file.path);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const docId = `doc-${Date.now()}`;
      const newDoc: Document = {
        id: docId,
        owner_user_id: (req.body.owner_user_id as string) || 'caregiver-primary',
        document_type: (req.body.document_type as any) || 'POLICY',
        storage_path: file.path,
        original_filename: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        checksum: checksum,
        extraction_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      dataRepository.addDocument(newDoc);

      res.status(201).json({
        success: true,
        data: newDoc
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: err.message || 'File upload failed' }
      });
    }
  }

  // POST /api/documents/:id/extract
  public extractDocument(req: Request, res: Response): void {
    const doc = dataRepository.getDocumentById(req.params.id as string);
    if (!doc) {
      res.status(404).json({
        success: false,
        error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found' }
      });
      return;
    }

    let fileContent = '';
    try {
      if (fs.existsSync(doc.storage_path)) {
        fileContent = fs.readFileSync(doc.storage_path, 'utf-8');
      }
    } catch {
      // Non-text binary file fallback
    }

    const { extraction, evidence, extractedData } = policyExtractionEngine.extractPolicy(doc, fileContent);

    dataRepository.addExtraction(extraction);
    dataRepository.addExtractionEvidence(evidence);
    dataRepository.updateDocumentExtractionStatus(doc.id, 'EXTRACTED');

    res.json({
      success: true,
      data: {
        document: doc,
        extraction,
        evidence,
        extractedData
      }
    });
  }

  // POST /api/documents/:id/confirm
  public confirmExtraction(req: Request, res: Response): void {
    const doc = dataRepository.getDocumentById(req.params.id as string);
    if (!doc) {
      res.status(404).json({
        success: false,
        error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found' }
      });
      return;
    }

    const {
      patient_id,
      insurer_name,
      policy_number,
      policy_name,
      policy_type,
      sum_insured,
      room_category_eligibility,
      room_rent_limit_amount,
      copay_percentage,
      deductible,
      waiting_period_months,
      pre_existing_diseases,
      key_exclusions
    } = req.body;

    const policyId = `pol-${Date.now()}`;
    const now = new Date().toISOString();

    // Find or match Insurer ID
    const matchedInsurer = dataRepository.insurers.find((ins) =>
      ins.name.toLowerCase().includes((insurer_name || '').toLowerCase())
    );
    const insurerId = matchedInsurer?.id || 'ins-care-health';

    const newPolicy: InsurancePolicy = {
      id: policyId,
      patient_id: patient_id || 'pat-ananya',
      insurer_id: insurerId,
      policy_name: policy_name || 'Confirmed Health Plan',
      policy_type: (policy_type as any) || 'INDIVIDUAL',
      policy_number_masked: policy_number || `POL-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      sum_insured: Number(sum_insured) || 500000,
      remaining_sum_insured: Number(sum_insured) || 500000,
      room_eligibility: (room_category_eligibility as RoomCategoryCode) || RoomCategoryCode.PRIVATE_AC,
      copay_percentage: Number(copay_percentage) || 0,
      deductible_amount: Number(deductible) || 0,
      cashless_supported: true,
      preauthorization_supported: true,
      pre_hospitalization_days: 60,
      post_hospitalization_days: 90,
      policy_start_date: '2026-01-01',
      policy_end_date: '2027-01-01',
      source_document_id: doc.id,
      data_status: DataStatus.USER_PROVIDED,
      verification_status: VerificationStatus.VERIFIED,
      confidence: ConfidenceLevel.HIGH,
      created_at: now,
      updated_at: now
    };

    dataRepository.addPolicy(newPolicy);

    // Generate Normalized Policy Rules
    const rules: PolicyRule[] = [
      {
        id: `prule-${Date.now()}-1`,
        policy_id: policyId,
        rule_code: 'ROOM_ELIGIBILITY',
        category: 'ROOM' as any,
        subject: 'Inpatient Room Accommodation',
        condition_json: { eligible_category: newPolicy.room_eligibility },
        result_json: { status: 'COVERED', max_daily_tariff: Number(room_rent_limit_amount) || 5000 },
        priority: 1,
        source_document_id: doc.id,
        source_page: 3,
        confidence: ConfidenceLevel.HIGH,
        verification_status: VerificationStatus.VERIFIED,
        created_at: now,
        updated_at: now
      },
      {
        id: `prule-${Date.now()}-2`,
        policy_id: policyId,
        rule_code: 'PRE_EXISTING_DISEASES',
        category: 'WAITING_PERIOD' as any,
        subject: 'Pre-existing Conditions Waiting Period',
        condition_json: { waiting_period_months: Number(waiting_period_months) || 24 },
        result_json: { covered_diseases: pre_existing_diseases || [] },
        priority: 2,
        source_document_id: doc.id,
        source_page: 5,
        confidence: ConfidenceLevel.HIGH,
        verification_status: VerificationStatus.VERIFIED,
        created_at: now,
        updated_at: now
      }
    ];

    dataRepository.addPolicyRules(rules);

    // Generate Normalized Exclusions
    const exclusionsList: string[] = key_exclusions || ['Cosmetic surgery', 'Non-medical consumables'];
    const exclusions: PolicyExclusion[] = exclusionsList.map((exc, idx) => ({
      id: `pexcl-${Date.now()}-${idx}`,
      policy_id: policyId,
      category: 'GENERAL_EXCLUSION',
      description: exc,
      normalized_code: `EXCL_${idx + 1}`,
      source_document_id: doc.id,
      source_page: 7,
      confidence: ConfidenceLevel.HIGH,
      verification_status: VerificationStatus.VERIFIED
    }));

    dataRepository.addPolicyExclusions(exclusions);
    dataRepository.updateDocumentExtractionStatus(doc.id, 'CONFIRMED');

    res.status(201).json({
      success: true,
      data: {
        policy: newPolicy,
        rules,
        exclusions,
        document_status: 'CONFIRMED'
      }
    });
  }
}

export const documentController = new DocumentController();
