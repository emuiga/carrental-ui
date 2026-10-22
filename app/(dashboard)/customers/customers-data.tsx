import { serverFetcher } from "@/lib/server-fetcher";
import type { Customer } from "@/lib/queries/customers";
import { CustomersTable } from "@/components/customers/customers-table";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export async function CustomersData({ search }: { search: string }) {
  const customers = await serverFetcher<Customer[]>("/customers", search ? { search } : undefined);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <CustomersTable customers={customers} search={search} />
      </Table>
    </div>
  );
}
