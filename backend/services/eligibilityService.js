const OpenAI = require('openai');
const petitionRepository = require('../data/petitionRepository');
const profileRepository = require('../data/profileRepository');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class EligibilityService {
  async checkEligibility(profileId, petitionId = null) {
    const profile = await profileRepository.getById(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const petitions = petitionId 
      ? [await petitionRepository.getById(petitionId)]
      : await petitionRepository.getAll();

    if (petitionId && !petitions[0]) {
      throw new Error(`Petition ${petitionId} not found`);
    }

    // Filter out null petitions
    const validPetitions = petitions.filter(p => p !== null);

    try {
      // Use the new prompt that evaluates all petitions at once
      const matchingResult = await this.checkEligibilityWithNormalization(profile, validPetitions);
      
      // Transform the new format to match frontend expectations
      const results = this.transformMatchingResults(matchingResult, validPetitions);
      
      // Sort by tie_breaker_rank or score descending
      results.sort((a, b) => {
        if (a.tie_breaker_rank !== undefined && b.tie_breaker_rank !== undefined) {
          return a.tie_breaker_rank - b.tie_breaker_rank;
        }
        return (b.score || 0) - (a.score || 0);
      });

      return results;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      // Fallback: return error for each petition
      return validPetitions.map(petition => ({
        petition_id: petition.petition_id,
        petition: {
          country: petition.country,
          visa_type: petition.visa_type,
          category: petition.category
        },
        error: error.message,
        score: 0,
        eligible: false
      }));
    }
  }

  async checkEligibilityWithNormalization(profile, petitions) {
    const prompt = this.buildPrompt(profile, petitions);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert immigration petition matching engine.
You operate as a deterministic, rules-first evaluator, not a conversational assistant.

Your responsibility includes NORMALIZING and INTERPRETING profile attributes
that may vary by country, system, or convention.

You MUST respond with ONLY valid JSON, no markdown, no code blocks, just the raw JSON object.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const content = response.choices[0].message.content;
      
      // Extract JSON from response (handle cases where it might be wrapped in markdown)
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```')) {
        const lines = jsonContent.split('\n');
        lines.shift(); // Remove first line (```json or ```)
        lines.pop(); // Remove last line (```)
        jsonContent = lines.join('\n');
      }
      
      // Remove any leading/trailing whitespace
      jsonContent = jsonContent.trim();
      
      const result = JSON.parse(jsonContent);

      // Validate structure
      if (!result.matching_results || !Array.isArray(result.matching_results) || result.matching_results.length === 0) {
        throw new Error('Invalid response format: missing matching_results');
      }

      return result.matching_results[0]; // Return first profile result
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to check eligibility: ${error.message}`);
    }
  }

  transformMatchingResults(matchingResult, petitions) {
    const results = [];
    const petitionMap = new Map(petitions.map(p => [p.petition_id, p]));

    // Process matched petitions
    if (matchingResult.matched_petitions && Array.isArray(matchingResult.matched_petitions)) {
      matchingResult.matched_petitions.forEach(match => {
        const petition = petitionMap.get(match.petition_id);
        if (!petition) return;

        // Map match_strength to score and eligible
        const { score, eligible } = this.mapMatchStrengthToScore(match.match_strength);

        results.push({
          petition_id: match.petition_id,
          petition: {
            country: match.country || petition.country,
            visa_type: match.visa_type || petition.visa_type,
            category: petition.category
          },
          score,
          eligible,
          match_strength: match.match_strength,
          confidence_level: match.confidence_level,
          reasoning: match.reasoning || [],
          tie_breaker_rank: match.tie_breaker_rank,
          overallReason: match.reasoning ? match.reasoning.join(' ') : '',
          breakdown: this.createBreakdownFromReasoning(match.reasoning),
          disqualifiers: [],
          recommendations: []
        });
      });
    }

    // Process rejected petitions
    if (matchingResult.rejected_petitions && Array.isArray(matchingResult.rejected_petitions)) {
      matchingResult.rejected_petitions.forEach(rejected => {
        const petition = petitionMap.get(rejected.petition_id);
        if (!petition) return;

        results.push({
          petition_id: rejected.petition_id,
          petition: {
            country: petition.country,
            visa_type: rejected.visa_type || petition.visa_type,
            category: petition.category
          },
          score: 0,
          eligible: false,
          match_strength: 'Rejected',
          confidence_level: 'High',
          reasoning: [rejected.reason],
          overallReason: rejected.reason,
          breakdown: {},
          disqualifiers: [rejected.reason],
          recommendations: []
        });
      });
    }

    return results;
  }

  mapMatchStrengthToScore(matchStrength) {
    switch (matchStrength) {
      case 'Very Strong':
        return { score: 90, eligible: true };
      case 'Strong':
        return { score: 75, eligible: true };
      case 'Weak':
        return { score: 45, eligible: true };
      case 'Rejected':
        return { score: 0, eligible: false };
      default:
        return { score: 50, eligible: true };
    }
  }

  createBreakdownFromReasoning(reasoning) {
    if (!reasoning || !Array.isArray(reasoning)) {
      return {};
    }

    return {
      normalization: {
        score: 0,
        max_score: 0,
        match_details: reasoning.join(' ')
      },
      evaluation: {
        score: 0,
        max_score: 0,
        match_details: 'See reasoning above'
      }
    };
  }

  buildPrompt(profile, petitions) {
    return `You are an expert immigration petition matching engine.
You operate as a deterministic, rules-first evaluator, not a conversational assistant.

Your responsibility includes NORMALIZING and INTERPRETING profile attributes
that may vary by country, system, or convention.

---

INPUTS
1. profile_data: ${JSON.stringify(profile, null, 2)}
2. petition_data: ${JSON.stringify(petitions, null, 2)}

Inputs are provided dynamically and may contain country-specific definitions,
terminology differences, or implicit standards.

---

OBJECTIVE
For the profile in profile_data:
- Evaluate ALL petitions in petition_data
- Match profile to petitions accurately
- Handle cross-country, cross-system, and cross-standard differences correctly
- Produce a clear, auditable matching output

---

NORMALIZATION & EQUIVALENCY LAYER (MANDATORY)

Before evaluation, perform a **Normalization Pass** on profile data.

This pass MUST:
- Standardize values
- Interpret equivalencies
- Avoid literal string comparison where meaning differs by context

### 1️⃣ EDUCATION NORMALIZATION
Interpret education levels based on **country-of-education norms**, not labels alone.

- Professional degrees (e.g., MBBS, B.Tech) must be mapped to equivalent levels

Rule:
- Treat education as "Equivalent Bachelor or higher" if duration, rigor, and field meet petition expectations
- Do NOT reject solely due to naming differences

### 2️⃣ EXPERIENCE & SKILL EQUIVALENCY
Normalize experience considering:
- Country-specific job role naming
- Industry conventions
- Academic vs industry experience (where applicable)

Example:
- "Research Assistant" in academia may count as skilled experience if petition allows
- Internship vs full-time distinctions must be interpreted cautiously

### 3️⃣ LICENSING, TESTS & CREDENTIALS
Normalize certifications, language tests, and licenses:
- Different test names (IELTS, CELPIP, TOEFL) may satisfy the same requirement
- Scores must be interpreted relative to petition expectations
- Local licenses may be equivalent to international ones if functionally comparable

### 4️⃣ LEGAL & EMPLOYMENT CONTEXT NORMALIZATION
Interpret legal and employment attributes contextually:
- Employer sponsorship terminology may differ by country
- Job offers may be implied via contracts or nomination letters
- Immigration status names may differ but represent similar conditions

### 5️⃣ BUSINESS & ENTREPRENEURSHIP CONTEXT
Normalize business signals:
- Startup accelerators, incubators, VC backing may be country-specific
- Government-recognized entities should be treated as equivalent if functionally similar

### 6️⃣ GENERAL RULE (CRITICAL)
NEVER rely on:
- Label names alone
- Country-specific jargon
- Literal string equality

ALWAYS evaluate:
- Functional equivalence
- Intent
- Outcome relevance to petition requirements

If equivalency is unclear:
- Mark the match as "Weak" rather than rejecting outright

---

EVALUATION LOGIC (STRICT ORDER)

STEP 1: TARGET COUNTRY FILTER
Evaluate petitions only if:
petition.country ∈ profile.target_countries

STEP 2: HARD REQUIREMENT CHECK
After normalization, verify ALL hard_requirements.
If any fail → reject.

STEP 3: DISQUALIFIER CHECK
If any disqualifier applies → reject.

STEP 4: SOFT REQUIREMENT SCORING
Evaluate alignment using normalized values.

STEP 5: EDGE CASE HANDLING
Apply petition.edge_case_handling rules explicitly.

STEP 6: TIE-BREAKER RESOLUTION
Resolve overlaps using:
1. tie_breaker_priority
2. confidence_level
3. Strength of normalized alignment

---

MATCH STRENGTH CLASSIFICATION
- Very Strong
- Strong
- Weak
- Rejected

---

OUTPUT FORMAT (MANDATORY)

Return ONE JSON object ONLY:

{
  "matching_results": [
    {
      "profile_id": "${profile.profile_id}",
      "matched_petitions": [
        {
          "petition_id": <number>,
          "visa_type": "<string>",
          "country": "<string>",
          "match_strength": "<Very Strong | Strong | Weak>",
          "confidence_level": "<Low | Medium | High>",
          "reasoning": [
            "<explicit normalized reasoning>"
          ],
          "tie_breaker_rank": <number>
        }
      ],
      "rejected_petitions": [
        {
          "petition_id": <number>,
          "visa_type": "<string>",
          "reason": "<explicit normalized rejection reason>"
        }
      ]
    }
  ]
}

---

CRITICAL CONSTRAINTS
- Do NOT invent data
- Do NOT assume equivalence without justification
- Do NOT change the output schema
- Do NOT output explanations outside JSON
- Be conservative: downgrade confidence rather than reject when uncertain

---

BEGIN PROCESSING USING:
profile_data, petition_data`;
  }
}

module.exports = new EligibilityService();

