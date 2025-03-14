import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/product-columns'
import { DataTable } from './components/data-tables'
import { ProductsPrimaryButtons } from './components/ProductsPrimaryButtons'
import ProductsProvider from './context/products-context'
import { useEffect,useState } from 'react'

export default function Products() {

    const [products, setProducts] = useState([])

    useEffect(() => {
      const fetchProducts = async () => {
        const token = localStorage.getItem("vendorToken");
        try {
          const response = await fetch("http://localhost:9000/vendors/products", {
            method: "GET", // GET request method (no body needed)
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          // Check if response is successful
          if (!response.ok) {
            const responseBody = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${responseBody.message}`);
          }
    
          const responseBody = await response.json();
    
          setProducts(responseBody.products);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };
    
      fetchProducts();
    }, []);
  
  
  
  return (
    <ProductsProvider>
      <Header fixed>
        <Search />
        <div className='flex items-center ml-auto space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex flex-wrap items-center justify-between mb-2 space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Products</h2>
            <p className='text-muted-foreground'>Manage your product inventory here.</p>
          </div>
          <ProductsPrimaryButtons />
        </div>
        <div className='flex-1 px-4 py-1 -mx-4 overflow-auto lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={products} columns={columns} />
        </div>
      </Main>

    </ProductsProvider>
  )
}
