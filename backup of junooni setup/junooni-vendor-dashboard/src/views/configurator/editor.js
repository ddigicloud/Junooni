/* eslint-disable prettier/prettier */
import React from 'react'

const Editor = ({ direction, color, onDirectionChange, onColorChange }) => {
  return (
    <div className="editor-container">
      <h3>Editor</h3>
      <div className="controls">
        <div className="color-controls">
          <h4>Choose Color</h4>
          <button onClick={() => onColorChange('white')}>White</button>
          <button onClick={() => onColorChange('black')}>Black</button>
        </div>
        <div className="view-controls">
          <h4>Choose View</h4>
          <button onClick={() => onDirectionChange('front')}>Front</button>
          <button onClick={() => onDirectionChange('back')}>Back</button>
          <button onClick={() => onDirectionChange('left-sleeve')}>Left Sleeve</button>
          <button onClick={() => onDirectionChange('right-sleeve')}>Right Sleeve</button>
        </div>
      </div>
    </div>
  )
}

export default Editor
