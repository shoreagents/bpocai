# Broken Briefs Game Concept

## Objective
Assess a player's ability to interpret, simplify, and clearly communicate messy or ambiguous client instructions into actionable task briefs.

## Skills Assessed
- Communication (written clarity)
- Summarization
- Instructional accuracy

## Game Logic
- Players are presented with a long, confusing set of instructions (e.g., from a fake client email or chat).
- Their task is to rewrite the brief clearly and concisely for a virtual teammate (simulated AI or system).
- The rewritten brief is scored based on clarity, completeness, and accuracy.

## Game Loop
1. Present the player with a scenario (e.g., “client email” with vague or overly detailed instructions).
2. Player rewrites it in a “task brief” field.
3. The system evaluates the brief using:
   - Keyword matching
   - Sentence simplicity
   - Presence of key instructions
4. Points awarded for:
   - Accurate inclusion of key points (+5 each)
   - Removing unnecessary fluff (+2)
   - Logical flow and clarity (+3)
5. Negative points for:
   - Missing critical information (-5)
   - Misinterpreting the task (-10)
   - Using vague language (-3)

## Example Scenario
> **Client Email:**  
> "Hi, I need the thing we talked about the other day—you know, the new promo thing for social media. It should kind of match the old one from July but not be too samey. Maybe also mention the discount, but don’t make it the focus. And if you can get it done quickly that’d be great—like by Friday if possible, but no worries if not. Thanks!"

> **Good Task Brief:**  
> “Design a new social media promo similar in style to the July version, but with a fresh look. Include the discount subtly. Aim to complete by Friday.”

## Possible Implementation
- Web or terminal version with text input and scoring logic
- Option to integrate with simple NLP models or static keyword checkers
- Can be expanded with a leaderboard or multiple difficulty levels
