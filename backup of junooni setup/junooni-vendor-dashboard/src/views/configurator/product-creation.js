/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MockupGenerator from './mockups'

const ProductConfigurationForm = ({ designElements, baseImages, printingArea, currentView }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'published',
    options: [{ title: 'Color', values: [] }],
    variants: [
      {
        title: '',
        prices: [
          {
            currency_code: 'eur',
            amount: 0,
          },
        ],
        manage_inventory: false,
        options: {},
      },
    ],
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:9000/vendors/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        navigate('/products')
      }
    } catch (error) {
      console.error('Error submitting product:', error)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Product Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                  variants: [
                    {
                      ...formData.variants[0],
                      title: e.target.value,
                    },
                  ],
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Price (EUR)</label>
            <input
              type="number"
              value={formData.variants[0].prices[0].amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  variants: [
                    {
                      ...formData.variants[0],
                      prices: [
                        {
                          ...formData.variants[0].prices[0],
                          amount: parseFloat(e.target.value),
                        },
                      ],
                    },
                  ],
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Product
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Product Mockups</h2>
        <MockupGenerator
          designElements={designElements}
          currentView={currentView}
          baseImages={baseImages}
          printingArea={printingArea}
        />
      </div>
    </div>
  )
}

export default ProductConfigurationForm
