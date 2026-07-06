# Features

A comprehensive breakdown of all existing features, planned features, and the product roadmap for the Amber platform.

> For the full product vision, technical deep-dives, and styling direction, see [BLUEPRINT.md](./BLUEPRINT.md).

---

## Existing Features — Job Seeker Side

### Personality Assessment
- **Big Five Assessment** — A 10-question assessment that measures the five core personality dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (OCEAN). Questions are grouped into work style (4 questions), communication (3 questions), and values (3 questions) categories, each with four response options that map to specific trait scores.
- **Scoring Engine** — Responses are aggregated across 14 personality dimensions (structure, planning, autonomy, flexibility, adaptability, focus, directness, communication, collaboration, learning, impact, growth, alignment, balance), then normalized into 0–100 scores for each OCEAN dimension. Four derived composite scores are also calculated: culture fit (35% work style + 35% communication + 30% values), work style, communication, and values.
- **Top Traits** — After assessment completion, the system identifies 3–5 key personality descriptors (e.g., "Highly Adaptable", "Team Player", "Detail-Oriented", "Direct Communicator") with contextual explanations.
- **Supplementary Assessments** — Additional assessments are available for deeper personality profiling:
  - Visual Perception Assessment — spatial reasoning and pattern recognition
  - Work Values Assessment — workplace principles and priorities
  - Situational Judgment Assessment — scenario-based decision making
  - Cognitive Pattern Assessment — pattern matching and analytical thinking

### Personality Insights
- **Archetype Classification** — Each candidate is classified into one of 8 personality archetypes based on their dominant OCEAN traits:
  - **The Innovator** — High openness, low-mid conscientiousness. Creative thinker who thrives in cultures that value innovation and agility.
  - **The Architect** — High conscientiousness, mid openness. Systematic builder suited for organizations focused on quality and stability.
  - **The Connector** — High extraversion and agreeableness. Relationship builder who thrives in collaborative, people-first cultures.
  - **The Catalyst** — High extraversion and openness, low agreeableness. Bold leader who excels in fast-paced, growth-oriented environments.
  - **The Craftsperson** — High conscientiousness, low extraversion. Detail-oriented executor who fits quality-driven, structured workplaces.
  - **The Harmonizer** — High agreeableness, low neuroticism. Empathetic mediator who thrives in mission-driven, balanced teams.
  - **The Explorer** — High openness, low neuroticism. Curious adventurer who fits innovation-forward, autonomous cultures.
  - **The Strategist** — High conscientiousness and openness. Analytical thinker suited for growth-oriented, impact-focused companies.
- **Trait Breakdown** — Detailed view of each OCEAN dimension with score, percentile context, and what it means for workplace behavior.
- **Confidence Scoring** — Shows how confident the assessment is in the personality match based on data completeness: +40 for OCEAN scores present, +30 for complete profile, +7 per supplementary assessment.

### Job Matching
- **Top Matches Dashboard** — A ranked list of employer roles sorted by overall compatibility percentage (0–100%). Each match card shows the company, role title, match score, and key compatibility highlights.
- **Match Score Breakdown** — For each match, candidates can view a detailed breakdown: trait match score (40% weight), culture match score (30% weight), work style score (20% weight), and communication fit score (10% weight), plus per-dimension alignment.
- **Ember Agent Analysis** — AI-powered personality compatibility analysis that provides natural language insights about each potential match, including strengths, cautions, highlights, and tips for succeeding in that role.
- **Saved Matches** — Bookmark and shortlist roles for later review, with notes and status tracking.

### Network Hub
- **Discover Roles** — Browse available roles with filters for location, salary range, work style, and personality fit.
- **Discover People** — Browse candidate and employer profiles for networking.
- **Discover Companies** — Browse company profiles with culture information.
- **Activity Feed** — Social feed with user posts, hobby tags, and engagement.

### Connections
- **Send Connection Requests** — Initiate connections with employers, with optional message and meeting invite (proposed times + duration).
- **Manage Connections** — View all pending, accepted, and rejected connections. Accept incoming requests from employers.
- **Meet Invites** — Bundle a coffee chat invite with the connection request, including proposed meeting times.

### Coffee Chats
- **Request Coffee Chats** — Created automatically when a connection with a meet invite is accepted, or initiated directly.
- **Chat Management** — View all pending, accepted, scheduled, and completed coffee chats in a calendar view and list view.
- **Scheduling** — Accept scheduled times and meeting links set by employers.
- **Real-Time Messaging** — Send and receive messages within coffee chat threads via Supabase realtime. Up to 3 floating chat panels open simultaneously with unread counts.
- **Post-Chat Feedback** — After a coffee chat is completed, leave a 1–5 star rating and written feedback about the experience.
- **Ember Prep Briefs** — Before a coffee chat, Ember generates a personality-based preparation brief with key traits, conversation topics, and friction points to navigate.

### Practice
- **Practice Coffee Chat** — Mock interview preparation interface for practicing before real coffee chats.

### Profile Management
- **Basic Profile** — Set headline, bio, location, and years of experience.
- **Work Preferences** — Configure preferred work style (remote, hybrid, onsite, flexible), preferred company size (startup, small, medium, large), and salary expectations.
- **Social Links** — Add LinkedIn, GitHub, and portfolio URLs.
- **Avatar Upload** — Upload a profile photo stored in Supabase Storage.

### Dashboard
- **Job Seeker Dashboard** — Central hub showing:
  - Dashboard header with greeting and profile completion status
  - Quick actions (assessment, roles, chats)
  - Top matches carousel (3–4 highlighted matches)
  - Full matching table with pagination
  - Schedule widget showing upcoming coffee chats
  - Archetype strip displaying personality archetype
  - Compatibility insights with match score breakdown
  - Streak tracker for activity engagement
  - Setup modal for incomplete profiles

### Settings
- **Appearance** — Toggle between Amber Light and Amber Dark themes.
- **Notifications** — Configure email preferences for updates, match alerts, messages, and newsletter.
- **Privacy** — Control profile visibility and salary expectation display.
- **Account** — Manage email, password, and account deletion.
- **Subscription** — View and manage subscription plan via Stripe.
- **Feedback** — Submit bug reports, feature requests, and general feedback with optional ratings.

---

## Existing Features — Employer Side

### Culture Definition
- **Culture Quiz** — An 8-question interactive quiz where employers define their company's personality preferences by setting ideal scores for each OCEAN dimension and selecting their top culture values from 20 predefined values (innovation, transparency, collaboration, autonomy, growth, impact, balance, diversity, customer focus, excellence, agility, integrity, creativity, stability, speed, quality, mission, empathy, risk, trust).
- **Culture Profile** — After completing the quiz, employers get a company personality profile with descriptive insights about what kind of candidates would thrive in their culture.

### Culture Insights
- **Company Archetype** — The company is classified into one of 8 archetypes based on its OCEAN preferences (Innovator, Optimizer, Collaborator, Driver, Stabilizer, Visionary, Nurturer, Challenger), giving employers a clear picture of their culture identity.
- **Ideal Candidate Profile** — Recommendations for the personality types that would be the best fit for the company culture.
- **Supplementary Culture Assessments:**
  - Team Dynamics Assessment — how teams interact and collaborate
  - Leadership Style Assessment — management and leadership approach
  - Growth Philosophy Assessment — learning and development orientation
  - Work Environment Assessment — physical and cultural environment preferences

### Role Management
- **Create Roles** — Build job listings with:
  - Title, description, and detailed requirements
  - Nice-to-have qualifications
  - Location and work style (remote, hybrid, onsite)
  - Salary range
  - Employment type (full-time, part-time, contract, internship)
  - Personality requirement ranges (min/max for each OCEAN trait) to filter candidates by personality fit
- **Manage Roles** — Edit, activate, pause, or close roles. Track role status through the lifecycle: Draft, Active, Paused, Closed.

### Candidate Discovery
- **Top Candidates Dashboard** — AI-ranked list of all candidates sorted by culture and personality fit.
- **Network Hub** — Browse candidates through the network with filters and sorting.
- **Candidate Profiles** — View detailed candidate personality breakdowns, archetype, scoring details, and per-dimension analysis.
- **Ember Agent Analysis** — Employer-side Ember agent that provides ranked candidate lists with natural language insights about each candidate's compatibility, optionally filtered by a specific role.

### Connections
- **Inbox Panel** — View incoming connection requests from candidates with actions to accept or reject.
- **Send Connection Requests** — Initiate connections with top candidates, with optional message and meeting invite.
- **Auto Coffee Chat** — When a connection with a meet invite is accepted, a coffee chat is automatically created.

### Coffee Chats
- **Manage Requests** — View incoming requests from candidates and accept, decline, or reschedule.
- **Schedule Chats** — Set date, time, and meeting link (Zoom, Google Meet, Teams, etc.).
- **Real-Time Messaging** — Chat with candidates in real-time via floating message panels.
- **Post-Chat Feedback** — Leave a 1–5 star rating and written feedback after each conversation.
- **Chat History** — Full record of all past and current coffee chats with feedback.
- **Ember Prep Briefs** — Personality-based preparation for upcoming chats.

### Dashboard
- **Employer Dashboard** — Central hub showing:
  - Quick actions (culture quiz, roles, browse candidates)
  - Candidate table with match scores and pagination
  - Archetype strip displaying company culture archetype
  - Active roles summary
  - Pending and upcoming coffee chats
  - Setup modal for incomplete employer profiles

### Settings
- Same settings as candidates: Appearance, Notifications, Privacy, Account, Subscription, and Feedback.

---

## Existing Shared Features

### Authentication
- **Multi-Provider Auth** — Email/password, Google OAuth, and GitHub OAuth via Supabase Auth.
- **Email Verification** — New accounts must verify their email before accessing the app.
- **Password Reset** — Self-service password recovery via email.
- **Role Selection** — After signup, users choose between Job Seeker and Employer. This determines their experience throughout the app.
- **Onboarding Wizard** — Role-specific setup that guides users through profile completion, preferences, and (for employers) the culture quiz.
- **Protected Routes** — All authenticated routes are guarded by `ProtectedRoute` with optional role-based enforcement.
- **Dev Mode** — When `SUPABASE_JWT_SECRET` is not configured, the backend skips authentication for local development.

### Landing Page
- **Animated Welcome Screen** — Full landing page with hero section, animated product demo, value propositions, process steps, and call-to-action sections.
- **Interactive Elements** — Magnetic buttons, cursor spotlight, tilt cards, animated blobs, coffee steam, typewriter/text-scramble headlines, animated stat counters, and a scroll progress bar.
- **Content Sections** — Feature bento grid, live stats section, product showcase and product journey walkthroughs, interactive dashboard preview, and an FAQ accordion.
- **Floating Theme Selector** — Switch between Amber Light and Amber Dark directly from the landing page.
- **Public Navigation** — Landing nav with links to all public pages.
- **Footer** — Links to company pages, legal pages, and social media (Instagram, LinkedIn, TikTok).

### Public Pages
- About, Blog (with article detail), Careers, Press, Science (methodology), Help Center, Changelog, Status Page, Privacy Policy, Terms of Service, Cookie Policy, and Accessibility Statement.

### Ember Agent (AI Matching Engine)
- **Bidirectional Analysis** — Works from both the candidate perspective ("How compatible am I with this role?") and the employer perspective ("Which candidates fit our culture?").
- **8x8 Archetype Compatibility Matrix** — Maps all 64 possible candidate-to-employer archetype pairings with bonus modifiers (-10 to +10), synergy notes, and friction warnings.
- **Insight Generation** — Up to 8 actionable insights per match, categorized as strengths, cautions, highlights, and tips.
- **Natural Language Summaries** — Score-tier-based assessments with hiring recommendations.
- **Animated UI** — Flame mascot with mood-based animations, typing simulation during analysis, circular score rings, and dimension comparison bars.
- **Client-Side Fallback** — If the backend is unavailable, the frontend runs the matching algorithm locally using data from Supabase.

### Payments
- **Stripe Integration** — Full checkout session creation, customer portal for subscription management, webhook handling for 4 event types (checkout completed, invoice paid, invoice failed, subscription deleted), and subscription status API. Graceful fallback to demo data when Stripe is not configured.

### Real-Time Features
- **Supabase Realtime** — Postgres changes subscriptions for:
  - Messages (instant delivery in chat panels)
  - Connections (live inbox updates)
  - Coffee chats (status change notifications)
- **Floating Chat Panels** — Up to 3 open simultaneously with minimize/maximize, unread counts, and timestamp grouping.

---

## Planned Features — Next Up

> For detailed technical specifications on each phase, see [BLUEPRINT.md](./BLUEPRINT.md).

### Phase 1: Conversational Ember AI
Transform Ember from a scoring engine into a conversational AI agent that conducts natural, open-ended personality interviews instead of rigid multiple-choice quizzes.

- Natural language personality interviews using OpenAI (already installed as dependency)
- LangChain orchestration for multi-step trait extraction from conversation
- Hybrid mode: candidates choose between quick 10-question assessment or full Ember conversation
- Ongoing Ember interactions as a persistent career advisor (match explanations, pre-chat coaching)
- Conversation transcripts stored with trait annotations for improving extraction accuracy over time

### Phase 2: Team DNA Mapping
Match candidates to specific teams, not just companies. Let employers map existing team personality composition and find candidates who complement gaps.

- Team personality mapping via lightweight assessments for existing team members
- Team composition analysis: archetype distribution, personality gaps, balance score
- Complementary matching: "culture add" mode alongside existing "culture fit" mode
- Team-level insights: "Adding a Connector would bridge your engineering-design communication gap"
- Sub-team and department mapping for companies with multiple teams

### Phase 3: Culture Verification Layer
Anonymous employee surveys that validate employer culture claims, creating a trust layer and data moat.

- 2-minute anonymous micro-surveys for current/former employees
- Gap score visualization: employer-claimed culture vs. employee-reported culture per dimension
- Culture Authenticity Score (0–100) for each employer
- Verified match scoring: candidates can match against verified culture profiles
- "Verified Culture" badge for employers with high authenticity scores

### Phase 4: Predictive Retention Intelligence
ML model that predicts how long a hire will stay and thrive based on personality-culture alignment patterns.

- 30/60/90-day and 6/12-month outcome tracking after hires
- Pattern recognition across personality-culture pairings and retention outcomes
- Retention Probability score alongside every match (12-month and 24-month estimates)
- Risk factor breakdown and proactive intervention alerts for HR
- Self-improving model that retrains weekly as outcome data accumulates

### Phase 5: Passive Culture Signals
Auto-generate preliminary company culture profiles from public data to solve the cold-start marketplace problem.

- Data ingestion from Glassdoor reviews, LinkedIn job postings, company blogs, and news
- LangChain pipeline for culture signal extraction and OCEAN mapping
- Pre-filled employer experience: "Here's what we already know about your culture — adjust what's off"
- Candidates can browse auto-profiled companies immediately, even before those companies sign up
- Confidence-rated match scores based on data source reliability

### Phase 6: Blind Culture Matching
Strip away identifying information and force both sides to evaluate on culture and personality alone.

- Blind Role Discovery: candidates see match score, culture values, and role description — no company name or logo
- Blind Candidate Review: employers see archetype, OCEAN breakdown, and work style — no name, school, or photo
- Mutual Blind Matching with special "Blind Match" badge when both sides express interest blind
- Outcome tracking to compare Blind Match retention and satisfaction against standard matches

---

## Additional Planned Features

### Job Listings and Search
- **Public Job Board** — Searchable, filterable job listings page accessible to all candidates.
- **Advanced Filters** — Filter by location, work style, salary range, company size, industry, and personality fit score.
- **Job Detail Pages** — Individual role pages with full descriptions, requirements, and a compatibility score preview.
- **Save and Bookmark** — Allow candidates to save roles they are interested in for later.

### Application System
- **One-Click Apply** — Candidates apply to roles directly through the platform with their personality profile attached.
- **Application Tracking** — Track application status (pending, reviewing, shortlisted, interview, rejected, accepted) from both candidate and employer sides.
- **Behavioral Questions** — AI-generated interview questions tailored to the candidate's personality and the role requirements.
- **Cover Notes** — Optional personalized notes candidates can attach to applications.

### Notifications
- **In-App Notifications** — Real-time notification center with updates on new matches, coffee chat requests, application status changes, and messages.
- **Push Notifications** — Browser push notifications for time-sensitive updates.
- **Email Digests** — Weekly digest emails summarizing new matches and activity.

### Advanced Analytics
- **Employer Analytics Dashboard** — Hiring funnel metrics, time-to-hire, candidate pipeline visualization, and culture fit distribution charts.
- **Candidate Analytics** — Track profile views, match trends over time, and application success rates.

### Team Collaboration (Employer)
- **Multi-User Employer Accounts** — Allow multiple team members to access the same employer account with role-based permissions (admin, recruiter, hiring manager).
- **Shared Notes** — Internal notes on candidates visible to the hiring team.
- **Collaborative Evaluation** — Multiple team members can rate and comment on candidates.

### Calendar Integrations
- **Google Calendar and Outlook Sync** — Automatic calendar event creation when coffee chats are scheduled.
- **Availability Sharing** — "Here are my open slots this week" for scheduling.
- **Timezone-Aware Scheduling** — Automatic timezone detection and conversion.

### AI Mock Interview Preparation
- **Practice Interview Bot** — Ember conducts mock interviews tailored to the specific company and role.
- **Personality-Aware Questions** — Questions based on employer culture values and candidate personality gaps.
- **Real-Time Feedback** — "Your answer emphasized autonomy, but this company values collaboration. Here's how to reframe..."
- **Progress Tracking** — Practice score and improvement tracking across sessions.

### Resume Parsing and LinkedIn Import
- **Automatic Profile Population** — Upload resume or import from LinkedIn to pre-fill profile with experience, skills, and education.
- **Skills Mapping** — Technical skills extracted alongside personality data for holistic matching.

### Personality Growth Tracking
- **Reassessment** — Retake the assessment every 6 months to track personality evolution.
- **Timeline View** — Visualize OCEAN score changes over time.
- **Growth Insights** — "Your openness increased 12 points — you now match with more innovation-focused roles."
- **Archetype Transitions** — Track shifts between archetypes as you develop.

### Company Culture Reviews
- **Glassdoor-Style Reviews** — Anonymous culture reviews from current/former employees, validated against the employer's OCEAN-based culture profile.
- **Alignment Scores** — Show how well employee reviews match what the company claims.
- **Trust Signal** — Employers with high alignment scores get verified badges.

### Referral Network
- **Employee Referrals** — Current employees refer candidates with a "culture vouched" badge.
- **Personality-Based Notes** — Referrers provide personality-based context about the candidate.
- **Referral Analytics** — Track which referrers produce the best culture-fit hires.

### Employer Branding Pages
- **Culture Showcase** — Rich public pages with photos, videos, employee testimonials, and culture value deep-dives.
- **Employee Stories** — "What's it really like here?" contributions from current employees.
- **Linked from Listings** — Visible from job listings and match cards.

### Gamification
- **Achievement Badges** — Assessment completed, first coffee chat, first match, 5-star feedback received.
- **Progress Levels** — Culture Explorer, Connection Builder, Match Master, Amber Ambassador.
- **Streak Tracking** — Consecutive days of platform engagement (partially implemented in dashboard).

### Integrations
- **Slack and Teams** — Coffee chat reminders, post-hire culture-aligned channel suggestions.
- **ATS Integration** — Connect with existing applicant tracking systems.

---

## Suggested Features and Ideas

These are longer-term ideas that could further differentiate Amber as a culture-first hiring intelligence platform.

### Skill and Interest Mapping
- **Beyond Personality** — Add a skills assessment and interest mapping layer on top of the OCEAN model. Combine personality fit with technical skill alignment for a more holistic match score. Employers could weight how much personality vs. skills matter for each role.

### Diversity and Inclusion Insights
- **Bias Detection** — Analytics that help employers identify if their culture profile or personality requirements are inadvertently filtering out diverse candidates. Recommendations for adjusting requirements to maintain quality matches while improving diversity.

### Onboarding Compatibility Report
- **Day-One Culture Guide** — Once a candidate is hired, generate a personalized onboarding guide mapping their personality to the company culture. Include tips like "Your high openness means you'll love our innovation sprints, but some team members prefer more structure — here's how to navigate that."

### Video Introduction Profiles
- **30-Second Video Intro** — Allow candidates to record a short video introduction that employers can watch alongside the personality profile for a more human first impression.

### Labor Market Intelligence
- **Seasonal and Market Trends** — Show candidates which personality types are most in demand in their target industry, and show employers how competitive their culture offering is compared to similar companies.

### Dynamic Pricing by Culture Demand
- **Market-Driven Pricing** — Adjust subscription tiers based on supply/demand of personality types in specific industries. Companies in competitive markets for rare archetypes pay premium for priority access.
