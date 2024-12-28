/* eslint-disable prettier/prettier */
import React from 'react'
import whiteFront from '/designer-canvas/tshirt-front.png'
import whiteBack from '/designer-canvas/tshirt-back.png'
import blackFront from '/designer-canvas/tshirt-front.png'
import blackBack from '/designer-canvas/tshirt-back.png'

const TshirtView = ({ direction, color }) => {
  const getImageSrc = () => {
    if (color === 'white') {
      if (direction === 'front') return whiteFront
      if (direction === 'back') return whiteBack
    } else {
      if (direction === 'front') return blackFront
      if (direction === 'back') return blackBack
    }
    return null // Add sleeve images similarly
  }

  return <img src={getImageSrc()} alt={`${color} ${direction} view`} />
}

export default TshirtView
