import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    // Multiple ways to retrieve token
    const token = localStorage.getItem("vendorToken");
   

    try {
      const response = await axios.get('http://localhost:9000/vendors/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Full Products Response:', response.data)
      
      // Ensure products array exists
      setProducts(response.data.products || response.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Detailed Fetch Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      setLoading(false)
      
      
    }
  }
  

  return (
    <CCard>
      <CCardHeader>
        <strong>Product List</strong>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Price</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {products.map((product) => (
                <CTableRow key={product.id}>
                  <CTableDataCell>{product.title}</CTableDataCell>
                  <CTableDataCell>${product.price}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      color={
                        product.status === 'active' ? 'success' : 
                        product.status === 'draft' ? 'warning' : 'danger'
                      }
                    >
                      {product.status}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      color="info" 
                      size="sm" 
                      className="me-2"
                      onClick={() => {/* Navigate to edit page */}}
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton 
                      color="danger" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ProductList