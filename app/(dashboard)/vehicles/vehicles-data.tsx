import { serverFetcher } from "@/lib/server-fetcher";
import type { Vehicle } from "@/lib/queries/vehicles";
import { VehiclesTable } from "@/components/vehicles/vehicles-table";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export async function VehiclesData({ search }: { search: string }) {
  const vehicles = await serverFetcher<Vehicle[]>("/vehicles", search ? { search } : undefined);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Vehicle</TableHead>
            <TableHead>Plate</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <VehiclesTable vehicles={vehicles} search={search} />
      </Table>
    </div>
  );
}
