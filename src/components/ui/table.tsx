import { cn } from "@/lib/utils";

export function DataTable({
  columns,
  children,
  className,
}: {
  columns: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const cls =
    "border-b border-border/80 transition-colors hover:bg-surface-2/80";
  if (href) {
    return (
      <tr className={cls}>
        <td colSpan={100} className="p-0">
          <a href={href} className="grid grid-cols-subgrid">
            {children}
          </a>
        </td>
      </tr>
    );
  }
  return (
    <tr className={cn(cls, onClick && "cursor-pointer")} onClick={onClick}>
      {children}
    </tr>
  );
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
