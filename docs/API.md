# api reference

luna culturesync backend api documentation.

**base url:** `http://localhost:8000`

**interactive docs:** `http://localhost:8000/docs` (swagger ui)

## endpoints

### GET /

health check endpoint.

**response:**

```json
{
  "status": "ok",
  "message": "luna culturesync api",
  "version": "0.1.0"
}
```

### GET /health

detailed health check with service status.

**response:**

```json
{
  "status": "healthy",
  "services": {
    "api": "ok",
    "database": "ok"
  }
}
```

---

## assessment endpoints

### POST /api/assessment/start

start a new assessment for a candidate.

**request:**

```json
{
  "name": "john doe",
  "email": "john@example.com"
}
```

| field | type | required | description |
|-------|------|----------|-------------|
| `name` | string | yes | candidate's full name |
| `email` | string | yes | candidate's email (must be unique) |

**response:**

```json
{
  "candidate_id": 1,
  "total_questions": 10,
  "questions": [
    {
      "id": 1,
      "question": "How do you prefer to receive feedback?",
      "type": "multiple_choice",
      "category": "communication",
      "options": [
        {
          "key": "a",
          "text": "Direct and immediate, even if it's critical"
        },
        {
          "key": "b",
          "text": "Scheduled 1:1s with context and examples"
        },
        {
          "key": "c",
          "text": "Written feedback I can process on my own time"
        },
        {
          "key": "d",
          "text": "Informal conversations as things come up"
        }
      ]
    }
  ]
}
```

**error response (400):**

```json
{
  "detail": "email already exists"
}
```

---

### POST /api/assessment/answer

submit an answer for a question.

**request:**

```json
{
  "candidate_id": 1,
  "question_id": 1,
  "answer": "b"
}
```

| field | type | required | description |
|-------|------|----------|-------------|
| `candidate_id` | integer | yes | candidate id from /api/assessment/start |
| `question_id` | integer | yes | question id (1-10) |
| `answer` | string | yes | answer key (a, b, c, or d) |

**response:**

```json
{
  "success": true,
  "next_question_id": 2
}
```

**final question response:**

```json
{
  "success": true,
  "next_question_id": null,
  "assessment_complete": true
}
```

---

### GET /api/assessment/results/{candidate_id}

get assessment results for a candidate.

**path parameters:**

| parameter | type | description |
|-----------|------|-------------|
| `candidate_id` | integer | candidate id |

**response:**

```json
{
  "candidate_id": 1,
  "name": "john doe",
  "email": "john@example.com",
  "culture_fit_score": 78,
  "work_style_score": 82,
  "communication_score": 75,
  "values_score": 77,
  "top_traits": ["collaborative", "growth-oriented", "adaptable"],
  "assessment_status": "completed"
}
```

**error response (404):**

```json
{
  "detail": "candidate not found"
}
```

---

## candidate endpoints

### GET /api/candidates

get all candidates with completed assessments.

**query parameters:**

| parameter | type | default | description |
|-----------|------|---------|-------------|
| `status` | string | all | filter by status: "completed", "in_progress", "all" |
| `min_score` | integer | 0 | minimum culture fit score |
| `limit` | integer | 100 | max results to return |
| `offset` | integer | 0 | pagination offset |

**response:**

```json
[
  {
    "id": 1,
    "name": "john doe",
    "email": "john@example.com",
    "assessment_status": "completed",
    "culture_fit_score": 78,
    "top_traits": ["collaborative", "growth-oriented", "adaptable"],
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "jane smith",
    "email": "jane@example.com",
    "assessment_status": "completed",
    "culture_fit_score": 85,
    "top_traits": ["autonomous", "structured", "direct communicator"],
    "created_at": "2024-01-16T14:20:00Z"
  }
]
```

---

## feedback endpoints

### POST /api/feedback

submit user feedback.

**request:**

```json
{
  "message": "the assessment was great!",
  "user_type": "candidate",
  "page": "assessment"
}
```

| field | type | required | description |
|-------|------|----------|-------------|
| `message` | string | yes | feedback message |
| `user_type` | string | no | "candidate" or "employer" |
| `page` | string | no | page where feedback was submitted |

**response:**

```json
{
  "success": true,
  "message": "feedback submitted"
}
```

---

## data types

### StartAssessmentRequest

```typescript
interface StartAssessmentRequest {
  name: string;
  email: string;
}
```

### StartAssessmentResponse

```typescript
interface StartAssessmentResponse {
  candidate_id: number;
  total_questions: number;
  questions: Question[];
}

interface Question {
  id: number;
  question: string;
  type: "multiple_choice";
  category: "work_style" | "communication" | "values";
  options: Option[];
}

interface Option {
  key: string;
  text: string;
}
```

### SubmitAnswerRequest

```typescript
interface SubmitAnswerRequest {
  candidate_id: number;
  question_id: number;
  answer: string;
}
```

### SubmitAnswerResponse

```typescript
interface SubmitAnswerResponse {
  success: boolean;
  next_question_id: number | null;
  assessment_complete?: boolean;
}
```

### AssessmentResults

```typescript
interface AssessmentResults {
  candidate_id: number;
  name: string;
  email: string;
  culture_fit_score: number;
  work_style_score: number;
  communication_score: number;
  values_score: number;
  top_traits: string[];
  assessment_status: "completed" | "in_progress";
}
```

### Candidate

```typescript
interface Candidate {
  id: number;
  name: string;
  email: string;
  assessment_status: "completed" | "in_progress";
  culture_fit_score: number | null;
  top_traits: string[] | null;
  created_at: string;
}
```

### FeedbackRequest

```typescript
interface FeedbackRequest {
  message: string;
  user_type?: string;
  page?: string;
}
```

### FeedbackResponse

```typescript
interface FeedbackResponse {
  success: boolean;
  message: string;
}
```

---

## question categories

assessment questions are divided into three categories:

| category | questions | description |
|----------|-----------|-------------|
| work_style | 1, 4, 7, 10 | how you prefer to work |
| communication | 2, 5, 8 | how you communicate and receive feedback |
| values | 3, 6, 9 | what matters most to you |

---

## cors

the backend allows requests from:
- `http://localhost:1420` (tauri dev server)
- `http://tauri.localhost`
- `tauri://localhost`

---

## examples

### curl: start assessment

```bash
curl -X POST http://localhost:8000/api/assessment/start \
  -H "Content-Type: application/json" \
  -d '{"name": "john doe", "email": "john@example.com"}'
```

### curl: submit answer

```bash
curl -X POST http://localhost:8000/api/assessment/answer \
  -H "Content-Type: application/json" \
  -d '{"candidate_id": 1, "question_id": 1, "answer": "b"}'
```

### curl: get results

```bash
curl http://localhost:8000/api/assessment/results/1
```

### curl: get candidates

```bash
curl "http://localhost:8000/api/candidates?status=completed&min_score=70"
```

### curl: submit feedback

```bash
curl -X POST http://localhost:8000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"message": "great app!", "user_type": "candidate", "page": "results"}'
```

### javascript: full assessment flow

```javascript
const API = "http://localhost:8000";

// step 1: start assessment
const startResponse = await fetch(`${API}/api/assessment/start`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "john doe", email: "john@example.com" })
});
const { candidate_id, questions } = await startResponse.json();

// step 2: answer questions
for (const question of questions) {
  const answer = getUserAnswer(question); // your ui logic

  await fetch(`${API}/api/assessment/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_id,
      question_id: question.id,
      answer
    })
  });
}

// step 3: get results
const resultsResponse = await fetch(`${API}/api/assessment/results/${candidate_id}`);
const results = await resultsResponse.json();

console.log(`culture fit score: ${results.culture_fit_score}`);
console.log(`top traits: ${results.top_traits.join(", ")}`);
```
