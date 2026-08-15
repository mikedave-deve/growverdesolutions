import React from "react";

// Renders as a real table on md+ screens and stacked cards on mobile,
// per the responsive requirement — no separate mobile component needed.
export function DataTable({ columns, rows, keyField = "id" }) {
  return (
    <div>
      <table className="w-full text-sm hidden md:table">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 border-b border-sand-200">
            {columns.map((col) => (
              <th key={col.key} className="py-2.5 pr-4 font-medium">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} className="border-b border-sand-100 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="py-3 pr-4 align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row[keyField]} className="border border-sand-200 rounded-xl p-4 space-y-2 overflow-hidden">
            {columns.map((col) => (
              <div key={col.key} className="flex items-start justify-between text-sm gap-4">
                {col.header && (
                  <span className="text-ink-700/50 text-xs uppercase tracking-wide shrink-0 pt-0.5">{col.header}</span>
                )}
                <span className="text-right min-w-0 flex-1 break-words">{col.render ? col.render(row) : row[col.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
