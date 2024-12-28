/* eslint-disable prettier/prettier */
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
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [modalMode, setModalMode] = useState('add')
  const [modalOption, setModalOption] = useState('create') // 'create' or 'design'

  // Pagination and Fetch Code
  // ...

  // Modal Option Switch
  const handleOptionSwitch = (option) => {
    setModalOption(option)
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Product Management</h4>
          <CButton color="primary" onClick={() => setIsModalOpen(true)}>
            <CIcon icon={cilPlus} /> Add Product
          </CButton>
        </CCardHeader>
        <CCardBody>
          {/* Table Code */}
        </CCardBody>
      </CCard>

      {/* Product Modal */}
      <CModal visible={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>
            {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="d-flex justify-content-around mb-4">
            <CButton
              color={modalOption === 'create' ? 'primary' : 'secondary'}
              onClick={() => handleOptionSwitch('create')}
            >
              Create Something I Have
            </CButton>
            <CButton
              color={modalOption === 'design' ? 'primary' : 'secondary'}
              onClick={() => handleOptionSwitch('design')}
            >
              Design Something
            </CButton>
          </div>

          {modalOption === 'create' ? (
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
                  { label: 'Out of Stock', value: 'out_of_stock' },
                ]}
                defaultValue={currentProduct?.status || 'draft'}
              />
            </CForm>
          ) : (
            <div className="text-center">
              <h5>Product Designer</h5>
              <p>
                Here you can design a product. Integrate your product
                configurator here.
              </p>
              {/* Replace with actual product configurator */}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </CButton>
          {modalOption === 'create' ? (
            <CButton color="primary" onClick={() => /* handleAddProduct */ {}}>
              {modalMode === 'add' ? 'Add Product' : 'Update Product'}
            </CButton>
          ) : (
            <CButton color="primary" onClick={() => console.log('Design Saved')}>
              Save Design
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProductManagement
