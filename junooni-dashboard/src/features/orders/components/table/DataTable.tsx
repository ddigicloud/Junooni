// components/table/DataTable.tsx
// import React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef
} from "@tanstack/react-table"

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  initialState?: any
}

export function DataTable<TData>({ data, columns, initialState }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState
  })

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id} className="px-4 py-2 text-sm font-medium text-left text-gray-500">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} className="px-4 py-2 text-sm text-gray-700">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
