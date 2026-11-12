import type { Issue, IssueSeverity } from './core/types';
import type { Translate, TranslationKey } from './i18n';

function formatValue(issue: Issue): string | number {
  switch (issue.code) {
    case 'highCps':
    case 'criticalCps':
      return issue.value.toFixed(1);
    case 'shortDuration':
    case 'longDuration':
    case 'overlap':
    case 'longLine':
    case 'manyLines':
      return Math.round(issue.value);
    default:
      return issue.value;
  }
}

export function issueMessage(issue: Issue, t: Translate): string {
  const key = `issues.${issue.code}` as TranslationKey;
  return t(key, { value: formatValue(issue) });
}

export function severityLabel(severity: IssueSeverity, t: Translate): string {
  return t(`issues.severity.${severity}` as TranslationKey);
}

export function highestSeverity(issues: Issue[]): IssueSeverity | null {
  if (issues.some((issue) => issue.severity === 'error')) return 'error';
  if (issues.some((issue) => issue.severity === 'warning')) return 'warning';
  if (issues.length > 0) return 'info';
  return null;
}
