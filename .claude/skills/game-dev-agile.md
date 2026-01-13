# Game Development Agile Process

This skill defines the agile development process for game development in the rank-factory project, specifically for Iron Paw Survival and future games.

## Core Principles

### 1. Task-Based Communication
- All communication with the user is based on Linear tasks
- Reference tasks by ID (e.g., "Working on RAN-23")
- Update task status in real-time
- Use Linear issues as the source of truth

### 2. Agile Development Cycle

```
Design → Develop → Test → Analyze → Redesign → Redevelop → Retest
```

**Detailed Process:**
1. **Design** - Create detailed Linear issue with requirements
2. **Develop** - Implement code changes
3. **Test** - Run Playwright automated tests
4. **Analyze** - Review test results and identify issues
5. **Redesign** - Update Linear issue based on findings
6. **Redevelop** - Improve implementation
7. **Retest** - Verify fixes with Playwright

### 3. Linear Task Management

**Task States:**
- **Todo** - Not started
- **In Progress** - Currently working (only ONE task at a time)
- **Done** - Completed and tested

**Task Workflow:**
1. Move task to "In Progress" BEFORE starting work
2. Update TodoWrite with current task status
3. Complete task fully before moving to next
4. Move to "Done" only after Playwright tests pass
5. Add comments to Linear issue with progress updates

### 4. Playwright Testing Strategy

**CRITICAL: Code-First Verification**
- **ALWAYS verify code-level implementation BEFORE running Playwright tests**
- Read the actual source code to understand what was implemented
- Many issues can be verified by reading code (e.g., button placement, prop passing, logic flow)
- Only use Playwright for things that CANNOT be verified from code:
  - Visual rendering issues
  - Runtime behavior
  - User interaction flows
  - Performance problems
  - Browser-specific issues

**Example - Code Verification First:**
```
❌ BAD: Run Playwright to check if button is centered
✅ GOOD: Read component code to see className/CSS, THEN test if needed

❌ BAD: Screenshot to verify prop is passed correctly
✅ GOOD: Read parent/child components to verify prop flow

❌ BAD: Test to see if function is called
✅ GOOD: Read event handler code to verify function call
```

**When to Test:**
- After each significant change (but verify code first!)
- Before marking task as "Done"
- When user requests verification
- During redesign phase to identify issues
- For issues that CANNOT be verified from code alone

**Test Coverage:**
- Visual rendering (after code verification)
- Gameplay mechanics (runtime behavior)
- UI/UX interactions (user flow)
- Performance issues
- Bug detection (runtime-specific)

**Test Location:**
- Tests run in `/home/nschae/rank-factory` (NOT /tmp)
- Use local dev server: `http://localhost:5173`
- Save screenshots to `.playwright/screenshots/`

### 5. Asset Management Rules

**When assets are needed:**

**Option 1: SVG + CSS (Preferred for simple assets)**
- Create inline SVG for icons, buttons, effects
- Use CSS for animations and styles
- Embed directly in component files

**Option 2: Use Existing Assets**
- Check `/client/public/games/ironPaw/` for available images
- Temporarily substitute similar assets
- Document what needs to be replaced

**Option 3: Request from User**
- For complex assets that can't be created with SVG/CSS
- Provide clear specifications (size, format, purpose)
- Continue with placeholder until provided

**Current Available Assets (Iron Paw Survival):**
- `mainplayer.png` - 2x2 sprite sheet (4 frames)
- `enemy1.png`, `enemy2.png`, `enemy3.png` - Enemy sprites
- `tilemap.png` - Background tiles
- `profile.png` - Profile/avatar image
- `bluecristal.png`, `redcristal.png` - Collectibles
- `at-bone.png`, `at-ironpaw.png`, `at-lightning.png` - Weapon sprites
- `at-milk.png`, `at-ora.png`, `at-rabit.png` - Weapon effects

### 6. Game-Specific: Iron Paw Survival

**Worldview & Theme:**
- **Protagonist:** A cat who is afraid of mice
- **Story:** Overcoming fear by fighting and growing stronger
- **Theme:** Cat vs Mice survival horror comedy
- **Style:** Vampire Survivors-inspired, but unique identity

**Design Guidelines:**
- Benchmark Vampire Survivors mechanics
- DO NOT copy naming, visual design, or branding
- Create original cat/mice-themed names
- Maintain unique worldview and atmosphere

**Sprite Usage:**
- `mainplayer.png` layout:
  ```
  [Top-Left]    [Top-Right]
  [Bottom-Left] [Bottom-Right]
  ```
- Top-Left: Default sprite (flip for left/right)
- Bottom-Left: Looking up (flip for left/right)
- Other frames: Reserved for future animations

### 7. Development Workflow

**Starting a New Task:**
```
1. Read Linear issue details
2. Update TodoWrite (move to "in_progress")
3. Update Linear issue status to "In Progress"
4. Announce to user: "Starting RAN-X: [Task Name]"
```

**During Development:**
```
1. Make incremental changes
2. Test locally if possible
3. Update Linear with progress comments
4. Ask user questions if requirements unclear
```

**Completing a Task:**
```
1. Run Playwright tests
2. Capture screenshots
3. Verify all requirements met
4. Update Linear issue with test results
5. Move to "Done" status
6. Update TodoWrite (mark "completed")
7. Announce to user: "Completed RAN-X: [Summary]"
```

**If Issues Found:**
```
1. Document issues in Linear comment
2. Create follow-up tasks if needed
3. Restart cycle: Redesign → Redevelop → Retest
```

### 8. Code Quality Standards

**For Game Code:**
- Maintain 60 FPS performance
- Clean separation of game logic and rendering
- Efficient collision detection
- Proper resource cleanup
- Commented game mechanics

**For React Components:**
- Follow existing project patterns
- Use TypeScript types
- Maintain responsiveness
- Handle edge cases

### 9. Communication Format

**Status Updates:**
```
📋 Working on: RAN-23
🎯 Goal: Fix player sprite direction handling
⏰ Status: In Progress
```

**Completion Reports:**
```
✅ Completed: RAN-23
📝 Changes:
  - Updated sprite rendering logic
  - Added directional flip support
  - Fixed animation frames
🧪 Tests: Passed (see screenshots)
📸 Screenshot: .playwright/screenshots/ran-23-result.png
```

**Issue Discoveries:**
```
🐛 Found Issue in RAN-23:
  - Problem: Sprite flips incorrectly when moving up
  - Impact: Visual glitch
  - Next Step: Create RAN-XX to address
```

### 10. Automation Goals

**Automate Everything Possible:**
- Linear issue creation/updates
- Playwright test execution
- Screenshot capture and comparison
- Performance profiling
- Asset optimization
- Build and deployment

**Manual Steps Only When:**
- User input required
- Creative decisions needed
- Complex asset creation
- Playtesting for feel/balance

## Quick Reference

### Starting Work
1. Update TodoWrite → "in_progress"
2. Update Linear → "In Progress"
3. Announce task start

### During Work
1. Code incrementally
2. Test frequently
3. Comment in Linear

### Finishing Work
1. Run Playwright tests
2. Verify requirements
3. Update Linear → "Done"
4. Update TodoWrite → "completed"
5. Announce completion

### Found Issues
1. Document in Linear
2. Create follow-up task
3. Continue or pivot

---

**Remember:** This is an iterative process. Perfection comes through cycles, not single attempts. Test early, test often, and always communicate progress through Linear tasks.
