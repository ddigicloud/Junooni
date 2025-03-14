export const columns = [
  {
    header: 'Order ID',
    accessorKey: 'id',
    cell: ({ getValue }: { getValue: () => any }) => (
      <span className="text-blue-600 underline">#{getValue()}</span>
    ),
  },
  {
    header: 'Customer',
    accessorKey: 'customerName',
  },
  {
    header: 'Total',
    accessorKey: 'totalAmount', // Updated to match your orders data
    cell: ({ getValue }: { getValue: () => any }) => {
      const rawValue = getValue();
      const numericValue = Number(rawValue);
      if (Number.isNaN(numericValue)) {
        return '$0.00';
      }
      return `$${numericValue.toFixed(2)}`;
    },
  },
  {
    header: 'Items Count',
    accessorKey: 'items',
    cell: ({ getValue }: { getValue: () => any }) => {
      const items = getValue();
      return Array.isArray(items) ? items.length : 0;
    },
  },
  {
    header: 'Payment Status',
    accessorKey: 'paymentStatus',
  },
  {
    header: 'Delivery Status',
    accessorKey: 'deliveryStatus',
  },
  {
    header: 'Date & Time',
    accessorKey: 'createdAt',
    cell: ({ getValue }: { getValue: () => string | undefined }) => {
      const rawValue = getValue();
      if (!rawValue) {
        return 'N/A';
      }
      return new Date(rawValue).toLocaleString();
    },
  },
];
