# Task Juggler Game Concept

## Objective
Simulate a multitasking environment where players must manage time-sensitive tasks, prioritize effectively, and maintain accuracy under pressure.

## Skills Assessed
- Time Management
- Attention to Detail
- Work Ethic

## Game Logic
- The player is presented with a series of tasks in real time.
- Each task has:
  - A **priority level** (High, Medium, Low)
  - A **time limit** to complete
  - A **point value**
- The player must decide:
  - Which task to tackle first
  - Whether to skip, delay, or complete it
- Incorrect prioritization or missed deadlines reduce the score.

## Game Loop
1. Display task queue (randomized every round).
2. Start countdown for each task (parallel timers).
3. Allow player to "accept" or "snooze" tasks.
4. Apply scoring:
   - Completed on time → Full points
   - Completed late → Half points
   - Missed task → Minus points
   - Low-priority task done over high-priority → Penalty
5. End game after a set number of rounds or fixed duration.

## Possible Implementation
- Use basic HTML/CSS/JS with a timer and button UI
- Python terminal version using text prompts and `time.sleep()` delays
