import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react'; // Import the trash icon
import placeholder from "@/assets/pictures.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Product } from '../data/schema';

// Add a type for the onDelete handler
interface DataTableProps {
  data: Product[];
  columns: ColumnDef<Product>[];
  onDeleteProduct?: (productId: string) => void; // New prop for delete handler
}

export function DataTable({ data, columns, onDeleteProduct }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  
  // Create a function to handle delete button clicks
  const handleDelete = (productId: string) => {
    if (onDeleteProduct) {
      // Consider adding a confirmation dialog here
      if (window.confirm("Are you sure you want to delete this product?")) {
        onDeleteProduct(productId);
      }
    }
  };
 
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="overflow-hidden border rounded-lg shadow-sm">
      <Table className="w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-100 border-b">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-4 py-2 font-semibold text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
              {/* Add an extra header for the actions column */}
              <TableHead className="px-4 py-2 font-semibold text-left">Actions</TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-b hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-2">
                    {cell.column.id === 'thumbnail' ? (
                      // Show thumbnail from product data or fallback to placeholder
                      <img
                        src={row.original.thumbnail || placeholder}
                        alt={`thumbnail`}
                        className="object-cover w-10 h-10 rounded"
                      />
                    ) : cell.column.id === 'title' ? (
                      <Link
                        to={`/products/${row.original.id}` as any}
                        className="text-blue-900 hover:underline"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Link>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
                {/* Add the delete button cell */}
                <TableCell className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(row.original.id)}
                    className="p-2 text-red-500 transition-colors rounded-full hover:bg-red-50"
                    title="Delete product"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="px-4 py-3 text-center text-gray-500">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}