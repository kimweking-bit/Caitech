import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function DataTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto border border-line", className)}>
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className="border-b border-line bg-surface">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-ink-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-3 py-3 align-top text-ink", className)}>{children}</td>
  );
}
