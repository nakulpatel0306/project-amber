# Features

A comprehensive breakdown of all existing features, planned features, and suggested improvements for the Amber platform.

---

## Existing Features — Job Seeker Side

### Personality Assessment
- **Big Five Assessment** — A 10-question assessment that measures the five core personality dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (OCEAN). Questions are grouped into work style, communication, and values categories, each with four response options that map to specific trait scores.
- **Scoring Engine** — Responses are aggregated into normalized 0-100 scores for each OCEAN dimension. Four derived composite scores are also calculated: culture fit, work style, communication, and values.
- **Top Traits** — After assessment completion, the system identifies 3-5 key personality descriptors (e.g., "Highly Adaptable", "Team Player", "Detail-Oriented") with contextual explanations.
- **Supplementary Assessments** — Additional assessments are available for deeper personality profiling:
  - Visual Perception Assessment
  - Work Values Assessment
  - Situational Judgment Assessment
  - Cognitive Pattern Assessment

### Personality Insights
- **Archetype Classification** — Each candidate is classified into one of 8 personality archetypes based on their dominant OCEAN traits:
  - **The Innovator** — High openness, creative thinker. Thrives in cultures that value innovation and agility.
  - **The Architect** — High conscientiousness, systematic builder. Ideal for organizations focused on quality and stability.
  - **The Connector** — High extraversion and agreeableness, relationship builder. Suited to collaborative, people-first cultures.
  - **The Catalyst** — High extraversion and openness, bold leader. Excels in fast-paced, growth-oriented environments.
  - **The Craftsperson** — High conscientiousness, detail-oriented executor. Best in quality-driven, structured workplaces.
  - **The Harmonizer** — High agreeableness and emotional stability, empathetic mediator. Perfect for mission-driven, balanced teams.
  - **The Explorer** — High openness and emotional stability, curious adventurer. Fits innovation-forward, autonomous cultures.
  - **The Strategist** — High conscientiousness and openness, analytical thinker. Suited for growth-oriented, impact-focused companies.
- **Trait Breakdown** — Detailed view of each OCEAN dimension with score, percentile context, and what it means for workplace behavior.
- **Confidence Scoring** — Shows how confident the assessment is in the personality match based on response consistency.

### Job Matching
- **Top Matches Dashboard** — A ranked list of employer roles sorted by overall compatibility percentage (0-100%). Each match card shows the company, role title, match score, and key compatibility highlights.
- **Match Score Breakdown** — For each match, candidates can view a detailed breakdown of trait match score, culture match score, and per-dimension alignment.
- **Ember Agent Analysis** — AI-powered personality compatibility analysis that provides natural language insights about each potential match, including strengths, cautions, and tips for succeeding in that role.

### Coffee Chats
- **Request Coffee Chats** — Candidates can initiate informal coffee chat requests with matched employers directly from the matches dashboard.
- **Chat Management** — View all pending, accepted, scheduled, and completed coffee chats in one place.
- **Scheduling** — Accept scheduled times and meeting links set by employers.
- **Post-Chat Feedback** — After a coffee chat is completed, candidates can leave a 1-5 star rating and written feedback about the experience.

### Profile Management
- **Basic Profile** — Set headline, bio, location, and years of experience.
- **Work Preferences** — Configure preferred work style (remote, hybrid, onsite, flexible), preferred company size (startup, small, medium, large), and salary expectations.
- **Social Links** — Add LinkedIn, GitHub, and portfolio URLs.
- **Avatar Upload** — Upload a profile photo stored in Supabase Storage.

### Leaderboard
- **Global Candidate Leaderboard** — See how you rank among other candidates based on personality scores and assessment completion.

### Dashboard
- **Job Seeker Dashboard** — Central hub showing assessment status, personality insights summary, top matches, upcoming coffee chats, and quick access to all features.

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
- **Culture Quiz** — An interactive quiz where employers define their company's personality preferences by setting ideal scores for each OCEAN dimension and selecting their top 5 culture values from a predefined list (innovation, transparency, collaboration, autonomy, growth, impact, balance, diversity, customer focus, excellence, and more).
- **Culture Profile** — After completing the quiz, employers get a company personality profile with descriptive insights about what kind of candidates would thrive in their culture.

### Culture Insights
- **Company Archetype** — Similar to candidate archetypes, the company is classified based on its OCEAN preferences, giving employers a clear picture of their culture identity.
- **Ideal Candidate Profile** — Recommendations for the personality types that would be the best fit for the company culture.

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
- **Top Candidates Dashboard** — AI-ranked list of all candidates sorted by culture and personality fit for the employer's profile.
- **Browse Candidates** — View all candidates who have completed their assessments, with personality scores and match percentages.
- **Candidate Profiles** — View detailed candidate personality breakdowns, archetype, scoring details, and per-dimension analysis.
- **Ember Agent Analysis** — Employer-side Ember agent that provides ranked candidate lists with natural language insights about each candidate's compatibility, optionally filtered by a specific role.

### Coffee Chats
- **Invite Candidates** — Send coffee chat invitations to top-matched candidates.
- **Manage Requests** — View incoming requests from candidates and accept, decline, or reschedule.
- **Schedule Chats** — Set date, time, and meeting link (Zoom, Google Meet, Teams, etc.).
- **Post-Chat Feedback** — Leave a 1-5 star rating and written feedback after each conversation.
- **Chat History** — Full record of all past and current coffee chats with feedback.

### Leaderboard
- **Employer Leaderboard** — View top candidates ranked by personality fit for the company or for specific roles.

### Dashboard
- **Employer Dashboard** — Central hub showing culture quiz status, active roles summary, top candidate matches, pending coffee chats, and quick access to all employer features.

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

### Landing Page
- **Animated Welcome Screen** — Full landing page with hero section, animated product demo, testimonials, FAQ accordion, and call-to-action sections.
- **Public Navigation** — Landing nav with links to all public pages.
- **Footer** — Links to company pages, legal pages, and social media.

### Public Pages
- About, Blog, Careers, Press, Science (methodology), Help Center, Changelog, Status Page, Privacy Policy, Terms of Service, Cookie Policy, and Accessibility Statement.

### Ember Agent (AI Matching Engine)
- **Bidirectional Analysis** — Works from both the candidate perspective ("How compatible am I with this role?") and the employer perspective ("Which candidates fit our culture?").
- **Animated UI** — Flame mascot with mood-based animations, typing simulation during analysis, circular score rings, and dimension comparison bars.
- **Client-Side Fallback** — If the backend is unavailable, the frontend runs the matching algorithm locally using data from Supabase.

### Payments
- **Stripe Integration** — Checkout session creation and customer portal for subscription management (infrastructure in place).

---

## Planned Features (To Be Built)

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

### Messaging System
- **In-App Messaging** — Direct messaging between candidates and employers who have matched or are in the coffee chat process.
- **Chat History** — Persistent message threads with read receipts and timestamps.

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

---

## Suggested Features and Ideas

These are additional features and implementation ideas that could significantly enhance the platform for a culture-first job matching product.

### AI-Powered Resume Parsing
- **Automatic Profile Population** — Allow candidates to upload their resume or import from LinkedIn, and use AI to extract experience, skills, and education data to pre-fill their profile. This reduces onboarding friction and gets candidates to the assessment faster.

### Culture Fit Score Explainability
- **Interactive Score Breakdown** — Instead of just showing a percentage, provide an interactive visualization where users can click on each OCEAN dimension to see a detailed explanation of why they scored the way they did and how it impacts their match with a specific employer. Think of it as a "compatibility deep dive."

### Personality Growth Tracking
- **Retake Assessments Over Time** — Allow candidates to retake the assessment periodically (e.g., every 6 months) and track how their personality profile evolves. Show trends and growth areas on a timeline view. This keeps users engaged and provides more accurate matching as people develop.

### Company Culture Reviews
- **Glassdoor-Style Culture Reviews** — Let current or former employees leave anonymous reviews specifically about company culture, validated against the employer's self-reported culture profile. Show alignment scores between what the company says and what employees report. This builds trust and transparency.

### AI Interview Preparation
- **Mock Interview Bot** — Using the Ember agent, provide candidates with AI-powered mock interviews tailored to the specific company and role they are matched with. The bot would ask personality-relevant questions and provide feedback on how their answers align with the company culture.

### Skill and Interest Mapping
- **Beyond Personality** — Add a skills assessment and interest mapping layer on top of the OCEAN model. This would combine personality fit with technical skill alignment for a more holistic match score. Employers could weight how much personality vs. skills matter for each role.

### Referral Network
- **Employee Referrals** — Allow current employees at partner companies to refer candidates they know. Referred candidates would get a "culture vouched" badge, and the referrer could provide notes about why they think the candidate would be a good culture fit.

### Dynamic Culture Matching
- **Team-Level Matching** — Instead of matching against the overall company culture, match candidates against the specific team they would join. Different teams within the same company often have different subcultures, and a candidate who thrives in the engineering team's culture might not be a great fit for the marketing team.

### Diversity and Inclusion Insights
- **Bias Detection** — Build analytics that help employers identify if their culture profile or personality requirements are inadvertently filtering out diverse candidates. Provide recommendations for adjusting requirements to maintain quality matches while improving diversity.

### Onboarding Compatibility Report
- **Day-One Culture Guide** — Once a candidate is hired, generate a personalized onboarding guide that maps their personality to the company culture. Include tips like "Your high openness means you'll love our innovation sprints, but be aware that some team members prefer more structure—here's how to navigate that."

### Mutual Matching (Double Opt-In)
- **Tinder-Style Matching** — Instead of one-directional applications, implement a mutual interest system where both the candidate and employer must express interest before a connection is made. This reduces noise for employers and increases response rates for candidates.

### Video Introduction Profiles
- **30-Second Video Intro** — Allow candidates to record a short video introduction that employers can watch alongside the personality profile. This gives a more human first impression and lets personality shine through beyond the assessment data.

### Seasonal and Market Trend Insights
- **Labor Market Intelligence** — Show candidates which personality types are most in demand in their target industry, and show employers how competitive their culture offering is compared to similar companies. This helps both sides make informed decisions.

### Slack and Teams Integration
- **Workplace Tool Integration** — After a coffee chat is scheduled, automatically create calendar events and send reminders through Slack or Microsoft Teams. Post-hire, integrate with the company's Slack to help new hires find culture-aligned channels and groups.

### Gamification
- **Engagement Incentives** — Add achievement badges for completing assessments, attending coffee chats, and receiving positive feedback. A progress system with levels (e.g., "Culture Explorer", "Connection Builder", "Match Master") keeps users engaged with the platform.

### Employer Branding Tools
- **Culture Showcase Pages** — Let employers build rich public-facing pages that highlight their culture through photos, videos, employee testimonials, and culture value explanations. These pages would be linked from job listings and match cards to give candidates a deeper look before applying.
