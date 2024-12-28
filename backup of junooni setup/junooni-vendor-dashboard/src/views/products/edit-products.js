/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CButton, CForm, CFormInput, CFormTextarea, CSpinner, CRow, CCol } from '@coreui/react'

const ProductEditPage = () => {
  const { id } = useParams() // Extract product ID from URL
  const navigate = useNavigate() // Navigation hook
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('vendorToken')
      try {
        const response = await axios.get(`http://localhost:9000/vendors/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        setProduct(response.data.product) // Populate product data
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch product details')
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const token = localStorage.getItem('vendorToken')
    try {
      await axios.put(`http://localhost:9000/vendors/products/${id}`, product, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      alert('Product updated successfully!')
      navigate('/products') // Redirect to product list
    } catch (err) {
      console.error(err)
      alert('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CSpinner color="primary" />
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Edit Product</h1>
      <CForm>
        <CRow>
          <CCol md={6}>
            <div>
              <label>Title</label>
              <CFormInput
                type="text"
                name="title"
                value={product.title || ''}
                onChange={handleInputChange}
                placeholder="Enter product title"
              />
            </div>
            <div>
              <label>Description</label>
              <CFormTextarea
                name="description"
                value={product.description || ''}
                onChange={handleInputChange}
                placeholder="Enter product description"
              />
            </div>
            <div>
              <label>Price</label>
              <CFormInput
                type="number"
                name="price"
                value={product.price || ''}
                onChange={handleInputChange}
                placeholder="Enter product price"
              />
            </div>
            <div>
              <label>SKU</label>
              <CFormInput
                type="text"
                name="sku"
                value={product.sku || ''}
                onChange={handleInputChange}
                placeholder="Enter product SKU"
              />
            </div>
          </CCol>
          <CCol md={6}>
            <div>
              <label>Inventory</label>
              <CFormInput
                type="number"
                name="inventory"
                value={product.inventory || ''}
                onChange={handleInputChange}
                placeholder="Enter inventory count"
              />
            </div>
            <div>
              <label>Category</label>
              <CFormInput
                type="text"
                name="category"
                value={product.category || ''}
                onChange={handleInputChange}
                placeholder="Enter product category"
              />
            </div>
            <div>
              <label>Image URL</label>
              <CFormInput
                type="text"
                name="image"
                value={product.image || ''}
                onChange={handleInputChange}
                placeholder="Enter product image URL"
              />
            </div>
          </CCol>
        </CRow>
        {/* Add more fields as necessary */}
        <CButton color="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </CButton>
      </CForm>
    </div>
  )
}

export default ProductEditPage
