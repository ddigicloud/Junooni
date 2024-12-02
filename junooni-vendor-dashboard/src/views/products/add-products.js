import React, { useState } from 'react';
import axios from 'axios';
import { CCard, CCardBody, CCardHeader, CForm, CFormInput, CFormTextarea, CButton, CSpinner, CAlert } from '@coreui/react';

const AddProduct = () => {
  const [formState, setFormState] = useState({
    title: '',
    price: '',
    description: '',
    color: 'Blue',
    variantTitle: 'T-Shirt',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const authToken = localStorage.getItem('vendorToken');
    if (!authToken) {
      setError('Authentication token not found');
      setLoading(false);
      return;
    }

    const ProductData = {
      title: formState.title,
      status: 'published',
      options: [
        {
          title: 'Color',
          values: [formState.color],
        },
      ],
      variants: [
        {
          title: formState.variantTitle,
          prices: [
            {
              currency_code: 'eur',
              amount: parseFloat(formState.price),
            },
          ],
          manage_inventory: false,
          options: {
            Color: formState.color,
          },
        },
      ],
    };

    try {
      const response = await axios.post(
        `http://localhost:9000/vendors/products`,
        ProductData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccessMessage('Product added successfully!');
      setFormState({
        title: '',
        price: '',
        description: '',
        color: 'Blue',
        variantTitle: 'T-Shirt',
      });
    } catch (error) {
      setError('There was an error creating the product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CCard>
      <CCardHeader>Add Product</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <CFormInput
              type="text"
              id="title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              placeholder="Enter product title"
            />
          </div>

          {/* Price Input */}
          <div className="mb-3">
            <label htmlFor="price" className="form-label">
              Price (EUR)
            </label>
            <CFormInput
              type="number"
              id="price"
              name="price"
              value={formState.price}
              onChange={handleChange}
              placeholder="Enter product price"
            />
          </div>

          {/* Description Textarea */}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <CFormTextarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleChange}
              placeholder="Enter product description"
            />
          </div>

          {/* Color Input */}
          <div className="mb-3">
            <label htmlFor="color" className="form-label">
              Color
            </label>
            <CFormInput
              type="text"
              id="color"
              name="color"
              value={formState.color}
              onChange={handleChange}
              placeholder="Enter color option"
            />
          </div>

          {/* Variant Title Input */}
          <div className="mb-3">
            <label htmlFor="variantTitle" className="form-label">
              Variant Title (e.g., T-Shirt)
            </label>
            <CFormInput
              type="text"
              id="variantTitle"
              name="variantTitle"
              value={formState.variantTitle}
              onChange={handleChange}
              placeholder="Enter variant title"
            />
          </div>

          {/* Submit Button */}
          <div className="d-grid">
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <CSpinner size="sm" /> Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </CButton>
          </div>
        </CForm>

        {/* Error Message */}
        {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

        {/* Success Message */}
        {successMessage && <CAlert color="success" className="mt-3">{successMessage}</CAlert>}
      </CCardBody>
    </CCard>
  );
};

export default AddProduct;
