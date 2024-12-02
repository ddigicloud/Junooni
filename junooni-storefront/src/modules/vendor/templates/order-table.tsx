// /components/vendor/OrderTable.tsx
const OrderTable = ({ orders }: { orders: any[] }) => (
    <div>
      <h2>Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.status}</td>
              <td>{order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  export default OrderTable;
  