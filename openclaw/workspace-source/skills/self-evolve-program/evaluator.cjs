/**
 * self-evolve-program evaluator
 * Scores experiment results based on defined metrics
 * 
 * Usage: node evaluator.js --baseline=<file> --candidate=<file> --metric=<name>
 * 
 * Metrics supported:
 * - accuracy: higher is better
 * - loss: lower is better
 * - latency: lower is better
 * - combined: weighted score
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value;
  return acc;
}, {});

const BASELINE_FILE = args.baseline;
const CANDIDATE_FILE = args.candidate;
const METRIC = args.metric || 'combined';

function loadResult(file) {
  if (!file) return null;
  try {
    const content = fs.readFileSync(file, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    try {
      // Maybe it's raw content
      return { content: fs.readFileSync(file, 'utf-8'), raw: true };
    } catch (e2) {
      return null;
    }
  }
}

function scoreAccuracy(result) {
  // For stock analysis: win rate
  if (result.winRate !== undefined) {
    return result.winRate;
  }
  // For general: check if predictions match outcomes
  if (result.predictions && result.outcomes) {
    const correct = result.predictions.filter((p, i) => p === result.outcomes[i]).length;
    return correct / result.outcomes.length;
  }
  return null;
}

function scoreLoss(result) {
  // For ML: validation bits per byte (autoresearch style)
  if (result.valBpb !== undefined) {
    return result.valBpb;
  }
  // For general: mean squared error
  if (result.predictions && result.outcomes) {
    const errors = result.predictions.map((p, i) => (p - result.outcomes[i]) ** 2);
    return errors.reduce((a, b) => a + b, 0) / errors.length;
  }
  return null;
}

function scoreLatency(result) {
  if (result.latencyMs !== undefined) {
    return result.latencyMs;
  }
  if (result.durationMs !== undefined) {
    return result.durationMs;
  }
  return null;
}

function evaluate(baseline, candidate, metric) {
  const scores = {};
  
  // Try to extract scores from both results
  const baselineAcc = scoreAccuracy(baseline);
  const candidateAcc = scoreAccuracy(candidate);
  
  const baselineLoss = scoreLoss(baseline);
  const candidateLoss = scoreLoss(candidate);
  
  const baselineLat = scoreLatency(baseline);
  const candidateLat = scoreLatency(candidate);
  
  if (baselineAcc !== null && candidateAcc !== null) {
    scores.accuracy = { baseline: baselineAcc, candidate: candidateAcc, improved: candidateAcc > baselineAcc };
  }
  
  if (baselineLoss !== null && candidateLoss !== null) {
    scores.loss = { baseline: baselineLoss, candidate: candidateLoss, improved: candidateLoss < baselineLoss };
  }
  
  if (baselineLat !== null && candidateLat !== null) {
    scores.latency = { baseline: baselineLat, candidate: candidateLat, improved: candidateLat < baselineLat };
  }
  
  // Combined score (if multiple metrics available)
  let combinedImproved = false;
  let combinedScore = 0;
  let metricCount = 0;
  
  if (scores.accuracy) {
    combinedScore += scores.accuracy.improved ? 1 : 0;
    metricCount++;
  }
  if (scores.loss) {
    combinedScore += scores.loss.improved ? 1 : 0;
    metricCount++;
  }
  if (scores.latency) {
    combinedScore += scores.latency.improved ? 1 : 0;
    metricCount++;
  }
  
  combinedImproved = metricCount > 0 && combinedScore === metricCount;
  
  return {
    scores,
    combined: {
      score: combinedScore / metricCount,
      improved: combinedImproved,
      details: `${combinedScore}/${metricCount} metrics improved`
    }
  };
}

function main() {
  console.log('📊 self-evolve-program evaluator');
  console.log(`   Metric: ${METRIC}`);
  console.log(`   Baseline: ${BASELINE_FILE || 'none'}`);
  console.log(`   Candidate: ${CANDIDATE_FILE || 'none'}`);
  console.log('');
  
  const baseline = loadResult(BASELINE_FILE);
  const candidate = loadResult(CANDIDATE_FILE);
  
  if (!candidate) {
    console.log('❌ No candidate result to evaluate');
    process.exit(1);
  }
  
  const result = evaluate(baseline || {}, candidate, METRIC);
  
  // Print results
  if (result.scores.accuracy) {
    const { baseline: b, candidate: c, improved } = result.scores.accuracy;
    console.log(`📈 Accuracy: ${(b * 100).toFixed(1)}% → ${(c * 100).toFixed(1)}% ${improved ? '✅' : '❌'}`);
  }
  
  if (result.scores.loss) {
    const { baseline: b, candidate: c, improved } = result.scores.loss;
    console.log(`📉 Loss: ${b.toFixed(4)} → ${c.toFixed(4)} ${improved ? '✅' : '❌'}`);
  }
  
  if (result.scores.latency) {
    const { baseline: b, candidate: c, improved } = result.scores.latency;
    console.log(`⏱️  Latency: ${b}ms → ${c}ms ${improved ? '✅' : '❌'}`);
  }
  
  console.log('');
  console.log(`🎯 Combined: ${result.combined.details}`);
  
  // Output JSON for programmatic use
  if (process.env.OUTPUT_JSON) {
    console.log('\n--- JSON OUTPUT ---');
    console.log(JSON.stringify(result, null, 2));
  }
  
  // Exit code: 0 if improved, 1 if not
  process.exit(result.combined.improved ? 0 : 1);
}

// Guard: only run main() when executed directly as a script, not when imported as a module
if (require.main === module || process.argv[1] && process.argv[1].includes('evaluator')) {
  main();
}

module.exports = { evaluate, loadResult, scoreAccuracy, scoreLoss, scoreLatency };
