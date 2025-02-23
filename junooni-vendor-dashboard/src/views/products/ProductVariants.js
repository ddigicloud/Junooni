/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardBody, Button, Table, Spinner } from '@coreui/react';

// Variant List Component
const VariantList = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVariants = async () => {
      const token = localStorage.getItem('vendorToken');
      try {
        const response = await axios.get(`http://localhost:9000/vendors/products/${productId}/variants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVariants(response.data.variants);
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, [productId]);

  if (loading) return <Spinner color="primary" />;

  return (
    <Card>
      <CardHeader>Product Variants</CardHeader>
      <CardBody>
        <Table hover responsive>
          <thead>
            <tr>
              <th>Image</th>
              <th>Variant</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map(variant => (
              <tr key={variant.id}>
                <td>
                  <img 
                    src={variant.image} 
                    alt={variant.title}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                </td>
                <td>{variant.options.map(opt => opt.value).join(' / ')}</td>
                <td>${variant.price}</td>
                <td>{variant.inventory}</td>
                <td>
                  <Button 
                    color="primary" 
                    size="sm"
                    onClick={() => navigate(`/products/${productId}/variants/${variant.id}`)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

// Variant Detail Component
const VariantDetail = () => {
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { productId, variantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVariant = async () => {
      const token = localStorage.getItem('vendorToken');
      try {
        const response = await axios.get(`http://localhost:9000/vendors/products/${productId}/variants/${variantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVariant(response.data.variant);
      } finally {
        setLoading(false);
      }
    };
    fetchVariant();
  }, [productId, variantId]);

  if (loading) return <Spinner color="primary" />;

  return (
    <div className="variant-detail">
      <Card className="mb-4">
        <CardHeader>Variant Details</CardHeader>
        <CardBody>
          <div className="row">
            <div className="col-md-6">
              <h5>Images</h5>
              <div className="d-flex gap-2 mb-4">
                {variant.images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img.url} 
                    alt={`Variant ${idx + 1}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ))}
              </div>
              
              <h5>Options</h5>
              <div className="mb-4">
                {variant.options.map((opt, idx) => (
                  <div key={idx}>
                    <strong>{opt.name}:</strong> {opt.value}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-md-6">
              <h5>Pricing & Inventory</h5>
              <div className="mb-4">
                <div><strong>Price:</strong> ${variant.price}</div>
                <div><strong>Cost:</strong> ${variant.cost}</div>
                <div><strong>Margin:</strong> {variant.margin}%</div>
                <div><strong>Stock:</strong> {variant.inventory}</div>
              </div>

              <h5>Orders</h5>
              <div>
                <div><strong>Total Orders:</strong> {variant.orderCount}</div>
                <div><strong>Last Ordered:</strong> {new Date(variant.lastOrdered).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="d-flex justify-content-end gap-2">
        <Button color="secondary" onClick={() => navigate(`/products/${productId}`)}>Back</Button>
        <Button color="primary" onClick={() => {/* Add save handler */}}>Save Changes</Button>
      </div>
    </div>
  );
};

export { VariantList, VariantDetail };