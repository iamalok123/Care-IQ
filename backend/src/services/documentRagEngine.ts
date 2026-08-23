import { dataRepository } from './dataRepository';
import { geminiService } from './geminiService';

export interface PolicyChunk {

  id: string;
  policy_id: string;
  policy_name: string;
  section_title: string;
  clause_text: string;
  source_page: number;
  category: 'ROOM' | 'ICU' | 'SURGERY' | 'PED' | 'CONSUMABLES' | 'COPAY' | 'CASHLESS' | 'EXCLUSION' | 'GENERAL';
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

  constructor() {
    this.initializeKnowledgeBase();
  }

  /**
   * Seed structured policy chunks from reference policies and schemas.
   */
  private initializeKnowledgeBase(): void {
    this.chunks = [
      // Star Comprehensive Health
      {
        id: 'chunk-star-01',
        policy_id: 'pol-syn-ananya',
        policy_name: 'Star Comprehensive Health Insurance',
        section_title: 'Section 1.1 — Room Rent & Boarding Entitlement',
        clause_text:
          'Room, boarding and nursing expenses are covered up to Single Private Room (AC) or 1% of the Sum Insured per day (₹5,000/day max). If the insured opts for a room category higher than entitlement (e.g. Deluxe/Suite), proportionate deduction is applied on all associated medical expenses including surgeon, anesthesia, and OT charges.',
        source_page: 3,
        category: 'ROOM',
        keywords: ['room', 'rent', 'tariff', 'private', 'ac', 'proportionate', 'deduction', 'deluxe', 'suite', 'nursing', 'boarding']
      },
      {
        id: 'chunk-star-02',
        policy_id: 'pol-syn-ananya',
        policy_name: 'Star Comprehensive Health Insurance',
        section_title: 'Section 2.3 — Pre-Existing Disease (PED) Waiting Period',
        clause_text:
          'Pre-existing conditions declared at policy inception (including Hypertension, Diabetes Type 2) are covered after a continuous waiting period of 24 months from the initial policy commencement date.',
        source_page: 5,
        category: 'PED',
        keywords: ['ped', 'pre-existing', 'hypertension', 'diabetes', 'waiting', 'period', 'months', '24']
      },
      {
        id: 'chunk-star-03',
        policy_id: 'pol-syn-ananya',
        policy_name: 'Star Comprehensive Health Insurance',
        section_title: 'Section 4.5 — Cashless Hospitalization & Preauthorization',
        clause_text:
          'Cashless hospitalization is available exclusively at Empanelled Network Hospitals. For planned admissions, preauthorization request must be submitted through the hospital TPA desk at least 48 hours prior to admission. For emergency admissions, notice must be given within 24 hours.',
        source_page: 8,
        category: 'CASHLESS',
        keywords: ['cashless', 'preauthorization', 'preauth', 'network', 'tpa', 'planned', 'admission', 'emergency']
      },
      {
        id: 'chunk-star-04',
        policy_id: 'pol-syn-ananya',
        policy_name: 'Star Comprehensive Health Insurance',
        section_title: 'Clause 6.12 — Modern Treatments & Robotic Surgeries',
        clause_text:
          'Modern treatment procedures including Robotic Surgeries, Deep Brain Stimulation, and Intra-vitreal injections are covered up to a maximum sub-limit of 50% of Sum Insured or ₹1,50,000, whichever is lower.',
        source_page: 11,
        category: 'SURGERY',
        keywords: ['robotic', 'surgery', 'modern', 'treatment', 'sublimit', 'cap', 'knee', 'joint', 'replacement']
      },
      {
        id: 'chunk-star-05',
        policy_id: 'pol-syn-ananya',
        policy_name: 'Star Comprehensive Health Insurance',
        section_title: 'Clause 7.1 — Non-Payable Items & Consumables',
        clause_text:
          'Non-medical items such as gloves, sanitizers, thermometer, admission kits, administrative charges, and diet supplements are non-payable out-of-pocket expenses unless an optional Consumables Benefit rider is active.',
        source_page: 14,
        category: 'CONSUMABLES',
        keywords: ['consumables', 'non-payable', 'gloves', 'sanitizer', 'administrative', 'kit', 'diet', 'out-of-pocket']
      },

      // HDFC ERGO Optima Secure
      {
        id: 'chunk-hdfc-01',
        policy_id: 'pol-syn-priya',
        policy_name: 'HDFC ERGO Optima Secure',
        section_title: 'Benefit 1 — Zero Room Rent Capping',
        clause_text:
          'There is no capping on room rent. The insured is eligible for any room category up to Single Private Room without triggering any proportionate deductions on surgeon or doctor fees.',
        source_page: 2,
        category: 'ROOM',
        keywords: ['room', 'capping', 'no', 'limit', 'single', 'private', 'proportionate', 'hdfc', 'optima']
      },
      {
        id: 'chunk-hdfc-02',
        policy_id: 'pol-syn-priya',
        policy_name: 'HDFC ERGO Optima Secure',
        section_title: 'Benefit 3 — 2X / 3X Secure Multiplier Benefit',
        clause_text:
          'Optima Secure automatically doubles the base sum insured instantly on day 1 from ₹10,00,000 to ₹20,00,000 at no extra cost, providing enhanced financial protection for critical inpatient procedures.',
        source_page: 4,
        category: 'GENERAL',
        keywords: ['sum', 'insured', 'multiplier', 'secure', 'double', '2x', 'cover', 'bonus']
      },

      // Government Scheme: Ayushman Bharat PM-JAY
      {
        id: 'chunk-pmjay-01',
        policy_id: 'pol-syn-ramesh',
        policy_name: 'Ayushman Bharat PM-JAY',
        section_title: 'Standard Operating Procedure — 100% Cashless Package Coverage',
        clause_text:
          'PM-JAY offers completely cashless coverage up to ₹5,00,000 per family per year at all empanelled public and private hospitals for pre-defined Health Benefit Packages (HBP). Beneficiaries must present an Ayushman Card and Aadhaar for instant biometric authorization at the hospital PMAM desk.',
        source_page: 1,
        category: 'CASHLESS',
        keywords: ['pm-jay', 'ayushman', 'bharat', 'scheme', 'cashless', '5', 'lakh', 'package', 'hbp', 'aadhaar']
      }
    ];
  }

  /**
   * Tokenizes text into lowercase keyword tokens.
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }

  /**
   * Adds new chunks dynamically from uploaded documents.
   */
  public addChunks(newChunks: PolicyChunk[]): void {
    this.chunks.push(...newChunks);
  }

  /**
   * Vector / TF-IDF similarity search across policy chunks.
   */
  public searchPolicyChunks(query: string, policyId?: string, topK: number = 3): RagSearchResult[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const candidateChunks = policyId
      ? this.chunks.filter((c) => c.policy_id === policyId || !c.policy_id)
      : this.chunks;

    const scored: RagSearchResult[] = candidateChunks.map((chunk) => {
      const chunkTokens = this.tokenize(`${chunk.section_title} ${chunk.clause_text} ${chunk.keywords.join(' ')}`);

      // Compute TF-IDF overlap score
      let score = 0;
      for (const qToken of queryTokens) {
        const occurrences = chunkTokens.filter((t) => t === qToken).length;
        if (occurrences > 0) {
          // Weight exact matches in title higher
          const inTitle = chunk.section_title.toLowerCase().includes(qToken);
          score += occurrences * (inTitle ? 2.5 : 1.0);
        }
      }

      // Normalized similarity metric between 0.0 and 1.0
      const maxPossible = queryTokens.length * 3;
      const normalizedScore = Math.min(1.0, score / Math.max(1, maxPossible));

      return {
        chunk,
        similarityScore: Math.round(normalizedScore * 100) / 100
      };
    });

    return scored
      .filter((s) => s.similarityScore > 0.15)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, topK);
  }

  /**
   * Synthesizes a grounded, caregiver-friendly RAG answer with explicit page citations.
   */
  public queryPolicyRAG(query: string, policyId?: string): RagQueryResponse {
    const searchResults = this.searchPolicyChunks(query, policyId, 3);

    if (searchResults.length === 0) {
      return {
        query,
        answer:
          'No specific policy clauses directly matching your query were found in the uploaded documents. Please verify this item directly with your insurer or hospital TPA desk.',
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
    let answer = `According to **${topMatch.chunk.policy_name}** (${topMatch.chunk.section_title}, Page ${topMatch.chunk.source_page}):\n\n`;
    answer += `"${topMatch.chunk.clause_text}"\n\n`;

    if (searchResults.length > 1) {
      const secondMatch = searchResults[1];
      answer += `Additionally, under **${secondMatch.chunk.section_title}** (Page ${secondMatch.chunk.source_page}):\n`;
      answer += `"${secondMatch.chunk.clause_text}"`;
    }

    const uncertaintyNotes: string[] = [];
    if (topMatch.similarityScore < 0.5) {
      uncertaintyNotes.push('Moderate confidence match: Verify exact wording in your physical policy schedule.');
    }
    uncertaintyNotes.push('Hospital network agreements and preauthorization terms may supersede baseline limits.');

    return {
      query,
      answer,
      confidence: topMatch.similarityScore >= 0.6 ? 'HIGH' : 'MEDIUM',
      citations,
      uncertaintyNotes,
      disclaimer:
        'This response is generated from indexed policy clauses for informational decision support only. Coverage estimates are indicative and subject to hospital TPA sanction.'
    };
  }

  /**
   * Synthesizes answers using Gemini 3.5 / 2.5 Flash from retrieved policy chunks.
   */
  public async queryPolicyRAGAsync(query: string, policyId?: string): Promise<RagQueryResponse> {
    const baseResponse = this.queryPolicyRAG(query, policyId);
    if (!geminiService.isAvailable() || baseResponse.citations.length === 0) {
      return baseResponse;
    }

    const contextText = baseResponse.citations
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] Policy: ${c.policyName} | Section: ${c.sectionTitle} | Page: ${c.pageNumber}\nClause Text: "${c.quoteExcerpt}"`
      )
      .join('\n\n');

    const prompt = `You are CareIQ, an expert Indian Health Insurance Policy Decision Support AI.
The user is asking: "${query}"

Here are the retrieved verbatim policy clauses from the patient's insurance document:
${contextText}

Synthesize a clear, empathetic, and 100% grounded answer for the patient/caregiver.
Strictly adhere to the facts in the retrieved sources. Explicitly reference the policy name and page citations in your answer.
Do not fabricate facts or coverage limits not present in the sources.`;

    const aiRes = await geminiService.generateText(prompt);
    if (aiRes.success && aiRes.text && aiRes.text.trim().length > 0) {
      return {
        ...baseResponse,
        answer: aiRes.text.trim(),
        disclaimer: `This response is synthesized by Gemini (${aiRes.model}) from verified policy citations for informational decision support only.`
      };
    }

    return baseResponse;
  }

  /**
   * Streams answers using Gemini SSE tokens from retrieved policy chunks.
   */
  public async queryPolicyRAGStream(
    query: string,
    policyId: string | undefined,
    onChunk: (chunk: string) => void
  ): Promise<RagQueryResponse> {
    const baseResponse = this.queryPolicyRAG(query, policyId);
    if (!geminiService.isAvailable() || baseResponse.citations.length === 0) {
      onChunk(baseResponse.answer);
      return baseResponse;
    }

    const contextText = baseResponse.citations
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] Policy: ${c.policyName} | Section: ${c.sectionTitle} | Page: ${c.pageNumber}\nClause Text: "${c.quoteExcerpt}"`
      )
      .join('\n\n');

    const prompt = `You are CareIQ, an expert Indian Health Insurance Policy Decision Support AI.
The user is asking: "${query}"

Here are the retrieved verbatim policy clauses from the patient's insurance document:
${contextText}

Synthesize a clear, empathetic, and 100% grounded answer for the patient/caregiver.
Strictly adhere to the facts in the retrieved sources. Explicitly reference the policy name and page citations in your answer.
Do not fabricate facts or coverage limits not present in the sources.`;

    let accumulatedText = '';
    const aiRes = await geminiService.streamText(prompt, undefined, (chunk) => {
      accumulatedText += chunk;
      onChunk(chunk);
    });

    if (aiRes.success && accumulatedText.trim().length > 0) {
      return {
        ...baseResponse,
        answer: accumulatedText.trim(),
        disclaimer: `This response is synthesized by Gemini (${aiRes.model}) from verified policy citations for informational decision support only.`
      };
    }

    return baseResponse;
  }
}

export const documentRagEngine = new DocumentRagEngine();

