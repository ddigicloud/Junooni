/* eslint-disable prettier/prettier */
// In your component, temporarily create a test mask
useEffect(() => {
  // Create a canvas
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 600
  const ctx = canvas.getContext('2d')

  // Fill with black
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, 600, 600)

  // Draw white t-shirt shape
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.moveTo(200, 150)
  ctx.quadraticCurveTo(300, 100, 400, 150)
  ctx.lineTo(420, 400)
  ctx.lineTo(180, 400)
  ctx.closePath()
  ctx.fill()

  // Convert to image
  const img = new Image()
  img.src = canvas.toDataURL()
  img.onload = () => {
    setMaskImages((prev) => ({
      ...prev,
      front: img,
      back: img,
      leftSleeve: img,
      rightSleeve: img,
    }))
  }
}, [])
