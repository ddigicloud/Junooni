// /components/vendor/ProductTable.tsx
const ProductTable = ({ products }: { products: any[] }) => (
    <div>
      <h2>Products</h2>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.title}</td>
             
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  export default ProductTable;
  