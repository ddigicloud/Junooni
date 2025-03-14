'use client'

import { useState } from "react";
import { HttpTypes } from "@medusajs/types";
import { Container } from "@medusajs/ui";
import Image from "next/image";

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[];
};

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0]); // Set first image as default

  return (
    <div className="flex flex-col-reverse items-center gap-4 lg:flex-row">
          {/* Thumbnail Images */}
          <div className="flex gap-2 mt-4 lg:flex-col">
        {images.map((image, index) => (
          <button
            key={image.id}
            className={`relative w-[80px] h-[80px] overflow-hidden border-2 ${
              selectedImage.id === image.id ? "border-blue-500" : "border-transparent"
            }`}
            onClick={() => setSelectedImage(image)}
          >
            {image.url && (
              <Image
                src={image.url}
                className="absolute inset-0 rounded-sm"
                alt={`Thumbnail ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
              />
            )}
          </button>
        ))}
      </div>
      {/* Main Image Display */}
      <Container className="relative w-full h-[450px] overflow-hidden bg-ui-bg-subtle">
        {selectedImage?.url && (
          <Image
            src={selectedImage.url}
            priority
            className="absolute inset-0 rounded-lg"
            alt="Main product image"
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            style={{ objectFit: "cover" }}
          />
        )}
      </Container>

  
    </div>
  );
};

export default ImageGallery;
