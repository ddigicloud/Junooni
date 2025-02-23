/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CSpinner,
  CAlert,
  CRow,
  CCol
} from '@coreui/react';

const AddProduct = () => {
  const [formState, setFormState] = useState({
    title: '',
    price: '',
    description: '',
    options: [{ title: 'Size', values: ['S', 'M', 'L'] }],
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setFormState((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = {
        ...newOptions[index],
        [field]: field === 'values' ? value.split(',').map(v => v.trim()) : value,
      };
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    setFormState((prev) => ({
      ...prev,
      options: [...prev.options, { title: '', values: [] }],
    }));
  };

  const removeOption = (index) => {
    setFormState((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    setFormState(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))]
    }));
  };

  const removeImage = (index) => {
    setFormState(prev => {
      const newImages = [...prev.images];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const uploadImages = async (images) => {
    if (!images || images.length === 0) return [];

    const formData = new FormData();
    images.forEach((image) => {
      // Make sure we're using the 'files' field name as expected by the backend
      formData.append('files', image.file);
    });

    const authToken = localStorage.getItem('vendorToken');
    try {
      const response = await fetch('http://localhost:9000/vendors/uploads', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${authToken}`,
          // Remove Content-Type header - let browser set it automatically for FormData
        },
        body: formData,
      });

      // First check if response is ok
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Failed to upload images';
        } catch (e) {
          // If response isn't JSON, get status text
          errorMessage = `Upload failed with status: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Try to parse the successful response
      try {
        const result = await response.json();
        if (!result.files) {
          throw new Error('No files data in response');
        }
        return result.files;
      } catch (e) {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
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

    if (!formState.title || !formState.price || !formState.description) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      let uploadedImages = [];
      
      // Only attempt to upload images if there are any
      if (formState.images.length > 0) {
        try {
          uploadedImages = await uploadImages(formState.images);
        } catch (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }
      }

      const productData = {
        title: formState.title,
        description: formState.description,
        status: 'published',
        options: formState.options,
        variants: generateVariants(formState.options, parseFloat(formState.price)),
        // Only include images if there are uploaded files
        ...(uploadedImages.length > 0 && {
          images: uploadedImages.map((image) => ({ url: image.url }))
        })
      };

      const response = await fetch('http://localhost:9000/vendors/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      setSuccessMessage('Product added successfully!');
      setFormState({
        title: '',
        price: '',
        description: '',
        options: [{ title: 'Size', values: ['S', 'M', 'L'] }],
        images: [],
      });
    } catch (error) {
      setError(error.message || 'There was an error creating the product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CCard>
      <CCardHeader>Add Product</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <CFormInput
              type="text"
              name="title"
              value={formState.title}
              onChange={handleChange}
              placeholder="Enter product title"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price (EUR)</label>
            <CFormInput
              type="number"
              name="price"
              value={formState.price}
              onChange={handleChange}
              placeholder="Enter product price"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <CFormTextarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          {/* Options Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Product Options</h5>
              <CButton color="primary" onClick={addOption} size="sm">
                Add Option
              </CButton>
            </div>

            {formState.options.map((option, index) => (
              <CRow key={index} className="mb-3 align-items-end">
                <CCol xs={5}>
                  <CFormInput
                    type="text"
                    value={option.title}
                    onChange={(e) => handleOptionChange(index, 'title', e.target.value)}
                    placeholder="Option name (e.g., Size, Color)"
                  />
                </CCol>
                <CCol xs={5}>
                  <CFormInput
                    type="text"
                    value={option.values.join(', ')}
                    onChange={(e) => handleOptionChange(index, 'values', e.target.value)}
                    placeholder="Values (comma-separated)"
                  />
                </CCol>
                <CCol xs={2}>
                  <CButton 
                    color="danger" 
                    variant="outline"
                    onClick={() => removeOption(index)}
                    className="w-100"
                  >
                    Remove
                  </CButton>
                </CCol>
              </CRow>
            ))}
          </div>

          {/* Image Upload Section */}
          <div
            className={`border border-2 rounded p-4 text-center mb-4 ${
              dragActive ? 'border-primary bg-light' : 'border-secondary'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="d-none"
              id="image-upload"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <label htmlFor="image-upload" className="mb-0 cursor-pointer">
              <div className="text-center">
                <i className="fas fa-cloud-upload-alt fa-2x mb-2"></i>
                <p className="mb-0">Drag and drop images here, or click to select files</p>
              </div>
            </label>
          </div>

          {/* Image Previews */}
          {formState.images.length > 0 && (
            <CRow className="mb-4">
              {formState.images.map((image, index) => (
                <CCol key={index} xs={6} md={3} className="mb-3">
                  <div className="position-relative">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="img-fluid rounded"
                      style={{ height: '120px', width: '100%', objectFit: 'cover' }}
                    />
                    <CButton
                      color="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </CButton>
                  </div>
                </CCol>
              ))}
            </CRow>
          )}

          <div className="d-grid">
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </CButton>
          </div>

          {error && (
            <CAlert color="danger" className="mt-3">
              {error}
            </CAlert>
          )}

          {successMessage && (
            <CAlert color="success" className="mt-3">
              {successMessage}
            </CAlert>
          )}
        </CForm>
      </CCardBody>
    </CCard>
  );
};

// Helper function to generate variants from options
const generateVariants = (options, basePrice) => {
  const generateCombinations = (arrays) => {
    return arrays.reduce((acc, curr) => {
      const temp = [];
      acc.forEach((prev) => {
        curr.forEach((item) => {
          temp.push([...prev, item]);
        });
      });
      return temp;
    }, [[]]);
  };

  const optionValues = options.map(option => option.values);
  const combinations = generateCombinations(optionValues);

  return combinations.map(combination => {
    const variantOptions = {};
    options.forEach((option, index) => {
      variantOptions[option.title] = combination[index];
    });

    return {
      title: combination.join(' / '),
      prices: [
        {
          currency_code: 'eur',
          amount: parseFloat(basePrice),
        },
      ],
      options: variantOptions,
      manage_inventory: false,
    };
  });
};

export default AddProduct;


