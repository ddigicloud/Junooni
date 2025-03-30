"use client"
import { useState, useEffect } from "react"
import { retrieveCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { Button, Input, Label, Textarea, toast, Toaster } from "@medusajs/ui"
import { Star, StarSolid } from "@medusajs/icons"
import { addProductReview } from "@lib/data/products"

type ProductReviewsFormProps = {
  productId: string
  onSuccess?: () => void
}

export default function ProductReviewsForm({ 
  productId,
  onSuccess
}: ProductReviewsFormProps) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(0)

  useEffect(() => {
    if (customer) {
      return
    }
    retrieveCustomer().then(setCustomer)
  }, [])

  if (!customer) {
    return <div className="p-4 text-sm text-center rounded bg-gray-50">
      Please sign in to leave a review
    </div>
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!content || !rating) {
      toast.error("Error", {
        description: "Please fill in required fields.",
      })
      return
    }
    
    setIsLoading(true)
    addProductReview({
      title,
      content,
      rating,
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      product_id: productId,
    }).then(() => {
      setTitle("")
      setContent("")
      setRating(0)
      toast.success("Success", {
        description: "Your review has been submitted and is awaiting approval.",
      })
      if (onSuccess) {
        onSuccess()
      }
    }).catch(() => {
      toast.error("Error", {
        description: "An error occurred while submitting your review. Please try again later.",
      })
    }).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <span className="text-xl-regular text-ui-fg-base">
            Add a review
          </span>
        
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label>Title</Label>
              <Input 
                name="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Title" 
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Content <span className="text-red-500">*</span></Label>
              <Textarea 
                name="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Content" 
                required
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Rating <span className="text-red-500">*</span></Label>
              <div className="flex gap-x-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Button 
                    key={index} 
                    variant="transparent" 
                    onClick={(e) => {
                      e.preventDefault()
                      setRating(index + 1)
                    }} 
                    className="p-0"
                  >
                    {rating >= index + 1 ? 
                      <StarSolid className="text-ui-tag-orange-icon" /> : 
                      <Star />
                    }
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-x-2">
              <Button 
                type="submit" 
                disabled={isLoading} 
                variant="primary"
                className="bg-[#e65100] hover:bg-[#d84315]"
              >
                {isLoading ? "Submitting..." : "Submit Review"}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  if (onSuccess) onSuccess();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  )
}