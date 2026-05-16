# Write Xiaohongshu Skill Optimization Target

## Current State
- Skill: write-xiaohongshu (installed at ~/.agents/skills/write-xiaohongshu)
- Focus: Make the skill more concise, reduce redundant steps, improve clarity

## Optimization Goals
1. **Step 0-1 redundancy**: Steps 0 and 1 have overlap (login check vs post search). Streamline so login state is implicit before post search.
2. **字数闸口前移**: Currently the character count check is only in step 4. Move the title-length check earlier to avoid wasted effort on oversized titles.
3. **Firecrawl fallback**: The Firecrawl step (step 3) is valuable but slow. Add a "fast mode" that skips it if the topic is well-known enough.
4. **配图 guidance**: The "9:16优先" rule is good but scattered. Consolidate image guidance into one place.
5. **Review 步骤简化**: Step 6 review flow is verbose. Simplify to: show preview → user says confirm/modify/cancel → done. No need for full template every time.

## Target Metrics
- Clarity: 0 = verbose/confusing, 1 = clear and actionable
- Conciseness: skill length reduction (fewer words for same info)
- Completeness: all 5 optimization goals addressed

## Constraints
- Do not change the fundamental research→write→publish workflow
- Keep the 硬性限制 (title ≤20, body ≤1000)
- Preserve the "去AI味" prompts in step 4
- Keep step 6 user review before publish (important safety gate)
