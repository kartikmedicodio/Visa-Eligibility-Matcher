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

    const results = [];

    for (const petition of petitions) {
      if (!petition) continue;
      
      try {
        const result = await this.checkSingleEligibility(profile, petition);
        results.push({
          petition_id: petition.petition_id,
          petition: {
            country: petition.country,
            visa_type: petition.visa_type,
            category: petition.category
          },
          ...result
        });
      } catch (error) {
        console.error(`Error checking eligibility for petition ${petition.petition_id}:`, error);
        results.push({
          petition_id: petition.petition_id,
          error: error.message,
          score: 0,
          eligible: false
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => (b.score || 0) - (a.score || 0));

    return results;
  }

  async checkSingleEligibility(profile, petition) {
    const prompt = this.buildPrompt(profile, petition);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert immigration lawyer specializing in visa eligibility assessment. Analyze profiles against petition criteria and provide detailed, accurate scoring and explanations. You MUST respond with ONLY valid JSON, no markdown, no code blocks, just the raw JSON object."
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

      return {
        score: result.score || 0,
        eligible: result.eligible || false,
        breakdown: result.breakdown || {},
        overallReason: result.overallReason || "",
        disqualifiers: result.disqualifiers || [],
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to check eligibility: ${error.message}`);
    }
  }

  buildPrompt(profile, petition) {
    return `Analyze the following profile against the petition criteria and provide a detailed eligibility assessment.

PROFILE DATA:
${JSON.stringify(profile, null, 2)}

PETITION DATA:
${JSON.stringify(petition, null, 2)}

INSTRUCTIONS:
1. Evaluate the profile against ALL hard requirements, soft requirements, and disqualifiers
2. Calculate a matching score from 0-100 based on:
   - Exact matches for hard requirements (weight: 40%)
   - Partial matches for soft requirements (weight: 30%)
   - Skills and experience alignment (weight: 20%)
   - Visa status compatibility (weight: 10%)
3. Check for any disqualifiers - if any disqualifier applies, the profile is NOT eligible
4. Consider edge cases mentioned in the petition's edge_case_handling
5. Provide detailed breakdown by category

CRITICAL: You MUST respond with ONLY valid JSON. Do not include markdown code blocks, explanations outside the JSON, or any other text. Return ONLY the JSON object.

RESPONSE FORMAT (JSON ONLY):
{
  "score": <number 0-100>,
  "eligible": <boolean>,
  "breakdown": {
    "hard_requirements": {
      "score": <number>,
      "max_score": <number>,
      "match_details": "<explanation>",
      "matched_items": [<list of matched requirements>],
      "missing_items": [<list of missing requirements>]
    },
    "soft_requirements": {
      "score": <number>,
      "max_score": <number>,
      "match_details": "<explanation>",
      "matched_items": [<list>],
      "missing_items": [<list>]
    },
    "skills_experience": {
      "score": <number>,
      "max_score": <number>,
      "match_details": "<explanation>"
    },
    "visa_status": {
      "score": <number>,
      "max_score": <number>,
      "match_details": "<explanation>"
    }
  },
  "overallReason": "<detailed explanation of why this profile matches or doesn't match, including specific reasons>",
  "disqualifiers": [<list of disqualifiers that apply, if any>],
  "recommendations": [<actionable recommendations for improving eligibility, if applicable>]
}

Be thorough, accurate, and provide specific details in your analysis. Remember: Return ONLY the JSON object, nothing else.`;
  }
}

module.exports = new EligibilityService();

