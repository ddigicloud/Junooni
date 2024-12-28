/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' // Import useNavigate
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
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate() // Initialize the navigation hook

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const token = localStorage.getItem('vendorToken')

    try {
      const response = await axios.get('http://localhost:9000/vendors/products', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      setProducts(response.data.products || [])
      setLoading(false)
    } catch (error) {
      console.error('Fetch Error:', error)
      setLoading(false)
    }
  }

  const handleDeleteProduct = (productId) => {
    // Implement delete logic here
    console.log(`Delete product with ID: ${productId}`)
  }

  const handleEditProduct = (productId) => {
    navigate(`/products/${productId}`) // Navigate to the edit page with the product ID
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
                        product.status === 'active'
                          ? 'success'
                          : product.status === 'draft'
                            ? 'warning'
                            : 'danger'
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
                      onClick={() => handleEditProduct(product.id)} // Pass product ID
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
