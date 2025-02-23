/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CButton,
  CForm,
  CFormInput,
  CFormTextarea,
  CSpinner,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
} from '@coreui/react';

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showVariants, setShowVariants] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('vendorToken');
      try {
        const response = await axios.get(`http://localhost:9000/vendors/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProduct(response.data.product);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product details.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = async (files) => {
    const token = localStorage.getItem('vendorToken');
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    try {
      const response = await axios.post('http://localhost:9000/vendors/uploads', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const uploadedImages = response.data.files;
      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedImages.map((img) => ({ url: img.url, id: img.id }))],
      }));
    } catch (err) {
      setError('Failed to upload images');
    }
  };

  // Handle image removal
  const removeImage = (imageId) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  // Save product changes
  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('vendorToken');
    try {
      // Only send necessary fields for basic update
      const updateData = {
        title: product.title,
        description: product.description,
        images: product.images.map(img => ({
          url: img.url,
          id: img.id
        }))
      };

      await axios.put(`http://localhost:9000/vendors/products/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      alert('Product updated successfully!');
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CSpinner color="primary" />;
  if (error) return <CAlert color="danger">{error}</CAlert>;

  return (
    <div className="pb-4">
      <h1 className="mb-4">Edit Product</h1>
      <CForm>
        <CRow>
          {/* Basic Information */}
          <CCol md={8}>
            <CCard className="mb-4">
              <CCardHeader>Basic Information</CCardHeader>
              <CCardBody>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <CFormInput
                    type="text"
                    name="title"
                    value={product.title || ''}
                    onChange={handleInputChange}
                    placeholder="Enter product title"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <CFormTextarea
                    name="description"
                    value={product.description || ''}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Enter product description"
                  />
                </div>
              </CCardBody>
            </CCard>

            {/* Images Section */}
            <CCard className="mb-4">
              <CCardHeader>Images</CCardHeader>
              <CCardBody>
                <div className="d-flex flex-wrap gap-3">
                  {product.images?.map((image, index) => (
                    <div
                      key={image.id}
                      className="position-relative"
                      style={{
                        width: '150px',
                        height: '150px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={image.url}
                        alt={`Product Image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <CButton
                        color="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-1"
                        onClick={() => removeImage(image.id)}
                      >
                        ×
                      </CButton>
                    </div>
                  ))}
                  <div
                    className={`border-dotted ${dragActive ? 'border-primary' : ''}`}
                    style={{
                      width: '150px',
                      height: '150px',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onDragEnter={() => setDragActive(true)}
                    onDragLeave={() => setDragActive(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      handleImageUpload(e.dataTransfer.files);
                    }}
                  >
                    <label htmlFor="image-upload" className="text-muted mb-0" style={{ cursor: 'pointer' }}>
                      <i className="fas fa-plus-circle"></i> Add Image
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="d-none"
                      id="image-upload"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

            <div className="d-flex justify-content-end gap-2 mt-4">
          <CButton color="secondary" onClick={() => navigate('/products')}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <CSpinner size="sm" className="me-2" /> : 'Save Changes'}
          </CButton>
        </div>
      </CForm>
    </div>
  );
};

export default ProductEditPage;