export interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  slug: string;
  content: string[];
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Personality Science": "#8B5CF6",
  "Career Tips": "#10B981",
  "Product Updates": "#F59E0B",
  "Culture & Hiring": "#EC4899",
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Why Your Personality Matters More Than Your Resume",
    category: "Personality Science",
    date: "February 18, 2026",
    readTime: "5 min read",
    excerpt:
      "Some of the most impressive people we know are not the ones with the highest grades. They are the ones who showed up, let their personality lead, and built real relationships. Here is why that matters for hiring.",
    slug: "personality-matters-more-than-resume",
    content: [
      "We have all seen it happen. Someone with an incredible resume joins a team and within a few months it is clear something is off. Not a skill issue. A fit issue. They are smart and capable, but the way they communicate, make decisions, or handle conflict just does not mesh with the people around them.",
      "Meanwhile, someone else — maybe without the most polished background — joins and immediately clicks. They ask the right questions, bring energy to meetings, and somehow make the whole team better. That is personality at work.",
      "Research in industrial-organizational psychology has consistently shown that personality traits, particularly the Big Five dimensions, predict job performance, job satisfaction, and tenure more reliably than most traditional hiring signals. A 2019 meta-analysis across 43 studies found that conscientiousness alone explained more variance in performance than years of experience.",
      "This does not mean resumes are useless. Skills matter. Experience matters. But when two candidates have similar qualifications, it is their personality — how they approach problems, collaborate with others, and respond to stress — that determines who thrives and who struggles.",
      "At Amber, we built our matching around this insight. Instead of filtering people by keywords on a resume, we measure the personality dimensions that actually predict workplace success and satisfaction. Then we connect candidates with companies whose culture genuinely aligns with who they are.",
      "The result is not just better hires. It is happier people, stronger teams, and companies that retain talent because their people actually want to be there.",
    ],
  },
  {
    id: 2,
    title: "The Science Behind Culture Fit",
    category: "Culture & Hiring",
    date: "February 10, 2026",
    readTime: "4 min read",
    excerpt:
      "Culture fit is not about hiring people who look and think like you. It is about aligning values, working styles, and interpersonal tendencies. Research shows it predicts job satisfaction better than skills alone.",
    slug: "science-behind-culture-fit",
    content: [
      "Culture fit has gotten a bad reputation, and for good reason. For too long it was used as shorthand for 'hire people who are like us' — which led to homogenous teams and exclusionary hiring. But the science behind genuine culture alignment is solid, and it is something very different from that.",
      "True culture fit is about values alignment and working style compatibility. Do you prefer structured environments or flexible ones? Do you thrive with direct feedback or need a more supportive approach? Are you energized by collaboration or by deep solo work? These are not right-or-wrong preferences. They are personality-driven tendencies that determine whether a workplace feels like home or like a daily struggle.",
      "A landmark study by Kristof-Brown et al. found that person-organization fit predicted job satisfaction (r = .44), organizational commitment (r = .51), and intent to stay (r = .35) — stronger correlations than most skill-based hiring metrics can claim.",
      "The key insight is that culture fit should increase diversity, not reduce it. When you measure actual personality dimensions and values instead of surface-level similarity, you discover that people from vastly different backgrounds can share working styles. A first-generation college graduate and an MBA might both be high-openness, high-conscientiousness individuals who thrive in fast-paced environments.",
      "At Amber, we measure both sides of the equation. Candidates take our personality assessment, and employers complete a culture quiz that maps their team's values and working preferences. Then our matching algorithm finds genuine alignment — not demographic similarity, but real compatibility in how people work, communicate, and grow.",
    ],
  },
  {
    id: 3,
    title: "What The Big Five Actually Tells You About Work",
    category: "Personality Science",
    date: "January 28, 2026",
    readTime: "7 min read",
    excerpt:
      "The Big Five personality model has been replicated across cultures for over 40 years. It measures five dimensions that genuinely predict how you work, communicate, and collaborate with a team.",
    slug: "big-five-tells-you-about-work",
    content: [
      "The Big Five — also called OCEAN — is the most widely validated personality framework in psychology. It measures five broad dimensions: Openness to Experience, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (which we frame as Emotional Stability). Unlike pop-psychology quizzes, the Big Five has been replicated across cultures, languages, and age groups for over four decades.",
      "Openness to Experience measures your intellectual curiosity, creativity, and comfort with novelty. High-openness individuals tend to excel in roles that demand innovation, adaptability, and creative problem-solving — think product design, strategy, or research. Lower-openness individuals often thrive in roles where mastery of proven methods creates value, like operations or quality assurance.",
      "Conscientiousness is the single strongest personality predictor of job performance across nearly all occupations. It reflects your tendency toward organization, dependability, and goal-directed behavior. High conscientiousness correlates with meeting deadlines, maintaining quality, and following through on commitments.",
      "Extraversion indicates how much you draw energy from social interaction. This is not about being loud or quiet — it is about where your energy comes from. High-extraversion individuals tend to excel in collaborative, client-facing, or leadership roles. Lower-extraversion individuals often produce their best work in focused, independent settings.",
      "Agreeableness measures your tendency toward cooperation, empathy, and consideration for others. High agreeableness predicts success in team-oriented roles, customer service, and people management. Lower agreeableness can be an asset in roles requiring objective analysis, tough negotiations, or critical evaluation.",
      "Emotional Stability reflects your resilience under pressure and consistency of mood. Higher stability correlates with calm decision-making, consistent performance, and the ability to handle criticism constructively. This dimension is particularly predictive for high-stakes roles.",
      "What makes the Big Five powerful for hiring is not that any score is good or bad — it is that different roles and cultures genuinely need different personality profiles. A startup building fast needs a different team composition than a regulated enterprise maintaining critical systems. By measuring these dimensions honestly, we can match people with environments where their natural tendencies become strengths.",
    ],
  },
  {
    id: 4,
    title: "Coffee Chats: A Better Way To Start",
    category: "Career Tips",
    date: "January 20, 2026",
    readTime: "3 min read",
    excerpt:
      "The best hiring conversations happen before anyone has decided anything. Before the formal process, before the pressure. Just two people figuring out if this could be something real.",
    slug: "coffee-chats-better-way-to-start",
    content: [
      "Think about how most hiring works. You apply to a role you found through a job board. You talk to a recruiter. You do a phone screen. Then a technical interview. Then a culture interview. Somewhere in that process, both sides are supposed to figure out if this is actually a good fit. But by that point, everyone is performing.",
      "Coffee chats flip that dynamic. Before any formal process, before anyone has committed to anything, you just have a conversation. No pressure, no interview script, no one trying to impress. Just two people exploring whether there might be mutual interest.",
      "This matters because the best career moves often come from relationships, not applications. When you have a genuine conversation with someone at a company, you learn things no job description can tell you — how the team actually communicates, what the day-to-day really looks like, whether the energy feels right.",
      "At Amber, coffee chats are built into the matching experience. When our algorithm identifies a strong personality-culture match, either side can initiate a coffee chat. It is low-commitment by design. No resume review, no formal interview. Just a 20-minute video call to see if the spark is real.",
      "The feedback we have seen has been remarkable. Candidates tell us they feel more confident going into these conversations because they know the match is based on genuine compatibility. Employers tell us they are meeting candidates they never would have found through traditional channels. And both sides appreciate that the first interaction is human, not transactional.",
    ],
  },
  {
    id: 5,
    title: "Why Startups Need Culture-First Hiring",
    category: "Culture & Hiring",
    date: "January 12, 2026",
    readTime: "4 min read",
    excerpt:
      "In a team of 10 or 15 people, one hire who does not fit can genuinely damage the whole team. Startups live or die by culture fit, and they need better tools than a resume screener.",
    slug: "startups-need-culture-first-hiring",
    content: [
      "In a company of 10,000 people, a single bad hire is a rounding error. The organization absorbs it. But in a startup of 10 or 15, one person who does not fit can shift the entire culture. Meetings feel different. Communication breaks down. The best people start thinking about leaving.",
      "This is why startups need to be especially intentional about culture fit — and why the traditional hiring stack fails them. Resume screeners, keyword matching, and LinkedIn filters cannot tell you whether a candidate will thrive in your specific environment. They tell you where someone went to school and what tools they have used. Not how they handle ambiguity, give feedback, or respond when things break.",
      "The research backs this up. A study by the Society for Human Resource Management found that the cost of a bad hire for a small company can be 50 to 60 percent of that person's annual salary when you factor in recruiting costs, onboarding, lost productivity, and team morale impact. For a startup burning through runway, that is existential.",
      "Culture-first hiring does not mean lowering the bar on skills. It means using personality and values alignment as a primary filter, then evaluating skills within that context. When someone genuinely fits your culture, they learn faster, collaborate better, and stay longer. The skills gap closes. The culture gap rarely does.",
      "At Amber, we built our employer tools specifically with startups in mind. The culture quiz takes 15 minutes and maps your team's actual working preferences — not aspirational values on a wall, but how you really operate. Then our matching finds candidates whose personalities align with those preferences. It is faster, more accurate, and more predictive than any resume screen.",
    ],
  },
  {
    id: 6,
    title: "Networking Without The Network",
    category: "Career Tips",
    date: "January 5, 2026",
    readTime: "6 min read",
    excerpt:
      "Studies suggest 70 to 80 percent of roles are filled through relationships, not applications. But not everyone has the right connections. Here is how personality-driven introductions can level the playing field.",
    slug: "networking-without-the-network",
    content: [
      "The hidden job market is real. Research consistently shows that 70 to 80 percent of roles are filled through personal connections, referrals, and relationships rather than public applications. This is not a conspiracy — it is human nature. People trust people they know.",
      "But here is the problem: access to professional networks is not equally distributed. If you went to a well-connected university, grew up in a major city, or had parents with professional careers, you probably have a network that opens doors. If you did not, you are competing for the 20 to 30 percent of roles that are publicly posted, against everyone else in the same position.",
      "This is one of the biggest structural inequities in hiring, and it is rarely talked about. We celebrate networking as a skill, but it is also a privilege. The question is: what if there were a way to create the benefits of networking — warm introductions, mutual interest, genuine human connection — without requiring an existing network?",
      "That is fundamentally what Amber is building. Our personality matching creates the same dynamic as a warm referral. When our algorithm identifies strong alignment between a candidate and a company, both sides know there is something real behind the introduction. The candidate is not cold-applying into a void. The employer is not sorting through hundreds of unqualified resumes. It is two parties meeting because the data suggests they might genuinely be good for each other.",
      "We have seen this play out in practice. Candidates who would never have connected with certain companies — because they did not have the right LinkedIn connections or alumni network — are getting coffee chats and offers based on genuine personality-culture alignment. The playing field is not perfectly level yet, but it is more level than it was.",
      "The future of hiring should not depend on who you know. It should depend on who you are. That is the world we are building toward.",
    ],
  },
];
