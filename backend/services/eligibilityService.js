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
      
      console.log('\n=== OPENAI RAW RESPONSE ===');
      console.log('Raw content length:', content.length);
      console.log('Raw content (first 500 chars):', content.substring(0, 500));
      
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
      
      console.log('\n=== PARSED JSON CONTENT ===');
      console.log('JSON content length:', jsonContent.length);
      
      const result = JSON.parse(jsonContent);

      console.log('\n=== PARSED RESULT STRUCTURE ===');
      console.log('Has matching_results:', !!result.matching_results);
      console.log('matching_results type:', Array.isArray(result.matching_results) ? 'array' : typeof result.matching_results);
      console.log('matching_results length:', result.matching_results?.length);
      
      if (result.matching_results && result.matching_results.length > 0) {
        const firstResult = result.matching_results[0];
        console.log('First result keys:', Object.keys(firstResult));
        console.log('Has matched_petitions:', !!firstResult.matched_petitions);
        console.log('Matched petitions count:', firstResult.matched_petitions?.length);
        console.log('Has rejected_petitions:', !!firstResult.rejected_petitions);
        console.log('Rejected petitions count:', firstResult.rejected_petitions?.length);
        
        if (firstResult.matched_petitions) {
          console.log('\n=== MATCHED PETITIONS DETAILS ===');
          firstResult.matched_petitions.forEach((match, idx) => {
            console.log(`\nPetition ${idx + 1}:`);
            console.log('  - petition_id:', match.petition_id);
            console.log('  - visa_type:', match.visa_type);
            console.log('  - match_strength:', match.match_strength);
            console.log('  - match_percentage:', match.match_percentage);
            console.log('  - points_earned:', match.points_earned);
            console.log('  - total_points:', match.total_points);
            console.log('  - confidence_level:', match.confidence_level);
          });
        }
        
        if (firstResult.rejected_petitions) {
          console.log('\n=== REJECTED PETITIONS DETAILS ===');
          firstResult.rejected_petitions.forEach((rejected, idx) => {
            console.log(`\nRejected ${idx + 1}:`);
            console.log('  - petition_id:', rejected.petition_id);
            console.log('  - visa_type:', rejected.visa_type);
            console.log('  - reason:', rejected.reason);
            console.log('  - match_percentage:', rejected.match_percentage);
            console.log('  - points_earned:', rejected.points_earned);
          });
        }
      }

      // Validate structure
      if (!result.matching_results || !Array.isArray(result.matching_results) || result.matching_results.length === 0) {
        console.error('\n=== ERROR: Invalid response structure ===');
        console.error('Full result:', JSON.stringify(result, null, 2));
        throw new Error('Invalid response format: missing matching_results');
      }

      console.log('\n=== RETURNING FIRST PROFILE RESULT ===');
      return result.matching_results[0]; // Return first profile result
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to check eligibility: ${error.message}`);
    }
  }

  transformMatchingResults(matchingResult, petitions) {
    console.log('\n=== TRANSFORMING MATCHING RESULTS ===');
    console.log('Input matchingResult keys:', Object.keys(matchingResult));
    
    const results = [];
    const petitionMap = new Map(petitions.map(p => [p.petition_id, p]));

    // Process matched petitions
    if (matchingResult.matched_petitions && Array.isArray(matchingResult.matched_petitions)) {
      console.log('Processing', matchingResult.matched_petitions.length, 'matched petitions');
      
      matchingResult.matched_petitions.forEach((match, idx) => {
        console.log(`\n--- Processing matched petition ${idx + 1} ---`);
        console.log('Match object:', JSON.stringify(match, null, 2));
        
        const petition = petitionMap.get(match.petition_id);
        if (!petition) {
          console.log('WARNING: Petition not found for ID:', match.petition_id);
          return;
        }

        // Use match_percentage if available, otherwise map from match_strength
        let score, eligible;
        if (match.match_percentage !== undefined) {
          score = Math.round(match.match_percentage);
          eligible = match.match_strength !== 'Rejected' && score >= 50;
          console.log('Using match_percentage:', match.match_percentage, '-> score:', score);
        } else {
          const mapped = this.mapMatchStrengthToScore(match.match_strength);
          score = mapped.score;
          eligible = mapped.eligible;
          console.log('Using match_strength mapping:', match.match_strength, '-> score:', score);
        }
        
        console.log('Final score:', score, 'eligible:', eligible);

        const transformedResult = {
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
          points_earned: match.points_earned,
          total_points: match.total_points,
          match_percentage: match.match_percentage,
          points_breakdown: match.points_breakdown || {},
          reasoning: match.reasoning || [],
          tie_breaker_rank: match.tie_breaker_rank,
          overallReason: match.reasoning ? match.reasoning.join(' ') : '',
          breakdown: this.createBreakdownFromPoints(match.points_breakdown, match.reasoning),
          disqualifiers: [],
          recommendations: []
        };
        
        console.log('Transformed result for petition', match.petition_id, ':', {
          score: transformedResult.score,
          match_percentage: transformedResult.match_percentage,
          points_earned: transformedResult.points_earned,
          total_points: transformedResult.total_points
        });
        
        results.push(transformedResult);
      });
    } else {
      console.log('No matched_petitions found or not an array');
    }

    // Process rejected petitions
    if (matchingResult.rejected_petitions && Array.isArray(matchingResult.rejected_petitions)) {
      console.log('Processing', matchingResult.rejected_petitions.length, 'rejected petitions');
      
      matchingResult.rejected_petitions.forEach((rejected, idx) => {
        console.log(`\n--- Processing rejected petition ${idx + 1} ---`);
        console.log('Rejected object:', JSON.stringify(rejected, null, 2));
        
        const petition = petitionMap.get(rejected.petition_id);
        if (!petition) {
          console.log('WARNING: Petition not found for ID:', rejected.petition_id);
          return;
        }

        // Use match_percentage if available, otherwise calculate from points
        let rejectedScore = 0;
        let rejectedPercentage = 0;
        
        if (rejected.match_percentage !== undefined && rejected.match_percentage !== null) {
          rejectedScore = Math.round(rejected.match_percentage);
          rejectedPercentage = rejected.match_percentage;
        } else if (rejected.points_earned !== undefined && rejected.total_points !== undefined && rejected.total_points > 0) {
          rejectedPercentage = (rejected.points_earned / rejected.total_points) * 100;
          rejectedScore = Math.round(rejectedPercentage);
        }
        
        console.log('Rejected petition score calculation:', {
          match_percentage: rejected.match_percentage,
          points_earned: rejected.points_earned,
          total_points: rejected.total_points,
          calculated_score: rejectedScore,
          calculated_percentage: rejectedPercentage
        });

        const rejectedResult = {
          petition_id: rejected.petition_id,
          petition: {
            country: rejected.country || petition.country,
            visa_type: rejected.visa_type || petition.visa_type,
            category: petition.category
          },
          score: rejectedScore,
          eligible: false,
          match_strength: 'Rejected',
          confidence_level: 'High',
          points_earned: rejected.points_earned !== undefined ? rejected.points_earned : 0,
          total_points: rejected.total_points || 100,
          match_percentage: rejectedPercentage,
          points_breakdown: rejected.points_breakdown || {},
          reasoning: rejected.reasoning || [rejected.reason],
          tie_breaker_rank: rejected.tie_breaker_rank,
          overallReason: rejected.reasoning ? rejected.reasoning.join(' ') : rejected.reason,
          breakdown: this.createBreakdownFromPoints(rejected.points_breakdown, rejected.reasoning || [rejected.reason]),
          disqualifiers: rejected.failed_requirements || [rejected.reason],
          recommendations: []
        };
        
        console.log('Transformed rejected result for petition', rejected.petition_id);
        results.push(rejectedResult);
      });
    } else {
      console.log('No rejected_petitions found or not an array');
    }

    console.log('\n=== FINAL TRANSFORMED RESULTS ===');
    console.log('Total results:', results.length);
    results.forEach((r, idx) => {
      console.log(`Result ${idx + 1} - Petition ${r.petition_id}: score=${r.score}, percentage=${r.match_percentage}, points=${r.points_earned}/${r.total_points}`);
    });

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

  createBreakdownFromPoints(pointsBreakdown, reasoning) {
    const breakdown = {};
    
    if (pointsBreakdown) {
      // Create breakdown from points
      if (pointsBreakdown.hard_requirements) {
        breakdown.hard_requirements = {
          score: Object.values(pointsBreakdown.hard_requirements).reduce((sum, pts) => sum + (pts || 0), 0),
          max_score: Object.values(pointsBreakdown.hard_requirements).reduce((sum, pts) => sum + (pts || 0), 0),
          match_details: 'Points earned for hard requirements',
          points: pointsBreakdown.hard_requirements
        };
      }
      
      if (pointsBreakdown.soft_requirements) {
        breakdown.soft_requirements = {
          score: Object.values(pointsBreakdown.soft_requirements).reduce((sum, pts) => sum + (pts || 0), 0),
          max_score: Object.values(pointsBreakdown.soft_requirements).reduce((sum, pts) => sum + (pts || 0), 0),
          match_details: 'Points earned for soft requirements',
          points: pointsBreakdown.soft_requirements
        };
      }
      
      if (pointsBreakdown.legal_requirements) {
        breakdown.legal_requirements = {
          score: Object.values(pointsBreakdown.legal_requirements).reduce((sum, pts) => sum + (pts || 0), 0),
          max_score: Object.values(pointsBreakdown.legal_requirements).reduce((sum, pts) => sum + (pts || 0), 0),
          match_details: 'Points earned for legal requirements',
          points: pointsBreakdown.legal_requirements
        };
      }
      
      if (pointsBreakdown.bonus_points) {
        breakdown.bonus_points = {
          score: Object.values(pointsBreakdown.bonus_points).reduce((sum, pts) => sum + (pts || 0), 0),
          max_score: Object.values(pointsBreakdown.bonus_points).reduce((sum, pts) => sum + (pts || 0), 0),
          match_details: 'Bonus points earned',
          points: pointsBreakdown.bonus_points
        };
      }
    }
    
    // Add reasoning if available
    if (reasoning && Array.isArray(reasoning) && reasoning.length > 0) {
      breakdown.reasoning = {
        score: 0,
        max_score: 0,
        match_details: reasoning.join(' ')
      };
    }
    
    return breakdown;
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

STEP 1: POINT-BASED SCORING (CRITICAL - DO THIS FIRST FOR ALL PETITIONS)
Each petition includes a scoring_weights object that defines points for each requirement.

For EACH petition (regardless of target country or hard requirements):
1. Check if petition.scoring_weights exists
2. Calculate points earned based on PROFILE ATTRIBUTES ONLY:
   - Hard requirements: Award full points if the PROFILE HAS the attribute/qualification (after normalization), 0 if not
   - Soft requirements: Award full points if PROFILE FULLY MEETS the requirement, partial points if partially met, 0 if not met
   - Legal requirements: Award full points if PROFILE MEETS the requirement, 0 if not
   - Bonus points: Award if PROFILE MEETS the bonus criteria
3. Calculate total_points_earned (sum of ALL points awarded, including partial points)
4. Calculate match_percentage = (total_points_earned / total_points) * 100

CRITICAL RULES FOR POINT CALCULATION:
- Evaluate each requirement INDEPENDENTLY based on what the profile ACTUALLY has
- Do NOT set points to 0 just because target country doesn't match
- Do NOT set points to 0 just because other hard requirements fail
- For example: If profile has Master's degree, award education points even if target country doesn't match
- For example: If profile has work experience, award experience points even if they don't have language test
- Only set points to 0 if the profile ACTUALLY doesn't have that specific attribute/qualification

EXAMPLE: 
- Profile has Master's degree, 3 years experience, but doesn't target Canada
- For Canada petition: Still award points for education (25 points) and experience (10 points) = 35 points total
- Then mark as REJECTED due to target country mismatch, but show 35/100 points (35%)

STEP 2: TARGET COUNTRY FILTER
Check if: petition.country ∈ profile.target_countries
- If NO: Mark as REJECTED with reason "Profile does not target [country]"
- If YES: Continue to next step
- BUT: Still include the calculated points_earned and match_percentage from STEP 1

STEP 3: HARD REQUIREMENT CHECK
After normalization, verify ALL hard_requirements.
- If any fail → mark as REJECTED
- BUT: Still include the calculated points_earned and match_percentage from STEP 1
- The points_earned should reflect what was actually met (some hard requirements might pass, soft requirements might pass, etc.)

STEP 4: DISQUALIFIER CHECK
If any disqualifier applies → mark as REJECTED
- BUT: Still include the calculated points_earned and match_percentage from STEP 1

STEP 5: DETERMINE MATCH STRENGTH
- If petition is REJECTED: match_strength = "Rejected" (but still show calculated points)
- If NOT rejected, use match_percentage:
  - Very Strong: >= 85%
  - Strong: >= 70% and < 85%
  - Weak: >= 50% and < 70%
  - Rejected: < 50%

CRITICAL RULES: 
1. ALWAYS calculate points for ALL requirements, even if the petition will be rejected
2. Do NOT set points to 0 just because target country doesn't match or hard requirements fail
3. Calculate points independently for each requirement category
4. For example, if target country doesn't match but profile has relevant education/experience, still award points for those
5. The points_earned should represent what the profile ACTUALLY meets, not what it would need to be eligible

STEP 5: EDGE CASE HANDLING
Apply petition.edge_case_handling rules explicitly.

STEP 6: TIE-BREAKER RESOLUTION
Resolve overlaps using:
1. tie_breaker_priority
2. confidence_level
3. Match percentage (higher is better)
4. Strength of normalized alignment

---

MATCH STRENGTH CLASSIFICATION
- Very Strong (>= 85% match)
- Strong (>= 70% and < 85% match)
- Weak (>= 50% and < 70% match)
- Rejected (< 50% match OR hard requirement failure OR disqualifier)

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
          "points_earned": <number>,
          "total_points": <number>,
          "match_percentage": <number 0-100>,
          "points_breakdown": {
            "hard_requirements": {
              "<requirement_name>": <points_earned>,
              ...
            },
            "soft_requirements": {
              "<requirement_name>": <points_earned>,
              ...
            },
            "legal_requirements": {
              "<requirement_name>": <points_earned>,
              ...
            },
            "bonus_points": {
              "<bonus_name>": <points_earned>,
              ...
            }
          },
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
          "country": "<string>",
          "reason": "<explicit normalized rejection reason>",
          "points_earned": <number - MUST calculate even if rejected>,
          "total_points": <number>,
          "match_percentage": <number 0-100 - MUST calculate based on points_earned>,
          "points_breakdown": {
            "hard_requirements": {
              "<requirement_name>": <points_earned>,
              ...
            },
            "soft_requirements": {
              "<requirement_name>": <points_earned>,
              ...
            },
            "legal_requirements": {
              "<requirement_name>": <points_earned>,
              ...
            },
            "bonus_points": {
              "<bonus_name>": <points_earned>,
              ...
            }
          },
          "failed_requirements": [<list of failed requirement names>],
          "reasoning": [
            "<explicit normalized reasoning showing what was met and what failed>"
          ]
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

