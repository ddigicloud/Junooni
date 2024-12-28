/* eslint-disable prettier/prettier */
import React, { Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary' // Import the error boundary component
const ProductCanvas = React.lazy(() => import('./ProductCanvas')) // Lazy load ProductCanvas

const Configurator = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="configurator-container">
          <h1>Apparel Configurator</h1>
          <ProductCanvas />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

export default Configurator
