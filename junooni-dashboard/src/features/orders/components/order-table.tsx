import React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface Column {
  header: string;
  accessorKey: string;
  cell?: (info: { getValue: () => any }) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const navigate = useNavigate();

  const handleRowClick = (rowData: any) => {
    // Navigate to /orders/:id with rowData as state
    navigate({ to: `/orders/${rowData.id}`, state: rowData });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.accessorKey}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            onClick={() => handleRowClick(row)}
            className="cursor-pointer"
          >
            {columns.map((col) => (
              <TableCell key={col.accessorKey}>
                {col.cell
                  ? col.cell({ getValue: () => row[col.accessorKey] })
                  : row[col.accessorKey]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};