-- Seed Assessment Questions for Amber Platform
-- Run this in Supabase SQL Editor to populate the questions table

-- ============================================
-- CANDIDATE ASSESSMENT QUESTIONS (16 questions)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order)
VALUES
-- c1: The Unexpected Project
('c1', 'candidate', 'scenario', 'Work Style',
 'It''s Friday afternoon. A major client just called with an urgent request that could land a huge contract. Your team has plans for the weekend.',
 'What''s your natural first instinct?',
 '[
   {"id": "c1a", "text": "Rally the team", "description": "Call an emergency meeting. If everyone chips in, we can make it happen and celebrate together after.", "traitScores": {"collaboration": 90, "intensity": 70, "leadership": 80}},
   {"id": "c1b", "text": "Take it on yourself", "description": "Tell the team to keep their plans. You''ll pull an all-nighter and handle it solo.", "traitScores": {"independence": 90, "intensity": 85, "ownership": 90}},
   {"id": "c1c", "text": "Negotiate the timeline", "description": "Call the client back. There''s usually more flexibility than the initial panic suggests.", "traitScores": {"diplomacy": 90, "boundaries": 80, "strategic": 85}},
   {"id": "c1d", "text": "Assess and delegate", "description": "Break it into pieces. See who''s available and assign based on strengths.", "traitScores": {"organization": 90, "leadership": 75, "analytical": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['collaboration', 'intensity', 'leadership', 'independence', 'boundaries'],
 1),

-- c2: Your Ideal Workspace
('c2', 'candidate', 'metaphor', 'Environment',
 'If your ideal work environment was a place in nature, which would it be?',
 'Trust your gut - which image resonates most?',
 '[
   {"id": "c2a", "text": "A bustling beehive", "imageHint": "beehive", "description": "Constant activity, everyone has a role, collective purpose", "traitScores": {"collaboration": 95, "structure": 80, "social": 90}},
   {"id": "c2b", "text": "A mountain peak", "imageHint": "mountain", "description": "Challenging climb, clear goals, breathtaking views from the top", "traitScores": {"ambition": 95, "independence": 80, "achievement": 90}},
   {"id": "c2c", "text": "A flowing river", "imageHint": "river", "description": "Constant movement, adapting to terrain, finding the path of least resistance", "traitScores": {"adaptability": 95, "creativity": 75, "flexibility": 90}},
   {"id": "c2d", "text": "A deep forest", "imageHint": "forest", "description": "Rich ecosystem, interconnected but space to grow, wisdom in stillness", "traitScores": {"depth": 90, "independence": 70, "reflection": 85}}
 ]'::jsonb,
 NULL,
 ARRAY['collaboration', 'ambition', 'adaptability', 'independence'],
 2),

-- c3: The Impossible Choice
('c3', 'candidate', 'tradeoff', 'Values',
 'You can only optimize for one. Which matters more?',
 NULL,
 '[
   {"id": "c3a", "text": "Moving fast", "description": "Launch now, iterate later. Speed wins.", "traitScores": {"speed": 95, "risk": 80, "action": 90}},
   {"id": "c3b", "text": "Getting it right", "description": "Quality over speed. Do it once, do it well.", "traitScores": {"quality": 95, "patience": 80, "precision": 90}}
 ]'::jsonb,
 NULL,
 ARRAY['speed', 'quality', 'risk'],
 3),

-- c4: The Feedback Moment
('c4', 'candidate', 'scenario', 'Communication',
 'A colleague''s work has a significant flaw that others haven''t noticed. If not addressed, it could cause problems later.',
 'What''s your approach?',
 '[
   {"id": "c4a", "text": "Direct conversation", "description": "Pull them aside immediately. ''Hey, I noticed something we should fix.''", "traitScores": {"directness": 95, "courage": 85, "honesty": 90}},
   {"id": "c4b", "text": "Thoughtful framing", "description": "Wait for the right moment. Frame it as a question: ''Have you considered...''", "traitScores": {"diplomacy": 90, "empathy": 85, "patience": 80}},
   {"id": "c4c", "text": "Fix it yourself", "description": "Just quietly fix it. No need to make it a thing.", "traitScores": {"independence": 85, "avoidance": 60, "efficiency": 75}},
   {"id": "c4d", "text": "Escalate appropriately", "description": "Mention it to the team lead. It''s their job to handle these conversations.", "traitScores": {"process": 80, "hierarchy": 75, "caution": 70}}
 ]'::jsonb,
 NULL,
 ARRAY['directness', 'diplomacy', 'independence', 'hierarchy'],
 4),

-- c5: Energy Source
('c5', 'candidate', 'slider', 'Energy',
 'After an intense week, what recharges you more?',
 NULL,
 NULL,
 '{"min": 0, "max": 100, "minLabel": "Solo time - books, walks, thinking", "maxLabel": "Social time - friends, events, conversations", "trait": "extraversion"}'::jsonb,
 ARRAY['extraversion'],
 5),

-- c6: Value Priorities
('c6', 'candidate', 'ranking', 'Motivation',
 'Rank what matters most to you in a job (drag to reorder)',
 'Be honest - there are no wrong answers',
 '[
   {"id": "c6a", "text": "Impact", "description": "Making a real difference in the world", "traitScores": {"impact": 100}},
   {"id": "c6b", "text": "Growth", "description": "Learning and advancing your skills", "traitScores": {"growth": 100}},
   {"id": "c6c", "text": "Stability", "description": "Security and predictability", "traitScores": {"stability": 100}},
   {"id": "c6d", "text": "Recognition", "description": "Being valued and acknowledged", "traitScores": {"recognition": 100}},
   {"id": "c6e", "text": "Connection", "description": "Meaningful relationships with colleagues", "traitScores": {"connection": 100}},
   {"id": "c6f", "text": "Autonomy", "description": "Freedom to work your way", "traitScores": {"autonomy": 100}}
 ]'::jsonb,
 NULL,
 ARRAY['impact', 'growth', 'stability', 'recognition', 'connection', 'autonomy'],
 6),

-- c7: The Disagreement
('c7', 'candidate', 'scenario', 'Conflict',
 'You strongly disagree with a decision your manager just made. It affects your team''s work directly.',
 NULL,
 '[
   {"id": "c7a", "text": "Speak up immediately", "description": "Express your concerns in the meeting. Important to address it while everyone is present.", "traitScores": {"assertiveness": 95, "courage": 90, "directness": 85}},
   {"id": "c7b", "text": "Request a private chat", "description": "Ask to discuss it one-on-one after the meeting. More productive without an audience.", "traitScores": {"diplomacy": 90, "respect": 85, "strategy": 80}},
   {"id": "c7c", "text": "Gather allies first", "description": "Talk to teammates who share your concerns. Present a unified perspective.", "traitScores": {"coalition": 85, "strategy": 80, "influence": 75}},
   {"id": "c7d", "text": "Trust the process", "description": "They probably have context you don''t. Give it a chance to work.", "traitScores": {"trust": 80, "patience": 85, "adaptability": 75}}
 ]'::jsonb,
 NULL,
 ARRAY['assertiveness', 'diplomacy', 'trust', 'strategy'],
 7),

-- c8: Your Work Rhythm
('c8', 'candidate', 'metaphor', 'Pace',
 'Which musical rhythm best describes how you like to work?',
 NULL,
 '[
   {"id": "c8a", "text": "Jazz improvisation", "description": "Spontaneous, responsive, creating in the moment", "traitScores": {"flexibility": 95, "creativity": 90, "spontaneity": 85}},
   {"id": "c8b", "text": "Classical symphony", "description": "Structured, building to crescendos, every note intentional", "traitScores": {"structure": 95, "planning": 90, "precision": 85}},
   {"id": "c8c", "text": "Electronic beats", "description": "Steady rhythm, building layers, optimizing the groove", "traitScores": {"consistency": 90, "iteration": 85, "focus": 80}},
   {"id": "c8d", "text": "Rock anthem", "description": "High energy, emotional peaks, memorable moments", "traitScores": {"intensity": 95, "passion": 90, "impact": 85}}
 ]'::jsonb,
 NULL,
 ARRAY['flexibility', 'structure', 'consistency', 'intensity'],
 8),

-- c9: Innovation vs Reliability
('c9', 'candidate', 'tradeoff', 'Approach',
 'When solving a problem, which approach calls to you?',
 NULL,
 '[
   {"id": "c9a", "text": "Find something new", "description": "There might be a better way no one''s tried yet.", "traitScores": {"innovation": 95, "risk": 80, "creativity": 90}},
   {"id": "c9b", "text": "Use what works", "description": "Don''t reinvent the wheel. Build on proven approaches.", "traitScores": {"pragmatism": 95, "reliability": 85, "efficiency": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['innovation', 'pragmatism', 'risk'],
 9),

-- c10: Planning Spectrum
('c10', 'candidate', 'slider', 'Planning',
 'When starting a new project, where do you fall?',
 NULL,
 NULL,
 '{"min": 0, "max": 100, "minLabel": "Dive in and figure it out", "maxLabel": "Plan everything first", "trait": "planning"}'::jsonb,
 ARRAY['planning'],
 10),

-- c11: The Opportunity
('c11', 'candidate', 'scenario', 'Growth',
 'You''re offered a role in a completely new field. More money, but you''d be starting from scratch. Your current role has a clear promotion path.',
 NULL,
 '[
   {"id": "c11a", "text": "Take the leap", "description": "Growth happens outside comfort zones. The learning opportunity is worth the risk.", "traitScores": {"risk": 95, "growth": 90, "adventure": 85}},
   {"id": "c11b", "text": "Stay the course", "description": "Building mastery in your field is underrated. Depth over breadth.", "traitScores": {"stability": 85, "mastery": 90, "patience": 80}},
   {"id": "c11c", "text": "Negotiate a hybrid", "description": "Can you try it part-time first? Test before fully committing.", "traitScores": {"strategy": 90, "caution": 80, "flexibility": 85}},
   {"id": "c11d", "text": "Need more information", "description": "Too many unknowns. Research thoroughly before deciding.", "traitScores": {"analytical": 90, "caution": 85, "thoroughness": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['risk', 'stability', 'growth', 'analytical'],
 11),

-- c12: Peak Moment
('c12', 'candidate', 'reflection', 'Identity',
 'Think of a moment at work when you felt most alive. What were you doing?',
 'Write 1-2 sentences. There''s no right answer - we''re looking for what energizes you.',
 NULL,
 NULL,
 ARRAY['passion', 'motivation', 'values'],
 12),

-- c13: Team Role
('c13', 'candidate', 'metaphor', 'Collaboration',
 'In a band, which role do you naturally gravitate toward?',
 NULL,
 '[
   {"id": "c13a", "text": "Lead vocalist", "description": "Front and center, carrying the melody, connecting with the audience", "traitScores": {"leadership": 95, "visibility": 90, "influence": 85}},
   {"id": "c13b", "text": "Lead guitarist", "description": "Technical excellence, standout solos, recognized expertise", "traitScores": {"expertise": 95, "independence": 85, "recognition": 80}},
   {"id": "c13c", "text": "Bassist", "description": "The foundation, holding everything together, felt more than heard", "traitScores": {"support": 95, "reliability": 90, "humility": 85}},
   {"id": "c13d", "text": "Drummer", "description": "Setting the pace, high energy, driving the whole group forward", "traitScores": {"drive": 95, "energy": 90, "consistency": 85}}
 ]'::jsonb,
 NULL,
 ARRAY['leadership', 'expertise', 'support', 'drive'],
 13),

-- c14: Depth vs Breadth
('c14', 'candidate', 'tradeoff', 'Learning',
 'Given unlimited time to learn, which appeals more?',
 NULL,
 '[
   {"id": "c14a", "text": "Master one thing", "description": "Become world-class at a single skill. True expertise.", "traitScores": {"depth": 95, "focus": 90, "mastery": 85}},
   {"id": "c14b", "text": "Learn many things", "description": "Develop broad knowledge across domains. Connect ideas.", "traitScores": {"breadth": 95, "curiosity": 90, "versatility": 85}}
 ]'::jsonb,
 NULL,
 ARRAY['depth', 'breadth', 'focus', 'curiosity'],
 14),

-- c15: The Mistake
('c15', 'candidate', 'scenario', 'Accountability',
 'You made a mistake that cost the company money. No one has noticed yet.',
 NULL,
 '[
   {"id": "c15a", "text": "Immediate disclosure", "description": "Go to your manager right away. Better they hear it from you.", "traitScores": {"honesty": 95, "accountability": 90, "courage": 85}},
   {"id": "c15b", "text": "Fix first, then tell", "description": "Solve the problem, then report it along with your solution.", "traitScores": {"ownership": 90, "problem_solving": 85, "initiative": 80}},
   {"id": "c15c", "text": "Assess the situation", "description": "Understand the full impact first. No point causing alarm if it''s minor.", "traitScores": {"analytical": 85, "caution": 80, "strategic": 75}},
   {"id": "c15d", "text": "Learn and prevent", "description": "Focus on making sure it doesn''t happen again. Document for yourself.", "traitScores": {"learning": 80, "prevention": 85, "independence": 70}}
 ]'::jsonb,
 NULL,
 ARRAY['honesty', 'accountability', 'ownership', 'analytical'],
 15),

-- c16: Work-Life Integration
('c16', 'candidate', 'slider', 'Balance',
 'How do you think about work and life?',
 NULL,
 NULL,
 '{"min": 0, "max": 100, "minLabel": "Clear separation - work stays at work", "maxLabel": "Fully integrated - work is part of life", "trait": "integration"}'::jsonb,
 ARRAY['integration'],
 16)

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
  updated_at = NOW();

-- ============================================
-- EMPLOYER ASSESSMENT QUESTIONS (16 questions)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order)
VALUES
-- e1: The Hire
('e1', 'employer', 'scenario', 'Hiring Values',
 'Two final candidates: One has perfect skills but average culture fit. The other has great culture fit but needs some skill development.',
 NULL,
 '[
   {"id": "e1a", "text": "Hire for skills", "description": "Skills are hard to teach. Culture can adapt over time.", "traitScores": {"skills_focus": 95, "efficiency": 85, "pragmatism": 80}},
   {"id": "e1b", "text": "Hire for culture", "description": "Culture is who they are. Skills can be developed.", "traitScores": {"culture_focus": 95, "development": 85, "long_term": 80}},
   {"id": "e1c", "text": "Keep looking", "description": "Don''t compromise. The right person has both.", "traitScores": {"high_bar": 95, "patience": 80, "perfectionism": 75}},
   {"id": "e1d", "text": "Hire both differently", "description": "Skill person for urgent role, culture person for growth track.", "traitScores": {"flexibility": 90, "strategic": 85, "pragmatism": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['skills_focus', 'culture_focus', 'high_bar', 'flexibility'],
 1),

-- e2: Company Personality
('e2', 'employer', 'metaphor', 'Culture',
 'If your company was a place to visit, what would it be?',
 NULL,
 '[
   {"id": "e2a", "text": "A startup garage", "description": "Scrappy, inventive, building something from nothing", "traitScores": {"innovation": 95, "scrappiness": 90, "risk": 85}},
   {"id": "e2b", "text": "A research library", "description": "Deep thinking, expertise, thoughtful decisions", "traitScores": {"depth": 95, "expertise": 90, "deliberation": 85}},
   {"id": "e2c", "text": "A sports stadium", "description": "High energy, competition, celebrating wins together", "traitScores": {"competition": 95, "energy": 90, "celebration": 85}},
   {"id": "e2d", "text": "A cozy coffee shop", "description": "Warm relationships, comfortable pace, meaningful conversations", "traitScores": {"warmth": 95, "connection": 90, "comfort": 85}}
 ]'::jsonb,
 NULL,
 ARRAY['innovation', 'depth', 'competition', 'warmth'],
 2),

-- e3: Speed vs Consensus
('e3', 'employer', 'tradeoff', 'Decision Making',
 'When making important decisions, which do you prioritize?',
 NULL,
 '[
   {"id": "e3a", "text": "Move fast", "description": "Strong opinions, loosely held. Decide and iterate.", "traitScores": {"speed": 95, "autonomy": 85, "action": 90}},
   {"id": "e3b", "text": "Build consensus", "description": "Bring everyone along. Decisions stick when people buy in.", "traitScores": {"consensus": 95, "inclusion": 85, "thoroughness": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['speed', 'consensus', 'autonomy', 'inclusion'],
 3),

-- e4: The Underperformer
('e4', 'employer', 'scenario', 'Management',
 'A team member is consistently underperforming. They''re well-liked and have been with the company for years.',
 NULL,
 '[
   {"id": "e4a", "text": "Direct conversation", "description": "Clear expectations, specific timeline. They deserve honesty.", "traitScores": {"directness": 95, "fairness": 85, "clarity": 90}},
   {"id": "e4b", "text": "Find their strength", "description": "Maybe they''re in the wrong role. Explore where they could thrive.", "traitScores": {"development": 90, "empathy": 85, "creative_solutions": 80}},
   {"id": "e4c", "text": "Increase support", "description": "Give them more resources, mentorship, training first.", "traitScores": {"support": 90, "patience": 85, "investment": 80}},
   {"id": "e4d", "text": "Make the hard call", "description": "Sometimes the kindest thing is a clean break.", "traitScores": {"decisiveness": 95, "results": 85, "tough_love": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['directness', 'development', 'support', 'decisiveness'],
 4),

-- e5: Hierarchy
('e5', 'employer', 'slider', 'Structure',
 'How is your organization structured?',
 NULL,
 NULL,
 '{"min": 0, "max": 100, "minLabel": "Flat - everyone contributes ideas equally", "maxLabel": "Hierarchical - clear chain of command", "trait": "hierarchy"}'::jsonb,
 ARRAY['hierarchy'],
 5),

-- e6: Culture Priorities
('e6', 'employer', 'ranking', 'Values',
 'Rank what your company values most (drag to reorder)',
 NULL,
 '[
   {"id": "e6a", "text": "Results", "description": "Outcomes matter most", "traitScores": {"results": 100}},
   {"id": "e6b", "text": "Innovation", "description": "New ideas and approaches", "traitScores": {"innovation": 100}},
   {"id": "e6c", "text": "Collaboration", "description": "Working together effectively", "traitScores": {"collaboration": 100}},
   {"id": "e6d", "text": "Excellence", "description": "Highest quality in everything", "traitScores": {"excellence": 100}},
   {"id": "e6e", "text": "Growth", "description": "Developing people and business", "traitScores": {"growth": 100}},
   {"id": "e6f", "text": "Integrity", "description": "Doing the right thing always", "traitScores": {"integrity": 100}}
 ]'::jsonb,
 NULL,
 ARRAY['results', 'innovation', 'collaboration', 'excellence', 'growth', 'integrity'],
 6),

-- e7: The Opportunity Cost
('e7', 'employer', 'scenario', 'Strategy',
 'A promising new market opportunity emerged, but pursuing it means pulling resources from a successful existing product.',
 NULL,
 '[
   {"id": "e7a", "text": "Go all in", "description": "Fortune favors the bold. The new opportunity could be transformative.", "traitScores": {"risk": 95, "vision": 90, "boldness": 85}},
   {"id": "e7b", "text": "Protect what works", "description": "Don''t kill the golden goose. New opportunities will come.", "traitScores": {"stability": 90, "prudence": 85, "protection": 80}},
   {"id": "e7c", "text": "Test and learn", "description": "Small bet first. Prove it works before going big.", "traitScores": {"analytical": 90, "measured": 85, "learning": 80}},
   {"id": "e7d", "text": "Build capacity", "description": "Find a way to do both. Hire, partner, get creative.", "traitScores": {"growth": 90, "ambition": 85, "resourcefulness": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['risk', 'stability', 'analytical', 'growth'],
 7),

-- e8: Meeting Style
('e8', 'employer', 'metaphor', 'Communication',
 'What does a typical meeting feel like at your company?',
 NULL,
 '[
   {"id": "e8a", "text": "A debate club", "description": "Ideas clash, best arguments win, vigorous discussion", "traitScores": {"debate": 95, "meritocracy": 90, "intellectual": 85}},
   {"id": "e8b", "text": "A jazz session", "description": "Riffing on ideas, building together, improvisation", "traitScores": {"creativity": 95, "collaboration": 90, "spontaneity": 85}},
   {"id": "e8c", "text": "A briefing", "description": "Efficient updates, clear action items, minimal fluff", "traitScores": {"efficiency": 95, "clarity": 90, "action": 85}},
   {"id": "e8d", "text": "A campfire", "description": "Stories shared, relationships built, collective wisdom", "traitScores": {"connection": 95, "storytelling": 90, "warmth": 85}}
 ]'::jsonb,
 NULL,
 ARRAY['debate', 'creativity', 'efficiency', 'connection'],
 8),

-- e9: Experience vs Potential
('e9', 'employer', 'tradeoff', 'Hiring',
 'What do you weight more heavily when hiring?',
 NULL,
 '[
   {"id": "e9a", "text": "Proven experience", "description": "They''ve done this before. Reduced risk, faster ramp-up.", "traitScores": {"experience": 95, "risk_averse": 85, "predictability": 80}},
   {"id": "e9b", "text": "Raw potential", "description": "Hungry and capable. They''ll grow into it and beyond.", "traitScores": {"potential": 95, "development": 85, "optimism": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['experience', 'potential', 'risk_averse', 'development'],
 9),

-- e10: Feedback Culture
('e10', 'employer', 'slider', 'Feedback',
 'How does feedback typically flow at your company?',
 NULL,
 NULL,
 '{"min": 0, "max": 100, "minLabel": "Formal reviews - structured, scheduled", "maxLabel": "Continuous - real-time, in the moment", "trait": "feedback_style"}'::jsonb,
 ARRAY['feedback_style'],
 10),

-- e11: The Crisis
('e11', 'employer', 'scenario', 'Leadership',
 'A major project just failed publicly. Team morale is low, stakeholders are upset.',
 NULL,
 '[
   {"id": "e11a", "text": "Own it publicly", "description": "Take responsibility. Shield the team, address stakeholders directly.", "traitScores": {"accountability": 95, "leadership": 90, "protection": 85}},
   {"id": "e11b", "text": "Analyze first", "description": "Understand what happened before responding. Data over emotion.", "traitScores": {"analytical": 90, "measured": 85, "thoroughness": 80}},
   {"id": "e11c", "text": "Rally the team", "description": "Focus internally first. Morale matters more than PR right now.", "traitScores": {"people_first": 95, "empathy": 90, "team": 85}},
   {"id": "e11d", "text": "Move forward fast", "description": "Don''t dwell. Quickly pivot to what''s next.", "traitScores": {"resilience": 90, "action": 85, "forward": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['accountability', 'analytical', 'people_first', 'resilience'],
 11),

-- e12: Culture Moment
('e12', 'employer', 'reflection', 'Identity',
 'Describe a moment when your company culture was at its best.',
 'Write 1-2 sentences. What happened? What made it special?',
 NULL,
 NULL,
 ARRAY['culture', 'values', 'pride'],
 12),

-- e13: Work Intensity
('e13', 'employer', 'slider', 'Pace',
 'What pace does your company operate at?',
 NULL,
 NULL,
 '{"min": 0, "max": 100, "minLabel": "Sustainable - marathon pace, long-term focus", "maxLabel": "Intense - sprint pace, high urgency", "trait": "intensity"}'::jsonb,
 ARRAY['intensity'],
 13),

-- e14: The Remote Question
('e14', 'employer', 'scenario', 'Flexibility',
 'Your best performer wants to go fully remote. Team collaboration is important to your culture.',
 NULL,
 '[
   {"id": "e14a", "text": "Full flexibility", "description": "Results matter, not location. Make it work.", "traitScores": {"flexibility": 95, "trust": 90, "results": 85}},
   {"id": "e14b", "text": "Hybrid compromise", "description": "Find middle ground. Some in-person time is valuable.", "traitScores": {"balance": 90, "pragmatism": 85, "collaboration": 80}},
   {"id": "e14c", "text": "Hold the line", "description": "Culture requires presence. Equal rules for everyone.", "traitScores": {"consistency": 90, "fairness": 85, "culture": 80}},
   {"id": "e14d", "text": "Case by case", "description": "Top performers earn special arrangements.", "traitScores": {"meritocracy": 85, "flexibility": 80, "pragmatism": 75}}
 ]'::jsonb,
 NULL,
 ARRAY['flexibility', 'balance', 'consistency', 'meritocracy'],
 14),

-- e15: Transparency
('e15', 'employer', 'tradeoff', 'Communication',
 'How much information should employees have access to?',
 NULL,
 '[
   {"id": "e15a", "text": "Radical transparency", "description": "Share everything. Financials, strategies, challenges. Trust breeds trust.", "traitScores": {"transparency": 95, "trust": 90, "openness": 85}},
   {"id": "e15b", "text": "Need to know", "description": "Share what''s relevant. Too much information creates noise and anxiety.", "traitScores": {"discretion": 90, "focus": 85, "protection": 80}}
 ]'::jsonb,
 NULL,
 ARRAY['transparency', 'discretion', 'trust', 'focus'],
 15),

-- e16: Innovation Appetite
('e16', 'employer', 'slider', 'Innovation',
 'How does your company approach innovation?',
 NULL,
 NULL,
 '{"min": 0, "max": 100, "minLabel": "Optimize - perfect what works", "maxLabel": "Disrupt - constantly reinvent", "trait": "innovation"}'::jsonb,
 ARRAY['innovation'],
 16)

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
  updated_at = NOW();

-- ============================================
-- VERIFY INSERTED QUESTIONS
-- ============================================
SELECT 'Questions inserted:' as status;

SELECT question_type, COUNT(*) as count
FROM public.questions
GROUP BY question_type;

SELECT question_code, question_type, question_format, category
FROM public.questions
ORDER BY question_type, display_order;
