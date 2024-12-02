// /components/vendor/CreateProductForm.tsx
import { useState } from "react";

const CreateProductForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    status: "published",
    options: [
      {
        title: "Color",
        values: ["Blue"],
      },
    ],
    variants: [
      {
        title: "T-Shirt",
        prices: [
          {
            currency_code: "eur",
            amount: 10, // Default price
          },
        ],
        manage_inventory: false,
        options: { Color: "Blue" },
      },
    ],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      setError("Authorization token not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/vendors/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Product created successfully!");
        setError("");
        // Reset form
        setFormData({
          title: "",
          status: "published",
          options: [
            {
              title: "Color",
              values: ["Blue"],
            },
          ],
          variants: [
            {
              title: "T-Shirt",
              prices: [
                {
                  currency_code: "eur",
                  amount: 10,
                },
              ],
              manage_inventory: false,
              options: { Color: "Blue" },
            },
          ],
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create product. Please try again.");
        setMessage("");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setMessage("");
      console.error("Error creating product:", err);
    }
  };

  return (
    <div>
      <h2>Create Product</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Title</label>
          <input
            type="text"
            placeholder="Enter product title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Price (EUR)</label>
          <input
            type="number"
            placeholder="Enter price"
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
                        amount: +e.target.value,
                      },
                    ],
                  },
                ],
              })
            }
            required
          />
        </div>
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
};

export default CreateProductForm;
