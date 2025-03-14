
import { ColumnDef } from '@tanstack/react-table';
import { Product } from '../data/schema';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'thumbnail',
    header: 'Image',
    cell: ({ getValue }) => {
      const imageUrl = getValue() as string;
      
      return imageUrl ? (
        `<img src=${imageUrl} alt="Product thumbnail" width="50" height="50" />`
      ) : (
        'No image'
      );
    },
  },

  {
    accessorKey: 'title',
    header: 'Product Name',
  },

  {
    accessorKey: 'status',
    header: 'Status',
  },

  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ getValue }) => {
      const rawDate = getValue() as string;
      const formattedDate = new Date(rawDate).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      return formattedDate;
    },
  }
];