-- Seed: Employer Supplementary Assessment Questions
-- Run this AFTER migrate-employer-assessments.sql
-- Seeds 32 questions for 4 employer assessments:
-- - Team Dynamics (td1-td8)
-- - Leadership Style (ls1-ls8)
-- - Growth Philosophy (gd1-gd8)
-- - Work Environment (we1-we8)

-- ============================================
-- TEAM DYNAMICS QUESTIONS (td1-td8)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order, is_active)
VALUES
  ('td1', 'team_dynamics', 'scenario', 'Collaboration',
   'Two departments disagree on the direction of a cross-functional project. Progress has stalled.',
   'How does your organization typically handle this?',
   '[
     {"id": "td1a", "text": "Facilitate a joint workshop", "description": "Bring both sides together, map out shared goals, and co-create the path forward.", "traitScores": {"collaboration": 90, "empathy": 80, "diplomacy": 85}},
     {"id": "td1b", "text": "Escalate to leadership", "description": "A senior leader makes the call. Clear authority breaks the tie quickly.", "traitScores": {"hierarchy": 90, "decisiveness": 85, "process": 80}},
     {"id": "td1c", "text": "Let them debate it out", "description": "Healthy conflict produces better outcomes. The best argument should win.", "traitScores": {"debate": 90, "transparency": 80, "independence": 75}},
     {"id": "td1d", "text": "Run a structured experiment", "description": "Test both approaches on a small scale. Let data settle the disagreement.", "traitScores": {"analytical": 90, "innovation": 80, "pragmatism": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['collaboration', 'hierarchy', 'debate', 'analytical'],
   1, TRUE
  ),

  ('td2', 'team_dynamics', 'slider', 'Team Style',
   'Where does your team culture fall on the collaboration spectrum?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Deep independent work — people own their domains", "maxLabel": "Constant collaboration — everything is a team effort", "trait": "collaboration"}'::jsonb,
   ARRAY['collaboration'],
   2, TRUE
  ),

  ('td3', 'team_dynamics', 'scenario', 'Conflict',
   'Two team members have a personal friction that''s starting to affect the team''s output.',
   'What happens next?',
   '[
     {"id": "td3a", "text": "Manager mediates directly", "description": "The manager sits them down, listens to both sides, and helps them find resolution.", "traitScores": {"empathy": 90, "leadership": 85, "diplomacy": 80}},
     {"id": "td3b", "text": "Peer accountability", "description": "The team itself addresses it. Culture of candor means everyone speaks up.", "traitScores": {"trust": 90, "transparency": 85, "collaboration": 80}},
     {"id": "td3c", "text": "HR steps in", "description": "A neutral third party handles interpersonal issues. Keep it professional.", "traitScores": {"process": 85, "consistency": 80, "hierarchy": 75}},
     {"id": "td3d", "text": "Reassign and separate", "description": "Not every dynamic works. Move people to where they can be productive.", "traitScores": {"pragmatism": 85, "decisiveness": 80, "efficiency": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['empathy', 'trust', 'process', 'pragmatism'],
   3, TRUE
  ),

  ('td4', 'team_dynamics', 'metaphor', 'Communication',
   'If your team''s meeting culture was a meal, what would it be?',
   NULL,
   '[
     {"id": "td4a", "text": "A potluck dinner", "description": "Everyone brings something to the table. Diverse, collaborative, sometimes messy.", "traitScores": {"collaboration": 95, "creativity": 80, "connection": 85}},
     {"id": "td4b", "text": "A chef''s tasting menu", "description": "Curated, intentional, every course has a purpose. Structured but high-quality.", "traitScores": {"structure": 90, "quality": 85, "efficiency": 80}},
     {"id": "td4c", "text": "A quick espresso", "description": "Short, focused, energizing. Get the essentials and get back to work.", "traitScores": {"efficiency": 95, "intensity": 80, "pragmatism": 85}},
     {"id": "td4d", "text": "A family dinner", "description": "Relaxed, relationship-building, catching up on everything — work and personal.", "traitScores": {"connection": 95, "empathy": 85, "trust": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['collaboration', 'structure', 'efficiency', 'connection'],
   4, TRUE
  ),

  ('td5', 'team_dynamics', 'tradeoff', 'Hiring',
   'When building a team, what do you prioritize?',
   NULL,
   '[
     {"id": "td5a", "text": "Complementary differences", "description": "Diverse thinking styles, backgrounds, and skills create stronger teams.", "traitScores": {"innovation": 90, "curiosity": 85, "flexibility": 80}},
     {"id": "td5b", "text": "Cultural alignment", "description": "Shared values and communication styles create frictionless collaboration.", "traitScores": {"consistency": 90, "trust": 85, "collaboration": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['innovation', 'consistency', 'trust', 'flexibility'],
   5, TRUE
  ),

  ('td6', 'team_dynamics', 'scenario', 'Transparency',
   'The company is facing a significant challenge — a major client is at risk. How much does the team know?',
   NULL,
   '[
     {"id": "td6a", "text": "Full transparency", "description": "Share the situation openly. The team deserves to know and can contribute solutions.", "traitScores": {"transparency": 95, "trust": 90, "collaboration": 80}},
     {"id": "td6b", "text": "Leadership handles it", "description": "Shield the team from unnecessary stress. Share what''s needed, when it''s needed.", "traitScores": {"hierarchy": 85, "stability": 80, "process": 75}},
     {"id": "td6c", "text": "Share with key people", "description": "Brief senior ICs and team leads. They can cascade information appropriately.", "traitScores": {"strategic": 85, "trust": 75, "hierarchy": 70}},
     {"id": "td6d", "text": "Share after a plan exists", "description": "Don''t raise alarm without a solution. Share the problem alongside the action plan.", "traitScores": {"stability": 90, "leadership": 80, "pragmatism": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['transparency', 'hierarchy', 'strategic', 'stability'],
   6, TRUE
  ),

  ('td7', 'team_dynamics', 'tradeoff', 'Accountability',
   'How does accountability work best on your teams?',
   NULL,
   '[
     {"id": "td7a", "text": "Peer-driven accountability", "description": "Team members hold each other to commitments. Distributed ownership.", "traitScores": {"trust": 90, "collaboration": 85, "transparency": 80}},
     {"id": "td7b", "text": "Manager-led accountability", "description": "Clear reporting lines. Managers set expectations and track progress.", "traitScores": {"hierarchy": 90, "structure": 85, "consistency": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['trust', 'hierarchy', 'collaboration', 'structure'],
   7, TRUE
  ),

  ('td8', 'team_dynamics', 'slider', 'Bonding',
   'How much does your company invest in non-work social bonding?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Keep it professional — work relationships stay at work", "maxLabel": "Invest heavily — retreats, socials, team traditions", "trait": "connection"}'::jsonb,
   ARRAY['connection'],
   8, TRUE
  )
ON CONFLICT (question_code) DO UPDATE SET
  question_type = EXCLUDED.question_type,
  question_format = EXCLUDED.question_format,
  category = EXCLUDED.category,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  options = EXCLUDED.options,
  slider_config = EXCLUDED.slider_config,
  traits = EXCLUDED.traits,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- LEADERSHIP STYLE QUESTIONS (ls1-ls8)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order, is_active)
VALUES
  ('ls1', 'leadership_style', 'scenario', 'Onboarding',
   'A new employee just started. What do their first 90 days look like?',
   'Choose the approach closest to your company''s style.',
   '[
     {"id": "ls1a", "text": "Structured program", "description": "Detailed onboarding plan, assigned buddy, clear milestones at 30/60/90 days.", "traitScores": {"structure": 95, "investment": 85, "process": 80}},
     {"id": "ls1b", "text": "Sink or swim", "description": "Throw them into real projects fast. The best people figure it out quickly.", "traitScores": {"intensity": 90, "independence": 85, "risk": 80}},
     {"id": "ls1c", "text": "Mentorship-focused", "description": "Pair them with a senior mentor. Learning through relationships and shadowing.", "traitScores": {"empathy": 90, "investment": 85, "collaboration": 80}},
     {"id": "ls1d", "text": "Self-directed exploration", "description": "Give them access to everything, let them find their niche. Autonomy from day one.", "traitScores": {"trust": 90, "flexibility": 85, "innovation": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['structure', 'intensity', 'empathy', 'trust'],
   1, TRUE
  ),

  ('ls2', 'leadership_style', 'slider', 'Authority',
   'How is decision-making authority distributed?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Top-down — leaders decide, teams execute", "maxLabel": "Distributed — teams closest to the work decide", "trait": "trust"}'::jsonb,
   ARRAY['trust', 'hierarchy'],
   2, TRUE
  ),

  ('ls3', 'leadership_style', 'scenario', 'Feedback',
   'An employee delivered work that''s below your quality standard. How does the feedback conversation go?',
   NULL,
   '[
     {"id": "ls3a", "text": "Direct and immediate", "description": "\"This doesn''t meet our bar. Here''s specifically what needs to change.\"", "traitScores": {"directness": 95, "quality": 85, "intensity": 80}},
     {"id": "ls3b", "text": "Coaching approach", "description": "\"Walk me through your thinking. What would you do differently next time?\"", "traitScores": {"empathy": 90, "investment": 85, "reflection": 80}},
     {"id": "ls3c", "text": "Peer review handles it", "description": "The team''s code/work review process catches quality issues before they need escalation.", "traitScores": {"collaboration": 85, "process": 80, "trust": 75}},
     {"id": "ls3d", "text": "Data-driven review", "description": "Reference specific metrics, benchmarks, and past performance. Let the data speak.", "traitScores": {"analytical": 90, "quality": 85, "consistency": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['directness', 'empathy', 'collaboration', 'analytical'],
   3, TRUE
  ),

  ('ls4', 'leadership_style', 'metaphor', 'Management',
   'If your ideal manager was a role, what would they be?',
   NULL,
   '[
     {"id": "ls4a", "text": "A coach", "description": "Develops individuals, gives feedback, helps people reach their potential.", "traitScores": {"empathy": 95, "investment": 90, "growth": 85}},
     {"id": "ls4b", "text": "A captain", "description": "Leads from the front, makes tough calls, inspires through action.", "traitScores": {"leadership": 95, "intensity": 85, "courage": 80}},
     {"id": "ls4c", "text": "An architect", "description": "Designs systems, removes obstacles, builds the environment for success.", "traitScores": {"strategic": 95, "structure": 85, "analytical": 80}},
     {"id": "ls4d", "text": "A gardener", "description": "Creates conditions for growth, nurtures talent, patient with development.", "traitScores": {"trust": 90, "investment": 90, "patience": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['empathy', 'leadership', 'strategic', 'trust'],
   4, TRUE
  ),

  ('ls5', 'leadership_style', 'tradeoff', 'Innovation',
   'When it comes to how teams work, which do you encourage more?',
   NULL,
   '[
     {"id": "ls5a", "text": "Encourage experimentation", "description": "Try new approaches, challenge conventions, accept some failures along the way.", "traitScores": {"innovation": 95, "risk": 85, "flexibility": 80}},
     {"id": "ls5b", "text": "Protect what works", "description": "Refine proven processes, maintain consistency, innovate carefully.", "traitScores": {"consistency": 90, "quality": 85, "stability": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['innovation', 'consistency', 'risk', 'stability'],
   5, TRUE
  ),

  ('ls6', 'leadership_style', 'scenario', 'Performance',
   'How does your performance review process work?',
   NULL,
   '[
     {"id": "ls6a", "text": "Continuous feedback", "description": "Weekly 1:1s, real-time recognition, no surprises. The \"annual review\" is just a summary.", "traitScores": {"transparency": 90, "investment": 85, "trust": 80}},
     {"id": "ls6b", "text": "Structured cycles", "description": "Quarterly or bi-annual formal reviews with clear rubrics and calibration.", "traitScores": {"structure": 90, "consistency": 85, "process": 80}},
     {"id": "ls6c", "text": "360-degree feedback", "description": "Input from peers, reports, and managers. A full picture of impact.", "traitScores": {"collaboration": 85, "transparency": 80, "empathy": 75}},
     {"id": "ls6d", "text": "Results speak for themselves", "description": "Focus on output metrics. If you deliver, the numbers show it.", "traitScores": {"intensity": 85, "independence": 80, "pragmatism": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['transparency', 'structure', 'collaboration', 'intensity'],
   6, TRUE
  ),

  ('ls7', 'leadership_style', 'tradeoff', 'Failure',
   'When a project fails, which response do you value more?',
   NULL,
   '[
     {"id": "ls7a", "text": "Celebrate the learning", "description": "Failure is tuition. Extract lessons, share them widely, move forward.", "traitScores": {"innovation": 90, "trust": 85, "reflection": 80}},
     {"id": "ls7b", "text": "Analyze root cause", "description": "Conduct a thorough post-mortem. Understand exactly what went wrong to prevent repetition.", "traitScores": {"analytical": 90, "quality": 85, "consistency": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['innovation', 'analytical', 'trust', 'quality'],
   7, TRUE
  ),

  ('ls8', 'leadership_style', 'slider', 'Accessibility',
   'How accessible are senior leaders to individual contributors?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Formal layers — communication flows through hierarchy", "maxLabel": "Open door — anyone can reach anyone", "trait": "transparency"}'::jsonb,
   ARRAY['transparency', 'hierarchy'],
   8, TRUE
  )
ON CONFLICT (question_code) DO UPDATE SET
  question_type = EXCLUDED.question_type,
  question_format = EXCLUDED.question_format,
  category = EXCLUDED.category,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  options = EXCLUDED.options,
  slider_config = EXCLUDED.slider_config,
  traits = EXCLUDED.traits,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- GROWTH PHILOSOPHY QUESTIONS (gd1-gd8)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order, is_active)
VALUES
  ('gd1', 'growth_philosophy', 'scenario', 'Learning',
   'An employee wants to attend a 3-day conference during a busy sprint.',
   'What''s the company''s default response?',
   '[
     {"id": "gd1a", "text": "Approve it enthusiastically", "description": "Learning comes first. The sprint can adjust. They''ll come back energized.", "traitScores": {"investment": 95, "trust": 85, "flexibility": 80}},
     {"id": "gd1b", "text": "Approve with conditions", "description": "Go, but ensure your deliverables are covered. Planning ahead is the trade-off.", "traitScores": {"quality": 85, "structure": 80, "investment": 75}},
     {"id": "gd1c", "text": "Suggest a different time", "description": "The sprint matters. Find a conference that doesn''t conflict with commitments.", "traitScores": {"consistency": 85, "process": 80, "stability": 75}},
     {"id": "gd1d", "text": "Virtual alternative", "description": "Attend remotely or watch recordings. No need to leave the sprint.", "traitScores": {"pragmatism": 85, "efficiency": 80, "intensity": 70}}
   ]'::jsonb,
   NULL,
   ARRAY['investment', 'quality', 'consistency', 'pragmatism'],
   1, TRUE
  ),

  ('gd2', 'growth_philosophy', 'tradeoff', 'Career',
   'How do career paths work at your company?',
   NULL,
   '[
     {"id": "gd2a", "text": "Defined career ladder", "description": "Clear levels, criteria, and timelines. People know exactly what it takes to advance.", "traitScores": {"structure": 95, "consistency": 85, "process": 80}},
     {"id": "gd2b", "text": "Organic growth paths", "description": "Roles evolve with the person. Create your own path based on impact and interest.", "traitScores": {"flexibility": 90, "trust": 85, "innovation": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['structure', 'flexibility', 'consistency', 'trust'],
   2, TRUE
  ),

  ('gd3', 'growth_philosophy', 'scenario', 'Mentorship',
   'How does mentorship work at your company?',
   NULL,
   '[
     {"id": "gd3a", "text": "Formal mentorship program", "description": "Structured pairing, regular check-ins, defined goals for the mentorship.", "traitScores": {"structure": 90, "investment": 85, "process": 80}},
     {"id": "gd3b", "text": "Organic relationships", "description": "People naturally find mentors. The best mentorships form spontaneously.", "traitScores": {"trust": 85, "flexibility": 80, "connection": 75}},
     {"id": "gd3c", "text": "Learning communities", "description": "Guilds, study groups, and communities of practice. Collective learning over 1:1.", "traitScores": {"collaboration": 90, "innovation": 80, "connection": 85}},
     {"id": "gd3d", "text": "External coaching", "description": "Invest in professional coaches and external training for high-potential people.", "traitScores": {"investment": 95, "quality": 85, "growth": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['structure', 'trust', 'collaboration', 'investment'],
   3, TRUE
  ),

  ('gd4', 'growth_philosophy', 'slider', 'Investment',
   'How much does your company invest in learning & development?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Learn on the job — experience is the best teacher", "maxLabel": "Heavy investment — dedicated budget, time, and programs", "trait": "investment"}'::jsonb,
   ARRAY['investment'],
   4, TRUE
  ),

  ('gd5', 'growth_philosophy', 'scenario', 'Promotion',
   'Two candidates for a promotion: one is a consistent, reliable performer; the other took bold risks with mixed but impressive results.',
   'Who gets the role?',
   '[
     {"id": "gd5a", "text": "The consistent performer", "description": "Reliability and trust are the foundation. Consistency earns advancement.", "traitScores": {"consistency": 95, "quality": 85, "stability": 80}},
     {"id": "gd5b", "text": "The bold risk-taker", "description": "We need people who push boundaries. The upside of their wins outweighs the misses.", "traitScores": {"innovation": 90, "risk": 85, "intensity": 80}},
     {"id": "gd5c", "text": "Depends on the role", "description": "Match the person to the position. Some roles need consistency, others need boldness.", "traitScores": {"strategic": 85, "pragmatism": 80, "analytical": 75}},
     {"id": "gd5d", "text": "Create two paths", "description": "Promote both — one into a leadership track, the other into a specialist track.", "traitScores": {"investment": 85, "empathy": 80, "flexibility": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['consistency', 'innovation', 'strategic', 'investment'],
   5, TRUE
  ),

  ('gd6', 'growth_philosophy', 'tradeoff', 'Development',
   'What''s your philosophy on professional development?',
   NULL,
   '[
     {"id": "gd6a", "text": "Sharpen strengths", "description": "Double down on what people are already great at. Maximize natural talent.", "traitScores": {"quality": 90, "depth": 85, "intensity": 80}},
     {"id": "gd6b", "text": "Fill gaps", "description": "Well-rounded professionals are more versatile. Address weaknesses to build balance.", "traitScores": {"growth": 90, "flexibility": 85, "investment": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['quality', 'growth', 'depth', 'flexibility'],
   6, TRUE
  ),

  ('gd7', 'growth_philosophy', 'metaphor', 'Knowledge',
   'How does knowledge flow through your organization?',
   NULL,
   '[
     {"id": "gd7a", "text": "A library", "description": "Well-documented, searchable, self-serve. Knowledge lives in systems.", "traitScores": {"structure": 90, "process": 85, "consistency": 80}},
     {"id": "gd7b", "text": "A conversation", "description": "Knowledge lives in people. Ask anyone, anytime. Oral tradition.", "traitScores": {"collaboration": 90, "trust": 85, "connection": 80}},
     {"id": "gd7c", "text": "A broadcast", "description": "Regular all-hands, newsletters, demo days. Top-down knowledge sharing.", "traitScores": {"transparency": 85, "leadership": 80, "hierarchy": 75}},
     {"id": "gd7d", "text": "A marketplace", "description": "Internal talks, blog posts, wikis. Anyone can teach, anyone can learn.", "traitScores": {"innovation": 85, "collaboration": 80, "trust": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['structure', 'collaboration', 'transparency', 'innovation'],
   7, TRUE
  ),

  ('gd8', 'growth_philosophy', 'slider', 'Time',
   'How much dedicated time do employees get for learning and development?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "No dedicated time — growth happens within daily work", "maxLabel": "Significant time — 10-20% of work time for development", "trait": "investment"}'::jsonb,
   ARRAY['investment'],
   8, TRUE
  )
ON CONFLICT (question_code) DO UPDATE SET
  question_type = EXCLUDED.question_type,
  question_format = EXCLUDED.question_format,
  category = EXCLUDED.category,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  options = EXCLUDED.options,
  slider_config = EXCLUDED.slider_config,
  traits = EXCLUDED.traits,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- WORK ENVIRONMENT QUESTIONS (we1-we8)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order, is_active)
VALUES
  ('we1', 'work_environment', 'scenario', 'Location',
   'Describe a typical workday at your company.',
   'Which best represents your current setup?',
   '[
     {"id": "we1a", "text": "Fully remote", "description": "Work from anywhere. Async-first communication, flexible schedules.", "traitScores": {"flexibility": 95, "trust": 90, "independence": 85}},
     {"id": "we1b", "text": "Hybrid with core days", "description": "In-office 2-3 days for collaboration, remote for focused work.", "traitScores": {"collaboration": 80, "flexibility": 75, "structure": 70}},
     {"id": "we1c", "text": "Office-first", "description": "Most people are in the office most days. Energy from being together.", "traitScores": {"collaboration": 90, "connection": 85, "energy": 80}},
     {"id": "we1d", "text": "Results-only", "description": "No set hours or location. Deliver outcomes, and the rest is up to you.", "traitScores": {"trust": 95, "independence": 90, "flexibility": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['flexibility', 'collaboration', 'trust', 'independence'],
   1, TRUE
  ),

  ('we2', 'work_environment', 'slider', 'Pace',
   'What''s the typical work intensity at your company?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Sustainable marathon — steady pace, long-term thinking", "maxLabel": "Startup sprint — fast, intense, urgent", "trait": "energy"}'::jsonb,
   ARRAY['energy', 'intensity'],
   2, TRUE
  ),

  ('we3', 'work_environment', 'scenario', 'Boundaries',
   'It''s 8 PM on a weeknight. Someone posts a non-urgent question in the team Slack. What''s the cultural expectation?',
   NULL,
   '[
     {"id": "we3a", "text": "Respond if you see it", "description": "We''re always-on. Quick responses show commitment and keep things moving.", "traitScores": {"intensity": 90, "energy": 85, "collaboration": 75}},
     {"id": "we3b", "text": "Next business day", "description": "Off-hours are off-hours. A healthy boundary protects everyone''s well-being.", "traitScores": {"boundaries": 95, "stability": 85, "consistency": 80}},
     {"id": "we3c", "text": "Your choice, no judgment", "description": "Some people are night owls, some aren''t. No expectation either way.", "traitScores": {"trust": 90, "flexibility": 85, "independence": 80}},
     {"id": "we3d", "text": "Use scheduled send", "description": "Write it now, deliver it tomorrow. Respect async rhythms.", "traitScores": {"empathy": 85, "process": 80, "boundaries": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['intensity', 'boundaries', 'trust', 'empathy'],
   3, TRUE
  ),

  ('we4', 'work_environment', 'metaphor', 'Space',
   'If your workspace had a personality, what would it be?',
   NULL,
   '[
     {"id": "we4a", "text": "A coworking space", "description": "Open, flexible, buzzing with energy. Serendipitous connections happen.", "traitScores": {"collaboration": 90, "energy": 85, "innovation": 80}},
     {"id": "we4b", "text": "A library", "description": "Quiet, focused, respectful of deep work. Thoughtful and intentional.", "traitScores": {"reflection": 90, "quality": 85, "boundaries": 80}},
     {"id": "we4c", "text": "A living room", "description": "Warm, comfortable, casual. People feel at home and bring their whole selves.", "traitScores": {"connection": 95, "trust": 85, "empathy": 80}},
     {"id": "we4d", "text": "A mission control", "description": "Focused, urgent, data everywhere. Every screen shows progress toward the goal.", "traitScores": {"intensity": 95, "energy": 90, "analytical": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['collaboration', 'reflection', 'connection', 'intensity'],
   4, TRUE
  ),

  ('we5', 'work_environment', 'tradeoff', 'Flexibility',
   'Which schedule philosophy do you lean toward?',
   NULL,
   '[
     {"id": "we5a", "text": "Flexible hours", "description": "Work when you''re at your best. Early birds and night owls both welcome.", "traitScores": {"flexibility": 95, "trust": 85, "independence": 80}},
     {"id": "we5b", "text": "Core hours", "description": "Everyone overlaps for key hours. Ensures collaboration windows exist.", "traitScores": {"collaboration": 85, "structure": 80, "consistency": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['flexibility', 'collaboration', 'trust', 'structure'],
   5, TRUE
  ),

  ('we6', 'work_environment', 'scenario', 'Urgency',
   'A product launch is 2 weeks behind schedule. What happens?',
   NULL,
   '[
     {"id": "we6a", "text": "Push through", "description": "The team rallies, works extra hours, and ships on the original date.", "traitScores": {"intensity": 95, "energy": 90, "leadership": 80}},
     {"id": "we6b", "text": "Cut scope", "description": "Ship the MVP on time. The rest can follow in a fast-follow release.", "traitScores": {"pragmatism": 90, "strategic": 85, "efficiency": 80}},
     {"id": "we6c", "text": "Adjust the date", "description": "Quality over speed. Move the date and ship something we''re proud of.", "traitScores": {"quality": 90, "stability": 85, "boundaries": 80}},
     {"id": "we6d", "text": "Diagnose first", "description": "Understand WHY we''re behind. Fix the process, then decide on timeline.", "traitScores": {"analytical": 90, "reflection": 85, "process": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['intensity', 'pragmatism', 'quality', 'analytical'],
   6, TRUE
  ),

  ('we7', 'work_environment', 'tradeoff', 'Communication',
   'What''s your company''s communication default?',
   NULL,
   '[
     {"id": "we7a", "text": "Written-first async", "description": "Document decisions, write proposals, comment threads. Thoughtful and inclusive.", "traitScores": {"reflection": 90, "structure": 85, "boundaries": 80}},
     {"id": "we7b", "text": "Talk-first sync", "description": "Jump on a call, hash it out live. Fast resolution and real-time energy.", "traitScores": {"energy": 90, "collaboration": 85, "intensity": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['reflection', 'energy', 'structure', 'collaboration'],
   7, TRUE
  ),

  ('we8', 'work_environment', 'slider', 'Recovery',
   'After a major milestone or launch, what happens?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Straight to the next thing — momentum matters", "maxLabel": "Deliberate cooldown — rest, retro, then recharge", "trait": "reflection"}'::jsonb,
   ARRAY['reflection', 'boundaries'],
   8, TRUE
  )
ON CONFLICT (question_code) DO UPDATE SET
  question_type = EXCLUDED.question_type,
  question_format = EXCLUDED.question_format,
  category = EXCLUDED.category,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  options = EXCLUDED.options,
  slider_config = EXCLUDED.slider_config,
  traits = EXCLUDED.traits,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Employer assessment questions seeded successfully!' as status;

SELECT question_type, COUNT(*) as count
FROM public.questions
WHERE question_type IN ('team_dynamics', 'leadership_style', 'growth_philosophy', 'work_environment')
GROUP BY question_type
ORDER BY question_type;
