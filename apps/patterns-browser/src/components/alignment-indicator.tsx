/**
 * Alignment Indicator Component
 *
 * Displays translation role alignment scores with color-coded visual feedback.
 * Green (>= 85%): Good alignment
 * Yellow (>= 60%): Partial alignment
 * Red (< 60%): Poor alignment
 */

interface AlignmentIndicatorProps {
  score: number | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get color class based on alignment score.
 */
function getAlignmentClass(score: number): string {
  if (score >= 0.85) return 'alignment-good';
  if (score >= 0.6) return 'alignment-partial';
  return 'alignment-poor';
}

/**
 * Get label text based on alignment score.
 */
function getAlignmentLabel(score: number): string {
  if (score >= 0.85) return 'Aligned';
  if (score >= 0.6) return 'Partial';
  return 'Low';
}

/**
 * Single alignment score indicator.
 */
export function AlignmentIndicator({
  score,
  showLabel = true,
  size = 'md',
}: AlignmentIndicatorProps) {
  if (score === null || score === undefined) {
    return (
      <span class="alignment-indicator alignment-unknown" title="Alignment not calculated">
        <span class="alignment-bar" style="width: 0%"></span>
        {showLabel && <span class="alignment-label">—</span>}
      </span>
    );
  }

  const percentage = Math.round(score * 100);
  const colorClass = getAlignmentClass(score);
  const label = getAlignmentLabel(score);
  const sizeClass = size === 'sm' ? 'alignment-sm' : size === 'lg' ? 'alignment-lg' : '';

  return (
    <span
      class={`alignment-indicator ${colorClass} ${sizeClass}`}
      title={`${percentage}% semantic role alignment with English pattern`}
    >
      <span class="alignment-bar" style={`width: ${percentage}%`}></span>
      <span class="alignment-value">{percentage}%</span>
      {showLabel && <span class="alignment-label">{label}</span>}
    </span>
  );
}

/**
 * Compact alignment badge (just percentage).
 */
export function AlignmentBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <chip class="muted">—</chip>;
  }

  const percentage = Math.round(score * 100);
  const colorClass = getAlignmentClass(score);

  return (
    <span class={`chip alignment-badge ${colorClass}`} title={`${percentage}% role alignment`}>
      {percentage}%
    </span>
  );
}

/**
 * Alignment progress bar with breakdown.
 */
export function AlignmentProgress({
  score,
  matchedRoles,
  missingRoles,
  extraRoles,
}: {
  score: number | null;
  matchedRoles?: string[];
  missingRoles?: string[];
  extraRoles?: string[];
}) {
  if (score === null || score === undefined) {
    return (
      <div class="alignment-progress">
        <div class="alignment-progress-bar">
          <div class="alignment-progress-fill alignment-unknown" style="width: 0%"></div>
        </div>
        <p class="alignment-status muted">Alignment not calculated</p>
      </div>
    );
  }

  const percentage = Math.round(score * 100);
  const colorClass = getAlignmentClass(score);

  return (
    <div class="alignment-progress">
      <div class="alignment-progress-header">
        <span class="alignment-progress-title">Role Alignment</span>
        <span class={`alignment-progress-value ${colorClass}`}>{percentage}%</span>
      </div>
      <div class="alignment-progress-bar">
        <div
          class={`alignment-progress-fill ${colorClass}`}
          style={`width: ${percentage}%`}
        ></div>
      </div>
      {(matchedRoles || missingRoles || extraRoles) && (
        <div class="alignment-breakdown">
          {matchedRoles && matchedRoles.length > 0 && (
            <div class="alignment-matched">
              <span class="breakdown-label">Matched:</span>
              <span class="breakdown-roles">{matchedRoles.join(', ')}</span>
            </div>
          )}
          {missingRoles && missingRoles.length > 0 && (
            <div class="alignment-missing">
              <span class="breakdown-label">Missing:</span>
              <span class="breakdown-roles">{missingRoles.join(', ')}</span>
            </div>
          )}
          {extraRoles && extraRoles.length > 0 && (
            <div class="alignment-extra">
              <span class="breakdown-label">Extra:</span>
              <span class="breakdown-roles">{extraRoles.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Summary stats for alignment across translations.
 */
export function AlignmentSummary({
  translations,
}: {
  translations: Array<{ language: string; alignmentScore: number | null }>;
}) {
  const withScores = translations.filter(t => t.alignmentScore !== null);
  if (withScores.length === 0) {
    return <p class="muted">No alignment scores available</p>;
  }

  const avgScore =
    withScores.reduce((sum, t) => sum + (t.alignmentScore || 0), 0) / withScores.length;
  const goodCount = withScores.filter(t => (t.alignmentScore || 0) >= 0.85).length;
  const partialCount = withScores.filter(
    t => (t.alignmentScore || 0) >= 0.6 && (t.alignmentScore || 0) < 0.85
  ).length;
  const poorCount = withScores.filter(t => (t.alignmentScore || 0) < 0.6).length;

  return (
    <div class="alignment-summary">
      <div class="alignment-summary-avg">
        <span class="summary-label">Average Alignment</span>
        <AlignmentIndicator score={avgScore} size="lg" />
      </div>
      <div class="alignment-summary-breakdown">
        <span class="summary-stat alignment-good">{goodCount} good</span>
        <span class="summary-stat alignment-partial">{partialCount} partial</span>
        <span class="summary-stat alignment-poor">{poorCount} low</span>
      </div>
    </div>
  );
}
