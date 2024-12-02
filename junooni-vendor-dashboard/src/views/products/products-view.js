import React, { useState, useEffect } from 'react'
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CPagination,
  CPaginationItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [modalMode, setModalMode] = useState('add')

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  })

  // Fetch Products
  const fetchProducts = async () => {
    const token = localStorage.getItem("vendorToken");
   

    try {
      const response = await axios.get('http://localhost:9000/vendors/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      setProducts(data.products)
      setPagination(prev => ({
        ...prev,
        totalItems: data.total
      }))
    } catch (error) {
      console.error('Failed to fetch products', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [pagination.currentPage])

  // Open Modal for Adding/Editing
  const openModal = (mode, product = null) => {
    setModalMode(mode)
    setCurrentProduct(product)
    setIsModalOpen(true)
  }

  // Product CRUD Operations
  const handleAddProduct = async (productData) => {
    try {
      await fetch('http://localhost:9000/vendors/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      })
      fetchProducts()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Product creation failed', error)
    }
  }

  const handleUpdateProduct = async (productData) => {
    try {
      await fetch(`http://localhost:9000/vendors/products/${productData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      })
      fetchProducts()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Product update failed', error)
    }
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await fetch(`http://localhost:9000/vendors/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      fetchProducts()
    } catch (error) {
      console.error('Product deletion failed', error)
    }
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Product Management</h4>
          <CButton 
            color="primary" 
            onClick={() => openModal('add')}
          >
            <CIcon icon={cilPlus} /> Add Product
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Price</CTableHeaderCell>
                <CTableHeaderCell>Inventory</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {products.map((product) => (
                <CTableRow key={product.id}>
                  <CTableDataCell>{product.title}</CTableDataCell>
                  <CTableDataCell>${product.price}</CTableDataCell>
                  <CTableDataCell>{product.inventory}</CTableDataCell>
                  <CTableDataCell>{product.status}</CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      color="info" 
                      size="sm" 
                      className="me-2"
                      onClick={() => openModal('edit', product)}
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

          <CPagination align="center" className="mt-3">
            <CPaginationItem 
              disabled={pagination.currentPage === 1}
              onClick={() => setPagination(prev => ({ 
                ...prev, 
                currentPage: prev.currentPage - 1 
              }))}
            >
              Previous
            </CPaginationItem>
            <CPaginationItem active>
              {pagination.currentPage}
            </CPaginationItem>
            <CPaginationItem
              disabled={pagination.currentPage * pagination.pageSize >= pagination.totalItems}
              onClick={() => setPagination(prev => ({ 
                ...prev, 
                currentPage: prev.currentPage + 1 
              }))}
            >
              Next
            </CPaginationItem>
          </CPagination>
        </CCardBody>
      </CCard>

      {/* Product Modal */}
      <CModal 
        visible={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      >
        <CModalHeader>
          <CModalTitle>
            {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Product Name"
              placeholder="Enter product name"
              className="mb-3"
              defaultValue={currentProduct?.name || ''}
            />
            <CFormInput
              label="Price"
              type="number"
              placeholder="Enter product price"
              className="mb-3"
              defaultValue={currentProduct?.price || ''}
            />
            <CFormInput
              label="Inventory"
              type="number"
              placeholder="Enter inventory quantity"
              className="mb-3"
              defaultValue={currentProduct?.inventory || ''}
            />
            <CFormSelect
              label="Status"
              className="mb-3"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Draft', value: 'draft' },
                { label: 'Out of Stock', value: 'out_of_stock' }
              ]}
              defaultValue={currentProduct?.status || 'draft'}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </CButton>
          <CButton 
            color="primary"
            onClick={() => modalMode === 'add' 
              ? handleAddProduct(/* collect form data */) 
              : handleUpdateProduct(/* collect form data */)}
          >
            {modalMode === 'add' ? 'Add Product' : 'Update Product'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProductManagement