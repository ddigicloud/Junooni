"use client";
import { useState } from "react";
import { Star } from "lucide-react";

// Define the Review type
interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

// Define the NewReview type
interface NewReview {
  name: string;
  rating: number;
  comment: string;
}

const ProductReviews = () => {
  // Add proper typing to state variables
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<NewReview>({ 
    name: "", 
    rating: 5, 
    comment: "" 
  });

  // Add proper typing to event handlers
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    
    const review: Review = {
      id: reviews.length + 1,
      ...newReview,
    };
    
    setReviews([...reviews, review]);
    setNewReview({ name: "", rating: 5, comment: "" });
  };

  return (
    <div className="max-w-2xl p-6 mx-auto mt-10 bg-white shadow-md rounded-xl">
      <h3 className="mb-4 text-3xl font-bold text-gray-800">Customer Reviews</h3>
     
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg shadow-lg">
              <div className="pb-3 border-b">
                <h4 className="text-lg font-semibold">{review.name}</h4>
              </div>
              <div className="pt-3">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5" 
                      color={i < review.rating ? "#FFD700" : "#E2E8F0"}
                      fill={i < review.rating ? "#FFD700" : "none"}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="italic text-gray-500">No reviews yet. Be the first to leave a review!</p>
      )}
      <form onSubmit={handleSubmit} className="p-6 mt-6 space-y-4 bg-gray-100 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={newReview.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setNewReview({ ...newReview, name: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <label className="font-medium text-gray-700">Rating:</label>
          <select
            value={newReview.rating}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              setNewReview({ ...newReview, rating: Number(e.target.value) })}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>{star} Stars</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Write your review..."
            value={newReview.comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              setNewReview({ ...newReview, comment: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
        </div>
        <button 
          type="submit" 
          className="w-full p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ProductReviews;