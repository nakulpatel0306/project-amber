# usage guide

how to use luna culturesync for culture assessment and candidate matching.

## for candidates

### taking the assessment

1. **start culturesync** - run backend and frontend (see [setup guide](SETUP.md))
2. **click "take the assessment"** on the welcome screen
3. **enter your details** - name and email
4. **answer 10 questions** - choose the option that best describes you
5. **view your results** - see your culture fit score and traits

### assessment flow

```
welcome → info form → questions 1-5 → halfway pause → questions 6-10 → results
```

### question types

all questions are multiple choice with 4 options (a, b, c, d). there are no right or wrong answers - just pick what feels most natural to you.

**categories:**

| category | what it measures |
|----------|------------------|
| work style | how you prefer to work (structured vs flexible, solo vs collaborative) |
| communication | how you communicate and receive feedback |
| values | what matters most to you in a workplace |

### understanding your results

after completing all 10 questions, you'll see:

- **culture fit score** (0-100) - overall compatibility score
- **dimension scores** - breakdown by work style, communication, and values
- **top traits** - your 3 strongest characteristics

**score interpretation:**

| score | meaning |
|-------|---------|
| 80+ | strong culture alignment |
| 60-79 | good culture fit |
| 40-59 | moderate fit |
| below 40 | potential misalignment |

### example traits

- **collaborative** - thrives in team environments
- **autonomous** - prefers independent work
- **structured** - likes clear processes and plans
- **adaptable** - comfortable with change
- **growth-oriented** - prioritizes learning
- **direct communicator** - values clear, honest feedback

## for employers / recruiters

### viewing candidates

1. click the **dashboard** icon in the sidebar (users icon)
2. view all candidates who have completed assessments
3. use filters to narrow results

### dashboard features

**search:**
- search by name or email
- instant filtering as you type

**sort:**
- by culture fit score (highest first)
- by name (alphabetically)

**filter:**
- show only completed assessments
- filter by minimum score (via api)

### candidate cards

each candidate card shows:
- name and email
- culture fit score with color coding
- top traits as tags
- "coffee chat" button

### scheduling coffee chats

click the "coffee chat" button on any candidate card:

1. opens your default email client
2. pre-filled subject line
3. pre-filled email body with introduction
4. just add your availability and send

**email template:**

```
Subject: Coffee Chat - [Candidate Name]

Hi [Candidate Name],

I'd love to schedule a coffee chat to learn more about your
background and interests.

Would you be available sometime this week?

Best regards
```

## submitting feedback

### using the feedback widget

1. click the **message bubble** in the bottom-right corner
2. write your feedback in the text area
3. click "submit"
4. see confirmation when submitted

### what to share

- bugs or issues you encounter
- feature suggestions
- ui/ux improvements
- general thoughts on the assessment

## themes

### changing themes

1. click the **settings** icon in the sidebar (gear icon)
2. select the "theme" tab
3. click on any theme to apply it instantly

### available themes

| theme | style |
|-------|-------|
| minimal light | clean white background |
| minimal dark | dark mode |
| lavender | soft purple tones |
| rose | warm pink accents |
| mint | fresh green palette |
| mocha | warm brown tones |
| ocean | blue color scheme |
| sunset | orange/coral accents |

## keyboard shortcuts

| shortcut | action |
|----------|--------|
| `enter` | submit answer / confirm |
| `⌘ + ,` | toggle settings panel |
| `esc` | close settings panel |

## tips

### for candidates

**be honest:**
- answer based on your actual preferences
- don't try to guess what employers want
- authentic answers lead to better matches

**take your time:**
- there's no time limit
- read each question carefully
- consider all options before choosing

### for employers

**look beyond the score:**
- high scores indicate potential alignment
- read the traits for more context
- use scores as a starting point, not final verdict

**schedule chats:**
- coffee chats reveal more than scores
- discuss values and work style in person
- look for mutual fit

## faq

### can i retake the assessment?

currently, each email can only take the assessment once. use a different email if you need to retake.

### how is the score calculated?

the score is calculated from your answers across three dimensions:
- work style (33%)
- communication (33%)
- values (34%)

each answer has a profile that contributes to these dimensions.

### is my data saved?

yes, your responses are saved in a local sqlite database. the database is stored on your machine - no data is sent to external servers.

### can employers see my individual answers?

employers see:
- your name and email
- culture fit score
- dimension scores
- top traits

they do not see your individual answers to each question.

### how do traits get assigned?

traits are identified based on patterns in your answers. the top 3 strongest traits are displayed on your results.
