/* eslint-disable prettier/prettier */
import React from 'react'
import { useNavigate } from 'react-router-dom'

const products = [
  { id: 'tee', name: 'T-Shirt', image: 'https://w7.pngwing.com/pngs/826/253/png-transparent-t-shirt-polo-shirt-clothing-sleeve-black-t-shirt-black-crew-neck-t-shirt-tshirt-fashion-cloth-thumbnail.png' },
  { id: 'mug', name: 'Mug', image: 'https://w7.pngwing.com/pngs/239/484/png-transparent-magic-mug-personalization-printing-coffee-cup-coffee-mug-white-mug-white-logo-teacup-thumbnail.png' },
  { id: 'cap', name: 'Cap', image: 'https://e7.pngegg.com/pngimages/734/158/png-clipart-baseball-cap-hat-swim-caps-baseball-cap-hat-black-thumbnail.png' },
]

const ProductCatalog = () => {
  const navigate = useNavigate()

  const handleProductSelect = (productId) => {
    navigate(`/customizer/${productId}`) // Redirect to customizer with product ID
  }

  return (
    <div>
      <h1>Select a Product</h1>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductSelect(product.id)}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              textAlign: 'center',
              width: '150px',
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100px', height: '100px' }}
            />
            <p>{product.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductCatalog
