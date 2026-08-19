# SinergiKita Community OS - API Documentation

Base URL: `/api`

## Authentication
All protected endpoints require a Firebase ID token passed in the Authorization header:
`Authorization: Bearer <FIREBASE_ID_TOKEN>`

---

### Endpoints

#### 1. System Health
- **GET** `/api/health`
- **Description**: Returns server operational status.
- **Response**: `{ "status": "ok" }`

#### 2. AI Recommendations
- **GET** `/api/recommendations`
- **Description**: Generates expert community recommendations using Gemini.
- **Auth**: Required (`verifyFirebaseToken`)
- **Rate Limit**: 20 req/min

#### 3. Financial Management (`/api/finances`)
- **GET** `/api/finances?tenantId=<tenant_id>`
- **Description**: Fetches financial transactions scoped to the user's community tenant (or global for superadmins).
- **POST** `/api/finances`
- **Description**: Adds a new financial record (income/expense). Restricted to admin, ketua, bendahara.

#### 4. AI Insights & Smart Tips (`/api/ai` & `/api/community`)
- **POST** `/api/ai/insights`
- **Description**: Generates weekly executive summary of community health (finance, members, activities).
- **POST** `/api/ai/smart-tips` (or `/api/community/smart-tips`)
- **Description**: Generates actionable smart tips based on incident response data.
