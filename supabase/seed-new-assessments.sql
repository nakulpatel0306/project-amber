-- Seed Questions for New Assessments
-- Run this AFTER schema.sql in Supabase SQL Editor
-- Adds questions for: Cognitive Patterns, Situational Judgment, Work Values

-- ============================================
-- COGNITIVE PATTERNS QUESTIONS (cp1-cp8)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order)
VALUES
  -- CP1: Problem-solving approach
  ('cp1', 'cognitive_patterns', 'scenario', 'Problem Solving',
   'You encounter a complex bug that''s been stumping the team for days. How do you approach it?',
   'Choose the approach that feels most natural to you.',
   '[
     {"id": "cp1a", "text": "Systematic elimination", "description": "Isolate variables one by one, test each hypothesis methodically until you find the root cause.", "traitScores": {"analytical": 95, "thoroughness": 90, "process": 85}},
     {"id": "cp1b", "text": "Intuitive pattern matching", "description": "Trust your gut — you''ve seen patterns like this before. Jump to likely causes and test your hunch.", "traitScores": {"curiosity": 85, "intuition": 90, "risk": 70}},
     {"id": "cp1c", "text": "Rubber duck it", "description": "Talk it through with someone. Explaining the problem out loud often reveals the answer.", "traitScores": {"collaboration": 90, "social": 80, "empathy": 70}},
     {"id": "cp1d", "text": "Step away and reframe", "description": "Take a walk, work on something else. Fresh eyes see what tired ones miss.", "traitScores": {"creativity": 85, "flexibility": 90, "resilience": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['analytical', 'intuition', 'collaboration', 'creativity'],
   1),

  -- CP2: Information processing style
  ('cp2', 'cognitive_patterns', 'scenario', 'Learning Style',
   'You need to learn a completely new technology stack for an upcoming project. How do you start?',
   'What does your learning process look like?',
   '[
     {"id": "cp2a", "text": "Read the docs first", "description": "Start with official documentation and tutorials. Build a mental model before touching code.", "traitScores": {"thoroughness": 95, "structure": 85, "planning": 80}},
     {"id": "cp2b", "text": "Build something immediately", "description": "Clone a starter repo and start hacking. You learn best by doing, not reading.", "traitScores": {"risk": 85, "intensity": 80, "pragmatism": 90}},
     {"id": "cp2c", "text": "Find a course or mentor", "description": "Look for a structured learning path or someone who already knows it well.", "traitScores": {"structure": 90, "collaboration": 80, "growth": 85}},
     {"id": "cp2d", "text": "Explore the ecosystem", "description": "Browse GitHub repos, read blog posts, watch conference talks. Understand the landscape first.", "traitScores": {"curiosity": 95, "breadth": 90, "openness": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['thoroughness', 'pragmatism', 'curiosity', 'structure'],
   2),

  -- CP3: Decision-making under uncertainty
  ('cp3', 'cognitive_patterns', 'tradeoff', 'Decision Making',
   'When making a decision with incomplete information, which approach do you lean toward?',
   'Pick the option that resonates more with how you naturally decide.',
   '[
     {"id": "cp3a", "text": "Gather more data", "description": "Delay the decision until you have enough information to be confident. Better slow and right than fast and wrong.", "traitScores": {"analytical": 90, "caution": 85, "thoroughness": 80}},
     {"id": "cp3b", "text": "Decide and iterate", "description": "Make the best decision you can now and adjust as you learn more. Speed beats perfection.", "traitScores": {"risk": 85, "intensity": 80, "flexibility": 90}}
   ]'::jsonb,
   NULL,
   ARRAY['analytical', 'risk', 'caution', 'flexibility'],
   3),

  -- CP4: Abstraction preference
  ('cp4', 'cognitive_patterns', 'scenario', 'Thinking Style',
   'When explaining a complex concept to a colleague, which technique do you reach for first?',
   'How do you make the abstract concrete?',
   '[
     {"id": "cp4a", "text": "Draw a diagram", "description": "Visual mapping — boxes, arrows, flowcharts. A picture clarifies what words cannot.", "traitScores": {"strategic": 85, "organization": 80, "creativity": 75}},
     {"id": "cp4b", "text": "Tell a story or analogy", "description": "\"It''s like when...\" — connect the new concept to something familiar.", "traitScores": {"empathy": 85, "creativity": 90, "social": 80}},
     {"id": "cp4c", "text": "Walk through step by step", "description": "Break it into sequential pieces. First this happens, then this, then this...", "traitScores": {"structure": 90, "thoroughness": 85, "process": 80}},
     {"id": "cp4d", "text": "Show running code or examples", "description": "Concrete demonstrations beat abstract explanations every time.", "traitScores": {"pragmatism": 95, "depth": 80, "directness": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['strategic', 'creativity', 'structure', 'pragmatism'],
   4),

  -- CP5: Focus spectrum slider
  ('cp5', 'cognitive_patterns', 'slider', 'Focus',
   'Where do you fall on the focus spectrum?',
   'There''s no right answer — both ends have strengths.',
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Deep focus on one thing at a time", "maxLabel": "Juggling multiple threads simultaneously", "trait": "multitasking"}'::jsonb,
   ARRAY['focus', 'flexibility', 'intensity'],
   5),

  -- CP6: Feedback processing
  ('cp6', 'cognitive_patterns', 'scenario', 'Self-Awareness',
   'After completing a big project, what do you instinctively do first?',
   'How do you process outcomes?',
   '[
     {"id": "cp6a", "text": "Retrospective analysis", "description": "Review what went well, what didn''t, document the learnings for next time.", "traitScores": {"analytical": 90, "growth": 85, "thoroughness": 80}},
     {"id": "cp6b", "text": "Celebrate and move on", "description": "Ship it, high-fives, next project. Momentum matters more than post-mortems.", "traitScores": {"intensity": 85, "ambition": 80, "resilience": 75}},
     {"id": "cp6c", "text": "Gather team feedback", "description": "Ask the team how they felt, what they''d change, what landed. The human side matters.", "traitScores": {"empathy": 90, "collaboration": 85, "leadership": 80}},
     {"id": "cp6d", "text": "Compare to initial goals", "description": "Pull up the original spec. Did we hit the targets? What''s the data say?", "traitScores": {"accountability": 90, "analytical": 85, "focus": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['analytical', 'ambition', 'empathy', 'accountability'],
   6),

  -- CP7: Creativity vs structure tradeoff
  ('cp7', 'cognitive_patterns', 'tradeoff', 'Innovation',
   'When starting a new feature or product, which feels more natural?',
   NULL,
   '[
     {"id": "cp7a", "text": "Blueprint first", "description": "Design the architecture, define the spec, plan the milestones. Then build with confidence.", "traitScores": {"planning": 95, "structure": 90, "thoroughness": 85}},
     {"id": "cp7b", "text": "Prototype first", "description": "Build a rough version fast. Let the design emerge from what you learn by doing.", "traitScores": {"innovation": 90, "risk": 85, "creativity": 90}}
   ]'::jsonb,
   NULL,
   ARRAY['planning', 'innovation', 'structure', 'creativity'],
   7),

  -- CP8: Cognitive load slider
  ('cp8', 'cognitive_patterns', 'slider', 'Complexity',
   'How do you feel about complexity?',
   'Where do you sit on this spectrum?',
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Simplify everything — less is more", "maxLabel": "Embrace complexity — nuance matters", "trait": "complexity_tolerance"}'::jsonb,
   ARRAY['thoroughness', 'openness', 'pragmatism'],
   8)

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
-- SITUATIONAL JUDGMENT QUESTIONS (sj1-sj8)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order)
VALUES
  -- SJ1: Team conflict resolution
  ('sj1', 'situational_judgment', 'scenario', 'Conflict',
   'Two team members are in a heated disagreement about the technical approach for a project. It''s slowing everyone down.',
   'What do you do?',
   '[
     {"id": "sj1a", "text": "Mediate directly", "description": "Bring them together, listen to both sides, and help find common ground.", "traitScores": {"diplomacy": 90, "empathy": 85, "leadership": 80}},
     {"id": "sj1b", "text": "Let them work it out", "description": "Adults should resolve their own conflicts. Step in only if it escalates.", "traitScores": {"independence": 80, "boundaries": 85, "patience": 75}},
     {"id": "sj1c", "text": "Propose a compromise", "description": "Suggest a middle-ground approach that incorporates both perspectives.", "traitScores": {"cooperation": 90, "creativity": 75, "diplomacy": 80}},
     {"id": "sj1d", "text": "Escalate to leadership", "description": "Flag it to the team lead. This is above your pay grade.", "traitScores": {"process": 85, "caution": 80, "hierarchy": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['diplomacy', 'empathy', 'cooperation', 'independence'],
   1),

  -- SJ2: Ethics/integrity
  ('sj2', 'situational_judgment', 'scenario', 'Ethics',
   'You discover that a popular feature your team shipped has a subtle bug that benefits the company financially but disadvantages some users.',
   'How do you handle it?',
   '[
     {"id": "sj2a", "text": "Report immediately", "description": "Flag it to your manager and push for an immediate fix, even if it hurts revenue.", "traitScores": {"honesty": 95, "accountability": 90, "courage": 85}},
     {"id": "sj2b", "text": "Quantify the impact", "description": "Analyze how many users are affected and how much revenue is involved before deciding.", "traitScores": {"analytical": 90, "caution": 80, "thoroughness": 85}},
     {"id": "sj2c", "text": "Fix it quietly", "description": "Submit a bug fix without making a big deal about it. Problem solved.", "traitScores": {"independence": 80, "ownership": 85, "efficiency": 75}},
     {"id": "sj2d", "text": "Raise it with the team", "description": "Bring it up in the next team meeting as a discussion point about priorities.", "traitScores": {"collaboration": 85, "diplomacy": 80, "honesty": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['honesty', 'accountability', 'analytical', 'courage'],
   2),

  -- SJ3: Pressure handling
  ('sj3', 'situational_judgment', 'scenario', 'Pressure',
   'A critical deadline is 2 days away. The project is behind schedule. Your manager asks if you can deliver on time.',
   'What do you say?',
   '[
     {"id": "sj3a", "text": "Commit and deliver", "description": "\"Yes, I''ll make it happen.\" Then work extra hours to meet the deadline.", "traitScores": {"intensity": 90, "ownership": 85, "courage": 80}},
     {"id": "sj3b", "text": "Be transparent", "description": "\"Honestly, we need 2 more days. Here''s what I can deliver by the deadline.\"", "traitScores": {"honesty": 95, "boundaries": 85, "emotional_regulation": 80}},
     {"id": "sj3c", "text": "Negotiate scope", "description": "\"We can ship the core features on time if we defer these lower-priority items.\"", "traitScores": {"strategic": 90, "diplomacy": 85, "pragmatism": 80}},
     {"id": "sj3d", "text": "Rally the team", "description": "\"Let me check with the team. If we redistribute work, we might pull it off.\"", "traitScores": {"collaboration": 90, "leadership": 80, "optimism": 75}}
   ]'::jsonb,
   NULL,
   ARRAY['honesty', 'intensity', 'strategic', 'collaboration'],
   3),

  -- SJ4: Resilience to criticism
  ('sj4', 'situational_judgment', 'scenario', 'Resilience',
   'In a review meeting, a senior leader harshly criticizes your work in front of the entire team. Some of their points are valid, but the delivery feels personal.',
   'How do you respond?',
   '[
     {"id": "sj4a", "text": "Stay composed", "description": "Take notes, thank them for the feedback, and process it later privately.", "traitScores": {"emotional_regulation": 95, "patience": 85, "resilience": 80}},
     {"id": "sj4b", "text": "Push back respectfully", "description": "Acknowledge valid points but address the delivery: \"I appreciate the feedback, though I''d prefer to discuss this 1:1.\"", "traitScores": {"assertiveness": 90, "courage": 85, "boundaries": 80}},
     {"id": "sj4c", "text": "Seek support afterward", "description": "Talk to a trusted colleague or your direct manager about the interaction.", "traitScores": {"connection": 85, "empathy": 80, "emotional_expression": 75}},
     {"id": "sj4d", "text": "Channel it into improvement", "description": "Use the criticism as fuel. Come back next meeting with dramatically improved work.", "traitScores": {"resilience": 90, "ambition": 85, "initiative": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['emotional_regulation', 'resilience', 'assertiveness', 'connection'],
   4),

  -- SJ5: Proactive support
  ('sj5', 'situational_judgment', 'scenario', 'Support',
   'A colleague who joined recently is clearly struggling with their workload. They haven''t asked for help, but you can see they''re stressed.',
   'What do you do?',
   '[
     {"id": "sj5a", "text": "Offer help proactively", "description": "\"Hey, I''ve got some bandwidth. Can I take anything off your plate?\"", "traitScores": {"empathy": 95, "collaboration": 85, "initiative": 80}},
     {"id": "sj5b", "text": "Respect their autonomy", "description": "They''ll ask if they need help. Stepping in unsolicited might undermine their confidence.", "traitScores": {"boundaries": 85, "independence": 80, "patience": 75}},
     {"id": "sj5c", "text": "Mention it to your manager", "description": "Let the team lead know so they can check in and redistribute if needed.", "traitScores": {"process": 85, "caution": 80, "accountability": 75}},
     {"id": "sj5d", "text": "Share knowledge casually", "description": "Without making it a \"help\" moment, share tips and resources that might make their work easier.", "traitScores": {"diplomacy": 90, "empathy": 80, "cooperation": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['empathy', 'collaboration', 'boundaries', 'diplomacy'],
   5),

  -- SJ6: Communication style
  ('sj6', 'situational_judgment', 'tradeoff', 'Communication',
   'When delivering difficult news to a stakeholder, which do you lean toward?',
   NULL,
   '[
     {"id": "sj6a", "text": "Honest and direct", "description": "Tell them exactly what happened and why. No sugarcoating.", "traitScores": {"honesty": 95, "directness": 90, "courage": 85}},
     {"id": "sj6b", "text": "Thoughtful and diplomatic", "description": "Frame the news carefully, focusing on solutions and next steps.", "traitScores": {"diplomacy": 95, "empathy": 85, "strategic": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['honesty', 'diplomacy', 'courage', 'empathy'],
   6),

  -- SJ7: Ownership/initiative
  ('sj7', 'situational_judgment', 'scenario', 'Ownership',
   'A task falls through the cracks — it''s not clearly assigned to anyone. The deadline is tomorrow.',
   'What do you do?',
   '[
     {"id": "sj7a", "text": "Pick it up yourself", "description": "Someone needs to own it. You step up and get it done.", "traitScores": {"initiative": 95, "ownership": 90, "intensity": 80}},
     {"id": "sj7b", "text": "Flag it to the team", "description": "Send a message: \"Hey team, this is unassigned. Who can take it?\"", "traitScores": {"collaboration": 85, "process": 80, "leadership": 75}},
     {"id": "sj7c", "text": "Escalate to the lead", "description": "This is a process failure. Alert the team lead so they can assign it properly.", "traitScores": {"process": 90, "analytical": 80, "caution": 75}},
     {"id": "sj7d", "text": "Assess and divide", "description": "Break the task into parts and coordinate with available teammates to split the work.", "traitScores": {"organization": 90, "collaboration": 85, "strategic": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['initiative', 'ownership', 'collaboration', 'process'],
   7),

  -- SJ8: Emotional expression
  ('sj8', 'situational_judgment', 'slider', 'Expression',
   'How comfortable are you expressing emotions at work?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Keep it professional - emotions stay private", "maxLabel": "Be authentic - share how you feel openly", "trait": "emotional_expression"}'::jsonb,
   ARRAY['emotional_expression'],
   8)

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
-- WORK VALUES QUESTIONS (wv1-wv8)
-- ============================================

INSERT INTO public.questions (question_code, question_type, question_format, category, question_text, description, options, slider_config, traits, display_order)
VALUES
  -- WV1: Meaningful work vs financial security
  ('wv1', 'work_values', 'tradeoff', 'Purpose',
   'If you had to choose, which would you prioritize?',
   NULL,
   '[
     {"id": "wv1a", "text": "Meaningful work", "description": "A role where you feel you''re making a real difference, even if the pay is modest.", "traitScores": {"purpose": 95, "intrinsic_motivation": 85, "impact": 80}},
     {"id": "wv1b", "text": "Financial security", "description": "A well-paying role that provides stability, even if the work isn''t deeply fulfilling.", "traitScores": {"financial_security": 95, "stability": 85, "pragmatism": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['purpose', 'financial_security', 'intrinsic_motivation'],
   1),

  -- WV2: Ideal workday style
  ('wv2', 'work_values', 'scenario', 'Work Style',
   'Imagine your ideal workday. Which sounds most appealing?',
   'Pick the one that energizes you most.',
   '[
     {"id": "wv2a", "text": "Creative exploration", "description": "Brainstorming sessions, prototyping, and exploring uncharted ideas all day.", "traitScores": {"creativity": 90, "innovation": 85, "self_direction": 80}},
     {"id": "wv2b", "text": "Structured execution", "description": "Clear priorities, focused deep work, and checking off well-defined goals.", "traitScores": {"structure": 90, "planning": 85, "process": 80}},
     {"id": "wv2c", "text": "Collaborative building", "description": "Pair programming, team discussions, and building something together.", "traitScores": {"collaboration": 90, "cooperation": 85, "connection": 80}},
     {"id": "wv2d", "text": "Mentoring & leading", "description": "Coaching others, setting strategy, and seeing your team grow.", "traitScores": {"leadership": 90, "empathy": 80, "impact": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['creativity', 'structure', 'collaboration', 'leadership'],
   2),

  -- WV3: Career growth path
  ('wv3', 'work_values', 'tradeoff', 'Growth',
   'Which career path appeals to you more?',
   NULL,
   '[
     {"id": "wv3a", "text": "Rapid growth with risk", "description": "Fast advancement, big challenges, but uncertain outcomes.", "traitScores": {"risk": 90, "growth": 95, "courage": 80}},
     {"id": "wv3b", "text": "Steady progression", "description": "Predictable advancement, building expertise over time, low stress.", "traitScores": {"stability": 90, "mastery": 85, "patience": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['risk', 'stability', 'growth', 'mastery'],
   3),

  -- WV4: Recognition preference
  ('wv4', 'work_values', 'scenario', 'Recognition',
   'Which form of recognition would mean the most to you?',
   NULL,
   '[
     {"id": "wv4a", "text": "Public praise", "description": "Being highlighted in an all-hands meeting for your contributions.", "traitScores": {"recognition": 95, "social": 80, "ambition": 75}},
     {"id": "wv4b", "text": "Quiet acknowledgment", "description": "A thoughtful private message from your manager recognizing your effort.", "traitScores": {"depth": 80, "empathy": 85, "diplomacy": 75}},
     {"id": "wv4c", "text": "More responsibility", "description": "Being trusted with a bigger project or more autonomy.", "traitScores": {"autonomy": 90, "growth": 85, "ownership": 80}},
     {"id": "wv4d", "text": "Tangible reward", "description": "A bonus, raise, or promotion that reflects your value.", "traitScores": {"financial_security": 85, "achievement": 90, "pragmatism": 80}}
   ]'::jsonb,
   NULL,
   ARRAY['recognition', 'autonomy', 'achievement', 'depth'],
   4),

  -- WV5: Teamwork style
  ('wv5', 'work_values', 'slider', 'Teamwork',
   'In your ideal work environment, how do people interact?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Cooperative - everyone supports each other", "maxLabel": "Competitive - healthy rivalry drives results", "trait": "competition"}'::jsonb,
   ARRAY['competition', 'cooperation'],
   5),

  -- WV6: Company mission type
  ('wv6', 'work_values', 'scenario', 'Mission',
   'Which type of company mission resonates most with you?',
   NULL,
   '[
     {"id": "wv6a", "text": "Change the world", "description": "Tackling big societal problems like climate, health, or education.", "traitScores": {"purpose": 95, "impact": 90, "courage": 75}},
     {"id": "wv6b", "text": "Build the future", "description": "Pushing the boundaries of technology and innovation.", "traitScores": {"innovation": 95, "creativity": 85, "risk": 80}},
     {"id": "wv6c", "text": "Empower people", "description": "Creating tools and services that make people''s lives better.", "traitScores": {"empathy": 90, "connection": 85, "collaboration": 80}},
     {"id": "wv6d", "text": "Deliver excellence", "description": "Being the best at what you do, setting the industry standard.", "traitScores": {"quality": 95, "mastery": 90, "achievement": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['purpose', 'innovation', 'empathy', 'quality'],
   6),

  -- WV7: Expertise development
  ('wv7', 'work_values', 'tradeoff', 'Expertise',
   'If you could only develop one way, which would you choose?',
   NULL,
   '[
     {"id": "wv7a", "text": "Deep expertise", "description": "Become the go-to expert in one specific domain.", "traitScores": {"depth": 95, "mastery": 90, "focus": 85}},
     {"id": "wv7b", "text": "Broad versatility", "description": "Build skills across many areas, connecting dots others miss.", "traitScores": {"versatility": 95, "curiosity": 90, "breadth": 85}}
   ]'::jsonb,
   NULL,
   ARRAY['depth', 'versatility', 'mastery', 'curiosity'],
   7),

  -- WV8: Work intensity
  ('wv8', 'work_values', 'slider', 'Intensity',
   'What work intensity feels right for you?',
   NULL,
   NULL,
   '{"min": 0, "max": 100, "minLabel": "Sustainable pace - balance and well-being", "maxLabel": "All-in intensity - push hard, achieve more", "trait": "intensity"}'::jsonb,
   ARRAY['intensity', 'boundaries'],
   8)

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
SELECT 'Questions seeded successfully!' as status;

SELECT question_type, COUNT(*) as count
FROM public.questions
WHERE question_type IN ('cognitive_patterns', 'situational_judgment', 'work_values')
GROUP BY question_type
ORDER BY question_type;
