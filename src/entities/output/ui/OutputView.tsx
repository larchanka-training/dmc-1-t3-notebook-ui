import type { OutputItem } from "../model/types";

type OutputViewProps = {
  blockId: string;
  outputs?: OutputItem[];
};

function formatObjectPayload(payload: unknown) {
  return JSON.stringify(payload, null, 2);
}

export function OutputView({ blockId, outputs }: OutputViewProps) {
  return (
    <section
      className="border-t border-border-token bg-editor px-token-16 py-token-12"
      aria-label={`Output area for ${blockId}`}
    >
      <span className="text-xs font-semibold text-ink-muted">Output</span>
      {outputs === undefined ? (
        <p className="mt-1 text-sm text-ink">
          No runtime output yet for the latest run.
        </p>
      ) : outputs.length === 0 ? (
        <p className="mt-1 text-sm text-ink">
          Execution started. Waiting for runtime outputs.
        </p>
      ) : (
        <div className="mt-2 space-y-3">
          {outputs.map((output, index) => (
            <div
              key={`${blockId}-${output.type}-${index}`}
              className="rounded-md border border-border-token/70 bg-surface px-3 py-2"
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                {output.type}
              </p>
              {output.type === "text" ? (
                <p className="mt-1 text-sm text-ink whitespace-pre-wrap">
                  {output.payload}
                </p>
              ) : null}
              {output.type === "object" ? (
                <pre className="mt-1 overflow-x-auto text-xs text-ink whitespace-pre-wrap">
                  {formatObjectPayload(output.payload)}
                </pre>
              ) : null}
              {output.type === "table" ? (
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-xs text-ink">
                    <thead>
                      <tr>
                        {output.payload.columns.map((column) => (
                          <th
                            key={column}
                            className="border-b border-border-token px-2 py-1 font-semibold text-ink-muted"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {output.payload.rows.map((row, rowIndex) => (
                        <tr key={`${blockId}-row-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={`${blockId}-row-${rowIndex}-cell-${cellIndex}`}
                              className="border-b border-border-token/60 px-2 py-1 align-top"
                            >
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {output.type === "chart" ? (
                <p className="mt-1 text-sm text-ink">
                  Chart-like output received for the latest run.
                </p>
              ) : null}
              {output.type === "error" ? (
                <div className="mt-1 text-sm text-[var(--color-danger-600)]">
                  <p>{output.payload.message}</p>
                  {output.payload.stack ? (
                    <pre className="mt-2 overflow-x-auto text-xs whitespace-pre-wrap text-[var(--color-danger-700)]">
                      {output.payload.stack}
                    </pre>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
