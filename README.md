# Visa Eligibility Matching System

A web application that matches user profiles against visa petition criteria using GPT-4 for intelligent eligibility assessment and scoring.

## Features

- **Petition Management**: View and manage visa petitions with detailed criteria
- **Profile Management**: Store and manage user profiles with education, work experience, skills, and visa status
- **Intelligent Matching**: Uses OpenAI GPT-4 to analyze profiles against petition requirements
- **Detailed Scoring**: Provides 0-100 matching scores with breakdowns by category
- **Eligibility Assessment**: Determines eligibility status with detailed explanations
- **Recommendations**: Suggests improvements for better eligibility

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, React Router
- **AI**: OpenAI GPT-4 API
- **Data Storage**: JSON files (petitions.json, profiles.json)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone or navigate to the project directory:
```bash
cd "visa criteria"
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

4. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

5. Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them separately:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Petitions
- `GET /api/petitions` - Get all petitions
- `GET /api/petitions/:id` - Get petition by ID
- `POST /api/petitions` - Create new petition
- `PUT /api/petitions/:id` - Update petition
- `DELETE /api/petitions/:id` - Delete petition

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### Eligibility
- `POST /api/eligibility/check` - Check eligibility (body: `{ profileId, petitionId? }`)
- `POST /api/eligibility/check/:profileId/:petitionId` - Check specific profile against specific petition

## Data Structure

### Petition Structure
Petitions are stored in `backend/data/petitions.json` and include:
- Basic info (country, visa type, category)
- Hard requirements (education, job requirements)
- Soft requirements (work experience, field match)
- Legal requirements
- Disqualifiers
- Profile signals
- Edge case handling

### Profile Structure
Profiles are stored in `backend/data/profiles.json` and include:
- Personal information
- Education details
- Employment history
- Skills
- Legal status
- Language tests
- Business profile (if applicable)
- Canada-specific profile (if applicable)

## How It Works

1. **Data Storage**: Petitions and profiles are stored in JSON files acting as simple databases
2. **Eligibility Check**: When checking eligibility:
   - Profile and petition data are extracted
   - Both are sent to GPT-4 with a structured prompt
   - GPT analyzes the match and returns:
     - Overall score (0-100)
     - Eligibility status
     - Detailed breakdown by category
     - Reasons for match/mismatch
     - Disqualifiers (if any)
     - Recommendations
3. **Scoring**: Scores are calculated based on:
   - Hard requirements match (40% weight)
   - Soft requirements match (30% weight)
   - Skills and experience alignment (20% weight)
   - Visa status compatibility (10% weight)

## Project Structure

```
visa criteria/
├── backend/
│   ├── data/
│   │   ├── petitions.json
│   │   └── profiles.json
│   ├── routes/
│   │   ├── petitions.js
│   │   ├── profiles.js
│   │   └── eligibility.js
│   ├── services/
│   │   └── eligibilityService.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PetitionList.jsx
│   │   │   ├── PetitionDetail.jsx
│   │   │   ├── ProfileList.jsx
│   │   │   ├── ProfileDetail.jsx
│   │   │   ├── EligibilityChecker.jsx
│   │   │   └── EligibilityResults.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
├── package.json
├── .env.example
└── README.md
```

## Notes

- The system uses GPT-4 for intelligent matching. Ensure you have sufficient API credits.
- JSON files are used for simplicity. For production, consider migrating to a proper database.
- The scoring algorithm is defined in the GPT prompt and can be adjusted in `backend/services/eligibilityService.js`.

## License

ISC

