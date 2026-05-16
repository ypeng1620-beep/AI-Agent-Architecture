# Write Xiaohongshu Skill Optimization Program

## Objective
Streamline write-xiaohongshu skill, reduce redundancy, improve clarity and efficiency.

## Success Metrics
- Clarity: improved specificity in each step
- Conciseness: fewer words for same information (target: 10-15% reduction)
- Completeness: all 5 optimization goals addressed

## Constraints
1. **Fixed time budget**: 3 minutes per experiment
2. **Single file edit**: Only edit SKILL.md
3. **Preserve core workflow**: Research → Write → Review → Publish
4. **Keep 硬性限制**: title ≤20, body ≤1000
5. **Keep 去AI味 prompts**: these are valuable
6. **Log everything**: Record each change

## Experiment Protocol
1. Make ONE targeted change to streamline or clarify write-xiaohongshu
2. Score: is it clearer or more concise without losing important information?
3. If improvement → keep
4. If no clear improvement → discard
5. Repeat until 3 minutes exhausted

## Change Ideas (priority order)
1. Merge step 0 login check into step 1 header (implicit: if not logged in, step 1 fails)
2. Move title-length check to step 1 end (after finding posts, check title format early)
3. Add "fast mode" note before step 3: if topic is common knowledge, skip to step 4
4. Consolidate 配图 rules into a single note in step 5 (currently mentions 9:16 in multiple places)
5. Simplify step 6 review: reduce template, make it a 3-choice decision (confirm/modify/cancel)
6. Trim redundant phrases in the introduction (Quick Start is good but a bit long)
7. Remove the duplicate "examples" section end markers
