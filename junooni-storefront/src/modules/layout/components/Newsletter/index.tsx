'use client'

// Newsletter.jsx
import Image from 'next/image';
import { useState } from 'react';
import NewsletterImg from "@assets/NewsletterImg.svg"


const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setIsSubmitted(true);
    setEmail('');
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl px-4 py-6 mx-auto ">
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
          {/* Chair Image */}
          <div className="md:w-1/3">
            <Image
              src={NewsletterImg} // Update this path to your actual chair image
              alt="Newsletter form"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
          
          {/* Newsletter Content */}
          <div className="max-w-md md:w-2/3">
            <h2 className="mb-4 font-serif text-3xl md:text-3xl">Subscribe To Our Newsletter</h2>
            <p className="mb-6 text-gray-600">
              Sign up for to get daily updates & news about our new products and features.
            </p>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-grow">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="px-6 py-3 text-white transition-colors bg-black rounded-md hover:bg-gray-800"
              >
                Subscribe
              </button>
            </form>
            
            {/* Success Message */}
            {isSubmitted && (
              <p className="mt-3 text-green-600">Thank you for subscribing!</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;