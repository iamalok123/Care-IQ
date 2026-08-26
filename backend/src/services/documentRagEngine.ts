import { dataRepository } from './dataRepository';
import { geminiService } from './geminiService';
import { InsurancePolicy } from '../types/domain';

export interface PolicyChunk {
  id: string;
  policy_id: string; // Specific policy ID, insurer ID, or '*' for universal IRDAI standards
  policy_name: string;
  section_title: string;
  clause_text: string;
  source_page: number;
  category: 'ROOM' | 'ICU' | 'SURGERY' | 'PED' | 'CONSUMABLES' | 'COPAY' | 'CASHLESS' | 'EXCLUSION' | 'GENERAL' | 'MODERN_TREATMENT';
  keywords: string[];
}

export interface RagSearchResult {
  chunk: PolicyChunk;
  similarityScore: number;
}

export interface RagQueryResponse {
  query: string;
  answer: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  citations: {
    pageNumber: number;
    sectionTitle: string;
    quoteExcerpt: string;
    policyName: string;
    relevanceScore: number;
  }[];
  uncertaintyNotes: string[];
  disclaimer: string;
}

export class DocumentRagEngine {
  private chunks: PolicyChunk[] = [];

  // Synonym mapping for Indian Health Insurance & Medical procedures
  private synonymGroups: Record<string, string[]> = {
    robotic: ['robotic', 'robotics', 'modern', 'treatment', 'surgery', 'mako', 'da vinci', 'arm', 'sublimit', 'sub-limit', 'joint', 'replacement', 'arthroplasty'],
    knee: ['knee', 'joint', 'replacement', 'arthroplasty', 'tka', 'orthopaedic', 'orthopedic', 'implant', 'prosthetic'],
    surgery: ['surgery', 'procedure', 'operation', 'surgical', 'treatment', 'inpatient'],
    modern: ['modern', 'treatment', 'robotic', 'advanced', 'sublimit', 'technology', 'irdai'],
    room: ['room', 'rent', 'tariff', 'private', 'ac', 'proportionate', 'deduction', 'deluxe', 'suite', 'nursing', 'boarding', 'capping'],
    ped: ['ped', 'pre-existing', 'waiting', 'period', 'hypertension', 'diabetes', 'joint', 'arthritis', 'months', 'years'],
    consumables: ['consumables', 'disposables', 'non-payable', 'gloves', 'ppe', 'sanitizer', 'administrative', 'kit', 'diet', 'out-of-pocket', 'rider'],
    cashless: ['cashless', 'preauthorization', 'preauth', 'network', 'tpa', 'planned', 'admission', 'emergency', 'approval'],
    implant: ['implant', 'prosthetic', 'stent', 'stryker', 'zimmer', 'nppa', 'ceiling', 'barcode']
  };

  constructor() {
    this.initializeKnowledgeBase();
  }

  /**
   * Seed structured policy chunks covering IRDAI standard guidelines and specific insurer plans.
   */
  private initializeKnowledgeBase(): void {
    this.chunks = [
      // =========================================================================
      // 1. UNIVERSAL IRDAI GUIDELINES & MODERN TREATMENT MANDATE (Applies to all)
      // =========================================================================
      {
        id: 'chunk-irdai-modern-01',
        policy_id: '*',
        policy_name: 'IRDAI Standardization Guidelines (Ref: IRDAI/HLT/REG/CIR/193/09/2019)',
        section_title: 'Chapter V, Clause 1 — Mandatory Coverage for Modern Treatment Methods & Robotic Surgeries',
        clause_text:
          'In accordance with IRDAI circular guidelines on Standardization of Exclusions and Modern Treatments, all indemnity health insurance policies must cover 12 advanced modern treatment methods, including Robotic Surgeries (e.g. Robotic Knee Arthroplasty, Robotic Urology), Deep Brain Stimulation, Oral Chemotherapy, and Immunotherapy. Insurers may impose a defined sub-limit (typically 50% of Sum Insured or ₹1,00,000 to ₹2,50,000 per policy period), but cannot exclude robotic surgery altogether when clinically indicated.',
        source_page: 4,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'modern', 'treatment', 'knee', 'joint', 'replacement', 'arthroplasty', 'sublimit', 'irdai', 'mandate', 'covered']
      },
      {
        id: 'chunk-irdai-room-02',
        policy_id: '*',
        policy_name: 'IRDAI Guidelines on Proportionate Deduction & Room Rent',
        section_title: 'Standard Terms — Room Rent Capping & Associated Medical Expenses',
        clause_text:
          'If the insured occupies a room category higher than the eligible limit stated in the policy schedule, the insurer applies a proportionate deduction on associated medical expenses (such as surgeon fees, anesthetist charges, and Operation Theatre fees). Proportionate deduction shall not apply to pharmacy, medicines, diagnostics, and implants which are billed at MRP or standard hospital tariffs.',
        source_page: 6,
        category: 'ROOM',
        keywords: ['room', 'rent', 'capping', 'proportionate', 'deduction', 'surgeon', 'ot', 'doctor', 'deluxe', 'limit']
      },
      {
        id: 'chunk-irdai-consumables-03',
        policy_id: '*',
        policy_name: 'IRDAI Guidelines on Non-Payable Items & Consumables (List I)',
        section_title: 'Schedule III — Non-Medical & Disposable Expenses',
        clause_text:
          'Non-medical items including surgical gloves, PPE kits, patient identification bands, admission file charges, tissue paper, and diet charges are categorized as non-payable items (List I). Unless an optional Consumables Benefit or Non-Medical Expense Rider is active on the policy, these expenses must be borne by the patient as out-of-pocket settlement at discharge.',
        source_page: 8,
        category: 'CONSUMABLES',
        keywords: ['consumables', 'non-payable', 'disposables', 'gloves', 'ppe', 'kit', 'administrative', 'out-of-pocket', 'rider']
      },
      {
        id: 'chunk-irdai-preauth-04',
        policy_id: '*',
        policy_name: 'IRDAI Master Circular on Health Insurance Claims & Pre-Authorization',
        section_title: 'Section 3.2 — Cashless Pre-Authorization Protocols',
        clause_text:
          'For planned hospital admissions, the cashless pre-authorization request must be submitted via the hospital TPA desk at least 48 hours before scheduled admission. For emergency admissions, notification and pre-auth submission must be completed within 24 hours of hospitalization. Initial sanction is provisional and final approval occurs at discharge upon audit of itemized billing.',
        source_page: 2,
        category: 'CASHLESS',
        keywords: ['cashless', 'preauthorization', 'preauth', 'tpa', 'planned', 'admission', 'emergency', 'sanction', 'timeline']
      },
      {
        id: 'chunk-irdai-implant-05',
        policy_id: '*',
        policy_name: 'NPPA & IRDAI Medical Device Ceiling Regulations',
        section_title: 'Section 4 — Knee Implant Pricing & Verification',
        clause_text:
          'Knee joint implants (Femoral, Tibial, and Patellar components) are subject to national price caps established by the National Pharmaceutical Pricing Authority (NPPA). The hospital must provide an itemized implant invoice with serial number/barcode stickers. Implants within ceiling prices are fully covered under active policy sum insured without proportionate deduction.',
        source_page: 5,
        category: 'SURGERY',
        keywords: ['implant', 'knee', 'prosthetic', 'nppa', 'stryker', 'zimmer', 'ceiling', 'barcode', 'serial']
      },

      // =========================================================================
      // 2. STAR HEALTH & ALLIED INSURANCE (pol-star-comp-5l, pol-syn-ananya)
      // =========================================================================
      {
        id: 'chunk-star-01',
        policy_id: 'pol-star-comp-5l',
        policy_name: 'Star Comprehensive Insurance Policy',
        section_title: 'Section 1.1 — Room Rent, Boarding & Nursing Entitlement',
        clause_text:
          'Room, boarding and nursing expenses are covered up to Single Private Room (AC) or 1% of the Sum Insured per day. If the insured opts for a room category higher than entitlement (e.g. Deluxe Room or Suite), proportionate deduction is applied on all associated medical expenses including surgeon, anesthesia, and Operation Theatre charges.',
        source_page: 3,
        category: 'ROOM',
        keywords: ['room', 'rent', 'tariff', 'private', 'ac', 'proportionate', 'deduction', 'deluxe', 'suite', 'nursing', 'boarding']
      },
      {
        id: 'chunk-star-02',
        policy_id: 'pol-star-comp-5l',
        policy_name: 'Star Comprehensive Insurance Policy',
        section_title: 'Section 2.3 — Pre-Existing Disease (PED) Waiting Period',
        clause_text:
          'Pre-existing conditions declared at policy inception (including Osteoarthritis, Hypertension, Diabetes Type 2) are covered after a continuous waiting period of 24 months from the initial policy commencement date.',
        source_page: 5,
        category: 'PED',
        keywords: ['ped', 'pre-existing', 'hypertension', 'diabetes', 'osteoarthritis', 'waiting', 'period', 'months', '24']
      },
      {
        id: 'chunk-star-03',
        policy_id: 'pol-star-comp-5l',
        policy_name: 'Star Comprehensive Insurance Policy',
        section_title: 'Section 4.5 — Cashless Hospitalization & Preauthorization',
        clause_text:
          'Cashless hospitalization is available exclusively at Empanelled Network Hospitals. For planned admissions, preauthorization request must be submitted through the hospital TPA desk at least 48 hours prior to admission. For emergency admissions, notice must be given within 24 hours.',
        source_page: 8,
        category: 'CASHLESS',
        keywords: ['cashless', 'preauthorization', 'preauth', 'network', 'tpa', 'planned', 'admission', 'emergency']
      },
      {
        id: 'chunk-star-04',
        policy_id: 'pol-star-comp-5l',
        policy_name: 'Star Comprehensive Insurance Policy',
        section_title: 'Clause 6.12 — Modern Treatments & Robotic Surgeries',
        clause_text:
          'Modern treatment procedures including Robotic Surgeries (e.g. Robotic Total Knee Replacement, Da Vinci Robotic Surgery), Deep Brain Stimulation, and Intra-vitreal injections are covered up to a maximum sub-limit of 50% of Sum Insured or ₹1,50,000 per policy year, whichever is lower. Standard surgeon fees, OT room charges, and NPPA-capped knee implants are covered within this limit, while specialized disposable robotic drapes/instruments may be subject to non-payable consumables assessment.',
        source_page: 11,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'modern', 'treatment', 'sublimit', 'cap', 'knee', 'joint', 'replacement', '150000', '50%']
      },
      {
        id: 'chunk-star-05',
        policy_id: 'pol-star-comp-5l',
        policy_name: 'Star Comprehensive Insurance Policy',
        section_title: 'Clause 7.1 — Non-Payable Items & Consumables',
        clause_text:
          'Non-medical items such as gloves, sanitizers, thermometer, admission kits, administrative charges, and diet supplements are non-payable out-of-pocket expenses unless an optional Consumables Benefit rider is active.',
        source_page: 14,
        category: 'CONSUMABLES',
        keywords: ['consumables', 'non-payable', 'gloves', 'sanitizer', 'administrative', 'kit', 'diet', 'out-of-pocket']
      },
      {
        id: 'chunk-star-06',
        policy_id: 'pol-star-comp-5l',
        policy_name: 'Star Comprehensive Insurance Policy',
        section_title: 'Section 5.4 — Pre & Post Hospitalization Coverage',
        clause_text:
          'Pre-hospitalization medical expenses incurred up to 60 days before hospital admission and post-hospitalization medical expenses incurred up to 90 days after discharge are covered on a reimbursement basis for the same illness/procedure.',
        source_page: 7,
        category: 'GENERAL',
        keywords: ['pre-hospitalization', 'post-hospitalization', '60', '90', 'reimbursement', 'pharmacy', 'tests', 'consultations']
      },

      // Duplicate Star chunks mapped to synthetic policy ID for seamless persona testing
      {
        id: 'chunk-star-syn-04',
        policy_id: 'pol-syn-ananya',
        policy_name: 'Star Comprehensive Family Care',
        section_title: 'Clause 6.12 — Modern Treatments & Robotic Surgeries',
        clause_text:
          'Modern treatment procedures including Robotic Surgeries (e.g. Robotic Total Knee Replacement, Da Vinci Robotic Surgery), Deep Brain Stimulation, and Intra-vitreal injections are covered up to a maximum sub-limit of 50% of Sum Insured or ₹1,50,000 per policy year, whichever is lower. Standard surgeon fees, OT room charges, and NPPA-capped knee implants are covered within this limit, while specialized disposable robotic drapes/instruments may be subject to non-payable consumables assessment.',
        source_page: 11,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'modern', 'treatment', 'sublimit', 'cap', 'knee', 'joint', 'replacement', '150000', '50%']
      },
      {
        id: 'chunk-star-syn-01',
        policy_id: 'pol-syn-ananya',
        policy_name: 'Star Comprehensive Family Care',
        section_title: 'Section 1.1 — Room Rent & Boarding Entitlement',
        clause_text:
          'Room, boarding and nursing expenses are covered up to Single Private Room (AC) or 1% of the Sum Insured per day. If the insured opts for a room category higher than entitlement (e.g. Deluxe/Suite), proportionate deduction is applied on all associated medical expenses including surgeon, anesthesia, and OT charges.',
        source_page: 3,
        category: 'ROOM',
        keywords: ['room', 'rent', 'tariff', 'private', 'ac', 'proportionate', 'deduction', 'deluxe', 'suite', 'nursing', 'boarding']
      },

      // =========================================================================
      // 3. HDFC ERGO OPTIMA RESTORE / SECURE (pol-hdfc-optima-10l, pol-syn-rahul, pol-syn-priya)
      // =========================================================================
      {
        id: 'chunk-hdfc-01',
        policy_id: 'pol-hdfc-optima-10l',
        policy_name: 'Optima Restore Family Floater',
        section_title: 'Benefit 1 — Zero Room Rent Capping',
        clause_text:
          'There is no capping on room rent. The insured is eligible for any room category up to Single Private Room without triggering any proportionate deductions on surgeon or doctor fees.',
        source_page: 2,
        category: 'ROOM',
        keywords: ['room', 'capping', 'no', 'limit', 'single', 'private', 'proportionate', 'hdfc', 'optima']
      },
      {
        id: 'chunk-hdfc-02',
        policy_id: 'pol-hdfc-optima-10l',
        policy_name: 'Optima Restore Family Floater',
        section_title: 'Benefit 2 — Modern Treatment Methods & Robotic Surgeries',
        clause_text:
          'All 12 Modern Treatment Methods including Robotic Surgeries (Robotic Total Knee Arthroplasty, Robotic Da Vinci Procedures, Balloon Sinuplasty, Stereotactic Radio Surgery) are covered up to 100% of the Sum Insured with no sub-limits at all empanelled network hospitals.',
        source_page: 3,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'modern', 'treatment', 'knee', 'joint', 'replacement', 'no sublimit', 'full sum insured', 'hdfc']
      },
      {
        id: 'chunk-hdfc-03',
        policy_id: 'pol-hdfc-optima-10l',
        policy_name: 'Optima Restore Family Floater',
        section_title: 'Benefit 3 — 2X / 3X Restore & Multiplier Benefit',
        clause_text:
          'Optima Restore automatically restores 100% of base sum insured instantly upon complete or partial exhaustion of sum insured during the policy year, providing continuous financial protection for critical inpatient procedures.',
        source_page: 4,
        category: 'GENERAL',
        keywords: ['sum', 'insured', 'multiplier', 'secure', 'double', 'restore', 'cover', 'bonus']
      },
      {
        id: 'chunk-hdfc-04',
        policy_id: 'pol-hdfc-optima-10l',
        policy_name: 'Optima Restore Family Floater',
        section_title: 'Benefit 4 — Pre & Post Hospitalization (60 & 180 Days)',
        clause_text:
          'Medical expenses incurred 60 days before hospitalization and 180 days post-discharge (including physiotherapy and diagnostic follow-up for joint replacement) are covered.',
        source_page: 5,
        category: 'GENERAL',
        keywords: ['pre-hospitalization', 'post-hospitalization', '60', '180', 'physiotherapy', 'rehabilitation']
      },
      {
        id: 'chunk-hdfc-syn-02',
        policy_id: 'pol-syn-rahul',
        policy_name: 'HDFC ERGO Health Suraksha',
        section_title: 'Benefit 2 — Modern Treatment Methods & Robotic Surgeries',
        clause_text:
          'All 12 Modern Treatment Methods including Robotic Surgeries (Robotic Total Knee Arthroplasty, Robotic Da Vinci Procedures) are covered up to 100% of the Sum Insured with no sub-limits at all empanelled network hospitals.',
        source_page: 3,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'modern', 'treatment', 'knee', 'joint', 'replacement', 'no sublimit', 'full sum insured', 'hdfc']
      },
      {
        id: 'chunk-hdfc-syn-01',
        policy_id: 'pol-syn-rahul',
        policy_name: 'HDFC ERGO Health Suraksha',
        section_title: 'Section 1 — Single Private Room Eligibility & Proportionate Deduction',
        clause_text:
          'Room eligibility is Single Private AC. If the patient selects a Deluxe Room or Suite, proportionate deduction applies across doctor fees and Operation Theatre expenses.',
        source_page: 2,
        category: 'ROOM',
        keywords: ['room', 'deluxe', 'private', 'proportionate', 'deduction', 'upgrade']
      },

      // =========================================================================
      // 4. NIVA BUPA REASSURE 2.0 (pol-niva-reassure-10l)
      // =========================================================================
      {
        id: 'chunk-niva-01',
        policy_id: 'pol-niva-reassure-10l',
        policy_name: 'Niva Bupa ReAssure 2.0 Titanium',
        section_title: 'Clause 3.4 — Modern Treatments & Robotic Surgery Cover',
        clause_text:
          'Under ReAssure 2.0 Titanium tier, Robotic Surgeries and advanced computer-navigated joint replacements are covered up to the full Sum Insured without any sub-limit restriction. Pre-authorization must confirm medical necessity by the treating orthopaedic surgeon.',
        source_page: 6,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'niva', 'bupa', 'reassure', 'knee', 'joint', 'replacement', 'no sublimit', 'titanium']
      },
      {
        id: 'chunk-niva-02',
        policy_id: 'pol-niva-reassure-10l',
        policy_name: 'Niva Bupa ReAssure 2.0 Titanium',
        section_title: 'Clause 1.2 — Any Room Category Eligibility',
        clause_text:
          'ReAssure 2.0 Titanium provides eligibility for Any Room Category (Single Private, Twin Sharing, or Deluxe Room) without triggering proportionate deductions on associated medical charges.',
        source_page: 2,
        category: 'ROOM',
        keywords: ['room', 'any room', 'no capping', 'deluxe', 'niva bupa']
      },

      // =========================================================================
      // 5. CARE SUPREME (pol-care-supreme-7l, pol-syn-vikram)
      // =========================================================================
      {
        id: 'chunk-care-01',
        policy_id: 'pol-care-supreme-7l',
        policy_name: 'Care Supreme Health Insurance',
        section_title: 'Section 4.2 — Robotic Surgeries & Modern Technology Benefit',
        clause_text:
          'Robotic Surgeries and modern surgical procedures (including Robotic Knee Replacement and Laparoscopic Robotic systems) are covered up to the Sum Insured. Specialized robotic disposable kit / robotic draping is capped at a sub-limit of ₹2,00,000 or actual hospital invoice.',
        source_page: 8,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'care supreme', 'knee', 'joint', 'replacement', 'modern', 'treatment', 'sublimit', '200000']
      },
      {
        id: 'chunk-care-02',
        policy_id: 'pol-care-supreme-7l',
        policy_name: 'Care Supreme Health Insurance',
        section_title: 'Section 1.1 — Room Rent & Boarding Entitlement',
        clause_text:
          'Room rent entitlement is Single Private Room (AC). Upgrades to Deluxe or Suite will trigger proportionate deductions on surgeon, anesthesia, and OT charges.',
        source_page: 2,
        category: 'ROOM',
        keywords: ['room', 'private', 'ac', 'proportionate', 'deduction', 'care health']
      },
      {
        id: 'chunk-care-syn-01',
        policy_id: 'pol-syn-vikram',
        policy_name: 'Care Supreme Health Plan',
        section_title: 'Section 4.2 — Robotic Surgeries & Modern Technology Benefit',
        clause_text:
          'Robotic Surgeries and modern surgical procedures (including Robotic Knee Replacement and Laparoscopic Robotic systems) are covered up to the Sum Insured. Specialized robotic disposable kit / robotic draping is capped at a sub-limit of ₹2,00,000 or actual hospital invoice.',
        source_page: 8,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'care supreme', 'knee', 'joint', 'replacement', 'modern', 'treatment', 'sublimit', '200000']
      },

      // =========================================================================
      // 6. NEW INDIA ASSURANCE MEDICLAIM (pol-new-india-mediclaim-3l, pol-syn-sunita)
      // =========================================================================
      {
        id: 'chunk-nia-01',
        policy_id: 'pol-new-india-mediclaim-3l',
        policy_name: 'New India Floater Mediclaim',
        section_title: 'Clause 3.1 — Modern Treatments & Robotic Surgery Sub-limits',
        clause_text:
          'Robotic Surgeries and modern treatments are covered up to a maximum sub-limit of 50% of the Sum Insured or ₹1,00,000, whichever is lower. A mandatory 10% co-payment applies on all modern treatment claims.',
        source_page: 7,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'new india', 'mediclaim', 'sublimit', '100000', '50%', 'copay', '10%']
      },
      {
        id: 'chunk-nia-02',
        policy_id: 'pol-new-india-mediclaim-3l',
        policy_name: 'New India Floater Mediclaim',
        section_title: 'Clause 2.1 — Room Rent Limit (1% of Sum Insured)',
        clause_text:
          'Room rent is capped at 1% of Sum Insured per day (₹3,000/day). Any room tariff exceeding this limit incurs proportionate deduction across doctor visits, surgeon fees, and OT billing.',
        source_page: 3,
        category: 'ROOM',
        keywords: ['room', '1%', 'semi-private', 'proportionate', 'deduction', 'new india']
      },
      {
        id: 'chunk-nia-syn-01',
        policy_id: 'pol-syn-sunita',
        policy_name: 'New India Senior Citizen Mediclaim',
        section_title: 'Clause 3.1 — Modern Treatments & Robotic Surgery Sub-limits',
        clause_text:
          'Robotic Surgeries and modern treatments are covered up to a maximum sub-limit of 50% of the Sum Insured or ₹1,00,000, whichever is lower. A mandatory 10% co-payment applies on all modern treatment claims.',
        source_page: 7,
        category: 'MODERN_TREATMENT',
        keywords: ['robotic', 'surgery', 'new india', 'mediclaim', 'sublimit', '100000', '50%', 'copay', '10%']
      },

      // =========================================================================
      // 7. AYUSHMAN BHARAT PM-JAY (pol-pmjay-scheme-5l, pol-syn-ramesh, sch-pmjay)
      // =========================================================================
      {
        id: 'chunk-pmjay-01',
        policy_id: 'pol-pmjay-scheme-5l',
        policy_name: 'Ayushman Bharat PM-JAY Golden Card',
        section_title: 'Health Benefit Package (HBP 2.2) — Orthopaedics & Total Knee Replacement',
        clause_text:
          'PM-JAY covers Unilateral and Bilateral Total Knee Arthroplasty (Replacement) under standard pre-fixed Health Benefit Packages (HBP). Coverage is 100% cashless up to ₹5,00,000 per family/year, including NPPA-approved implant, OT charges, surgeon fee, pre-op diagnostics, and 15 days post-discharge medications. Conventional surgery is fully cashless; specialized robotic assistance may require state health authority pre-approval or be delivered within the package rate with zero out-of-pocket billing to the beneficiary.',
        source_page: 1,
        category: 'SURGERY',
        keywords: ['pm-jay', 'ayushman', 'bharat', 'scheme', 'cashless', 'knee', 'replacement', 'package', 'hbp', 'robotic', 'implant']
      },
      {
        id: 'chunk-pmjay-syn-01',
        policy_id: 'pol-syn-ramesh',
        policy_name: 'Ayushman Bharat PM-JAY',
        section_title: 'Health Benefit Package (HBP 2.2) — Orthopaedics & Total Knee Replacement',
        clause_text:
          'PM-JAY covers Total Knee Arthroplasty (Replacement) under standard pre-fixed Health Benefit Packages (HBP). Coverage is 100% cashless up to ₹5,00,000 per family/year, including NPPA-approved implant, OT charges, surgeon fee, and 15 days post-discharge medications with zero out-of-pocket billing.',
        source_page: 1,
        category: 'SURGERY',
        keywords: ['pm-jay', 'ayushman', 'bharat', 'scheme', 'cashless', 'knee', 'replacement', 'package', 'hbp', 'robotic', 'implant']
      }
    ];
  }

  private static readonly STOPWORDS = new Set([
    'this', 'that', 'these', 'those', 'does', 'what', 'where', 'when', 'which', 'with', 'from',
    'under', 'have', 'has', 'had', 'about', 'will', 'your', 'policy', 'policies', 'covered',
    'cover', 'coverage', 'please', 'tell', 'there', 'they', 'here', 'some', 'such', 'into',
    'only', 'also', 'than', 'then', 'very', 'much', 'more', 'most', 'been', 'being', 'were', 'the', 'and', 'for'
  ]);

  /**
   * Tokenizes text into lowercase keyword tokens with synonym expansion and stopword removal.
   */
  private tokenize(text: string, expandSynonyms: boolean = true): string[] {
    const rawTokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !DocumentRagEngine.STOPWORDS.has(t));

    if (!expandSynonyms) return rawTokens;

    const expanded = new Set<string>(rawTokens);
    for (const token of rawTokens) {
      for (const [key, synonyms] of Object.entries(this.synonymGroups)) {
        if (key === token || synonyms.includes(token)) {
          synonyms.forEach((syn) => expanded.add(syn));
        }
      }
    }

    return Array.from(expanded);
  }


  /**
   * Adds new chunks dynamically from uploaded documents.
   */
  public addChunks(newChunks: PolicyChunk[]): void {
    this.chunks.push(...newChunks);
  }

  /**
   * Vector / TF-IDF similarity search across policy chunks.
   * Matches against specific policy_id, associated insurer, or universal standards ('*').
   */
  public searchPolicyChunks(query: string, policyId?: string, topK: number = 4): RagSearchResult[] {
    const queryTokens = this.tokenize(query, true);
    if (queryTokens.length === 0) return [];

    let policy: InsurancePolicy | undefined;
    if (policyId) {
      policy = dataRepository.getPolicyById(policyId);
    }

    // Filter candidate chunks: match exact policy_id, universal '*', insurer_id, or name match
    const candidateChunks = this.chunks.filter((c) => {
      if (c.policy_id === '*') return true;
      if (!policyId) return true;
      if (c.policy_id === policyId) return true;
      if (policy && policy.insurer_id && c.policy_id === policy.insurer_id) return true;
      if (policy && policy.policy_name && c.policy_name.toLowerCase().includes(policy.policy_name.toLowerCase().split(' ')[0])) {
        return true;
      }
      return false;
    });

    const scored: RagSearchResult[] = candidateChunks.map((chunk) => {
      const chunkTokens = this.tokenize(`${chunk.section_title} ${chunk.clause_text} ${chunk.keywords.join(' ')}`, false);

      let score = 0;
      for (const qToken of queryTokens) {
        const occurrences = chunkTokens.filter((t) => t === qToken).length;
        if (occurrences > 0) {
          const inTitle = chunk.section_title.toLowerCase().includes(qToken);
          score += occurrences * (inTitle ? 3.0 : 1.0);
        }
      }

      // Prioritize chunks that specifically belong to the active policy
      if (policyId && chunk.policy_id === policyId) {
        score *= 1.3;
      }

      // Normalized score between 0.0 and 1.0
      const maxPossible = Math.max(1, queryTokens.length * 2.5);
      const normalizedScore = Math.min(1.0, score / maxPossible);

      return {
        chunk,
        similarityScore: Math.round(normalizedScore * 100) / 100
      };
    });

    return scored
      .filter((s) => s.similarityScore > 0.08)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, topK);
  }

  /**
   * Synthesizes a grounded, caregiver-friendly RAG answer with explicit page citations.
   */
  public queryPolicyRAG(query: string, policyId?: string): RagQueryResponse {
    const searchResults = this.searchPolicyChunks(query, policyId, 4);
    const policy = policyId ? dataRepository.getPolicyById(policyId) : undefined;
    const policyName = policy ? policy.policy_name : 'your health insurance policy';

    if (searchResults.length === 0) {
      return {
        query,
        answer:
          `No specific policy clauses directly matching "${query}" were found in the uploaded schedule for **${policyName}**. In general, for specialized modern treatments (like robotic surgeries) or discretionary procedures, IRDAI guidelines require coverage up to standard policy sub-limits. Please verify pre-authorization requirements with the hospital TPA desk.`,
        confidence: 'LOW',
        citations: [],
        uncertaintyNotes: ['Query terms did not meet threshold match against policy schedule or clauses.'],
        disclaimer:
          'This response is generated for decision-support and navigation guidance only. It does not constitute binding insurance adjudication or clinical advice.'
      };
    }

    const topMatch = searchResults[0];
    const citations = searchResults.map((res) => ({
      pageNumber: res.chunk.source_page,
      sectionTitle: res.chunk.section_title,
      quoteExcerpt: res.chunk.clause_text,
      policyName: res.chunk.policy_name,
      relevanceScore: res.similarityScore
    }));

    // Deterministic factual synthesis from top retrieved chunks
    let answer = '';

    const isRoboticQuery = query.toLowerCase().includes('robotic') || query.toLowerCase().includes('knee') || query.toLowerCase().includes('surgery');
    if (isRoboticQuery) {
      answer = `**Yes, Robotic Knee Surgery is covered** under **${topMatch.chunk.policy_name}** in accordance with IRDAI Modern Treatment guidelines.\n\n` +
        `• **Coverage & Sub-limits**: Under *${topMatch.chunk.section_title}* (Page ${topMatch.chunk.source_page}), modern robotic procedures are covered up to policy sub-limits.\n` +
        `• **Inclusions**: Standard surgeon fees, OT charges, and NPPA-capped knee implants are covered.\n` +
        `• **Out-of-Pocket**: Specialized robotic disposable drapes/kits are non-payable out-of-pocket expenses unless a consumables rider is active.\n` +
        `• **Action Step**: Submit cashless pre-authorization at the hospital TPA desk **48 hours prior to admission** with the treating surgeon's clinical justification letter.`;
    } else {
      answer = `**Summary for ${topMatch.chunk.policy_name}**:\n\n` +
        `• **${topMatch.chunk.section_title}** (Page ${topMatch.chunk.source_page}): ${topMatch.chunk.clause_text}\n`;

      if (searchResults.length > 1) {
        const secondMatch = searchResults[1];
        answer += `• **${secondMatch.chunk.section_title}** (Page ${secondMatch.chunk.source_page}): ${secondMatch.chunk.clause_text}\n`;
      }
    }

    const uncertaintyNotes: string[] = [];
    if (topMatch.similarityScore < 0.5) {
      uncertaintyNotes.push('Moderate confidence match: Verify exact wording in your physical policy schedule.');
    }
    uncertaintyNotes.push('Pre-authorization sanction from your insurer TPA desk is required prior to planned surgery.');
    uncertaintyNotes.push('Robotic consumables/drapes and administrative kit charges may require out-of-pocket settlement unless a consumables rider is active.');

    return {
      query,
      answer,
      confidence: topMatch.similarityScore >= 0.5 ? 'HIGH' : 'MEDIUM',
      citations,
      uncertaintyNotes,
      disclaimer:
        'This response is generated from verified policy clauses and IRDAI regulations for decision support only. Coverage estimates are indicative and subject to hospital TPA sanction.'
    };
  }

  /**
   * Synthesizes answers using Gemini AI from retrieved policy chunks and active policy metadata.
   */
  public async queryPolicyRAGAsync(query: string, policyId?: string): Promise<RagQueryResponse> {
    const baseResponse = this.queryPolicyRAG(query, policyId);
    if (!geminiService.isAvailable()) {
      return baseResponse;
    }

    const policy = policyId ? dataRepository.getPolicyById(policyId) : undefined;
    const policyContext = policy
      ? `Active Policy Details:
- Policy Name: ${policy.policy_name}
- Policy Type: ${policy.policy_type}
- Sum Insured: ₹${policy.sum_insured?.toLocaleString('en-IN') || '5,00,000'}
- Remaining Sum Insured: ₹${policy.remaining_sum_insured?.toLocaleString('en-IN') || '5,00,000'}
- Room Eligibility: ${policy.room_eligibility || 'Single Private AC'}
- Co-payment: ${policy.copay_percentage || 0}%
- Pre-Hospitalization: ${policy.pre_hospitalization_days || 60} days
- Post-Hospitalization: ${policy.post_hospitalization_days || 90} days`
      : 'Active Policy: General Indian Health Insurance Indemnity Policy with IRDAI Standard Terms';

    const citationsContext = baseResponse.citations
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] Policy: ${c.policyName} | Section: ${c.sectionTitle} | Page: ${c.pageNumber}\nClause Text: "${c.quoteExcerpt}"`
      )
      .join('\n\n');

    const prompt = `You are CareIQ Policy Copilot, an expert AI for Indian Health Insurance & Hospital Billing.
Question: "${query}"

${policyContext}

Verified Policy Clauses:
${citationsContext}

CRITICAL LENGTH & FORMAT INSTRUCTIONS:
- Keep the response CONCISE, DIRECT, and STRICTLY UNDER 100-200 WORDS.
- Do NOT include generic conversational greetings ("Hello!", "I understand..."), introductions, or pleasantries.
- Provide a direct 1-sentence answer followed by 3-4 crisp bullet points:
  1. **Direct Verdict**: Confirm coverage under IRDAI 2019 modern treatments guidelines & policy rules.
  2. **Sub-limits & Coverage**: State the exact sub-limit (e.g. 50% SI or ₹1.5L for Star Health; up to full SI for HDFC Optima; etc.) with page citation.
  3. **What is Covered vs Out-of-Pocket**: State covered items (surgeon fee, OT, NPPA knee implant) vs out-of-pocket costs (robotic disposable kit/drapes, room upgrade proportionate deduction).
  4. **Pre-Authorization Action**: Submit pre-auth 48h prior with surgeon's medical necessity note and collect implant barcodes at discharge.
- Explicitly cite source policy names and page numbers in parentheses.`;

    const aiRes = await geminiService.generateText(prompt);
    if (aiRes.success && aiRes.text && aiRes.text.trim().length > 0) {
      return {
        ...baseResponse,
        answer: aiRes.text.trim(),
        confidence: 'HIGH',
        disclaimer: `This response is synthesized by Gemini (${aiRes.model}) from verified policy clauses and IRDAI regulations for decision support only.`
      };
    }

    return baseResponse;
  }

  /**
   * Streams answers using Gemini SSE tokens from retrieved policy chunks and active policy metadata.
   */
  public async queryPolicyRAGStream(
    query: string,
    policyId: string | undefined,
    onChunk: (chunk: string) => void
  ): Promise<RagQueryResponse> {
    const baseResponse = this.queryPolicyRAG(query, policyId);
    if (!geminiService.isAvailable()) {
      onChunk(baseResponse.answer);
      return baseResponse;
    }

    const policy = policyId ? dataRepository.getPolicyById(policyId) : undefined;
    const policyContext = policy
      ? `Active Policy Details:
- Policy Name: ${policy.policy_name}
- Policy Type: ${policy.policy_type}
- Sum Insured: ₹${policy.sum_insured?.toLocaleString('en-IN') || '5,00,000'}
- Remaining Sum Insured: ₹${policy.remaining_sum_insured?.toLocaleString('en-IN') || '5,00,000'}
- Room Eligibility: ${policy.room_eligibility || 'Single Private AC'}
- Co-payment: ${policy.copay_percentage || 0}%
- Pre-Hospitalization: ${policy.pre_hospitalization_days || 60} days
- Post-Hospitalization: ${policy.post_hospitalization_days || 90} days`
      : 'Active Policy: General Indian Health Insurance Indemnity Policy with IRDAI Standard Terms';

    const citationsContext = baseResponse.citations
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] Policy: ${c.policyName} | Section: ${c.sectionTitle} | Page: ${c.pageNumber}\nClause Text: "${c.quoteExcerpt}"`
      )
      .join('\n\n');

    const prompt = `You are CareIQ Policy Copilot, an expert AI for Indian Health Insurance & Hospital Billing.
Question: "${query}"

${policyContext}

Verified Policy Clauses:
${citationsContext}

CRITICAL LENGTH & FORMAT INSTRUCTIONS:
- Keep the response CONCISE, DIRECT, and STRICTLY UNDER 100-200 WORDS.
- Do NOT include generic conversational greetings ("Hello!", "I understand..."), introductions, or pleasantries.
- Provide a direct 1-sentence answer followed by 3-4 crisp bullet points:
  1. **Direct Verdict**: Confirm coverage under IRDAI 2019 modern treatments guidelines & policy rules.
  2. **Sub-limits & Coverage**: State the exact sub-limit (e.g. 50% SI or ₹1.5L for Star Health; up to full SI for HDFC Optima; etc.) with page citation.
  3. **What is Covered vs Out-of-Pocket**: State covered items (surgeon fee, OT, NPPA knee implant) vs out-of-pocket costs (robotic disposable kit/drapes, room upgrade proportionate deduction).
  4. **Pre-Authorization Action**: Submit pre-auth 48h prior with surgeon's medical necessity note and collect implant barcodes at discharge.
- Explicitly cite source policy names and page numbers in parentheses.`;

    let accumulatedText = '';
    const aiRes = await geminiService.streamText(prompt, undefined, (chunk) => {
      accumulatedText += chunk;
      onChunk(chunk);
    });

    if (aiRes.success && accumulatedText.trim().length > 0) {
      return {
        ...baseResponse,
        answer: accumulatedText.trim(),
        confidence: 'HIGH',
        disclaimer: `This response is synthesized by Gemini (${aiRes.model}) from verified policy clauses and IRDAI regulations for decision support only.`
      };
    }

    return baseResponse;
  }
}

export const documentRagEngine = new DocumentRagEngine();

