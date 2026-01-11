import { useMemo } from 'react';
import { validatePattern, formatValidationReport } from '@/core/theorems';
import { generatePattern } from '@/core/geometry';
import type { PatternConfig } from '@/types';

interface ValidationPanelProps {
  config: PatternConfig;
}

export function ValidationPanel({ config }: ValidationPanelProps) {
  const validation = useMemo(() => {
    const pattern = generatePattern(config);
    return validatePattern(pattern, config);
  }, [config]);

  return (
    <div className="validation-panel">
      <h3>
        Pattern Validation
        {validation.overall ? ' ✓' : ' ✗'}
      </h3>

      <div className="validation-status">
        <strong>Status:</strong>
        <span className={validation.overall ? 'valid' : 'invalid'}>
          {validation.overall ? 'Valid (Ready to Export)' : 'Invalid (Review Errors)'}
        </span>
      </div>

      {validation.theorems.map((theorem) => (
        <details key={theorem.theoremId} className="theorem-validation">
          <summary className={theorem.valid ? 'valid' : 'invalid'}>
            {theorem.valid ? '✓' : '✗'} {theorem.theoremId}
          </summary>

          <div className="theorem-details">
            {theorem.errors.length > 0 && (
              <div className="errors">
                <strong>Errors:</strong>
                <ul>
                  {theorem.errors.map((err, i) => (
                    <li key={i} className="error">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {theorem.warnings.length > 0 && (
              <div className="warnings">
                <strong>Warnings:</strong>
                <ul>
                  {theorem.warnings.map((warn, i) => (
                    <li key={i} className="warning">
                      {warn}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {theorem.details && Object.keys(theorem.details).length > 0 && (
              <details className="details">
                <summary>Technical Details</summary>
                <pre>{JSON.stringify(theorem.details, null, 2)}</pre>
              </details>
            )}
          </div>
        </details>
      ))}

      <details className="full-report">
        <summary>View Full Report</summary>
        <pre>{formatValidationReport(validation)}</pre>
      </details>
    </div>
  );
}
