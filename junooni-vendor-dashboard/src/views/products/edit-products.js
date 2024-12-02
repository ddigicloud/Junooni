import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import { CButton, CForm, CFormInput, CFormTextarea, CSpinner } from "@coreui/react";

const ProductEditPage = () => {
  const { id } = useParams(); // Extract product ID from the URL
  const history = useHistory();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
        const token = localStorage.getItem("vendorToken");
      try {
        const response = await axios.get(`http://localhost:9000/vendors/products/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        
        setProduct(response.data.product);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch product details");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`http://localhost:9000/vendors/products/${id}`, product, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert("Product updated successfully!");
      history.push("/products"); // Redirect to product list
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CSpinner color="primary" />;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Edit Product</h1>
      <CForm>
        <div>
          <label>Title</label>
          <CFormInput
            type="text"
            name="title"
            value={product.title || ""}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Description</label>
          <CFormTextarea
            name="description"
            value={product.description || ""}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Price</label>
          <CFormInput
            type="number"
            name="price"
            value={product.price || ""}
            onChange={handleInputChange}
          />
        </div>
        {/* Add more fields as needed */}
        <CButton
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </CButton>
      </CForm>
    </div>
  );
};

export default ProductEditPage;
