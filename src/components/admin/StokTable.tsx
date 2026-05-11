interface StokRow {
  id: string;
  name: string;
  sku: string;
  stok: number;
  min: number;
  satuan: string;
  expired: string;
}

interface Props {
  data: StokRow[];
  badgeClass: string;
  badgeLabel: string;
}

export function StokTable({ data, badgeClass, badgeLabel }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {["SKU", "Nama Produk", "Stok", "Min. Stok", "Expired", "Status"].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((p) => (
            <tr key={p.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3 font-semibold">
                {p.stok} <span className="text-xs font-normal text-muted-foreground">{p.satuan}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.min}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.expired}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                  {badgeLabel}
                </span>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
