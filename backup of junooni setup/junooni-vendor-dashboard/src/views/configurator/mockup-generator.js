/* eslint-disable prettier/prettier */
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Add CORS for frontend requests

const app = express();
app.use(cors()); // Enable CORS

// Multer setup
const upload = multer({ dest: 'uploads/' });

app.post('/generate-mockup', upload.single('design'), async (req, res) => {
    try {
      const { lifestyleImage, positionX, positionY, width, height, designData } = req.body;
      const designPath = req.file.path;
  
      let lifestyleImagePath = lifestyleImage;
      if (!path.isAbsolute(lifestyleImage)) {
        lifestyleImagePath = path.join(__dirname, '..', '..', 'public', lifestyleImage);
      }
  
      if (!fs.existsSync(lifestyleImagePath)) {
        console.error('Lifestyle image not found:', lifestyleImagePath);
        return res.status(404).json({ error: 'Lifestyle image not found' });
      }
  
      const elements = JSON.parse(designData); // Parse design elements
  
      const outputFilePath = path.join(__dirname, `mockups/${Date.now()}-mockup.png`);
  
      const composites = elements.map((el) => {
        if (el.type === 'image') {
          return {
            input: designPath,
            top: parseInt(el.y) + parseInt(positionY),
            left: parseInt(el.x) + parseInt(positionX),
            blend: 'over',
          };
        } else if (el.type === 'text') {
          // Handle text rendering separately if needed
          console.log(`Text element: ${el.text}`);
          return null; // Skip for now
        }
      }).filter(Boolean); // Remove null values (e.g., for text)
  
      await sharp(lifestyleImagePath)
        .composite(composites)
        .toFile(outputFilePath);
  
      fs.unlinkSync(designPath); // Clean up uploaded design file
  
      res.json({ mockupUrl: `http://localhost:3001/mockups/${path.basename(outputFilePath)}` });
    } catch (error) {
      console.error('Error generating mockup:', error);
      res.status(500).json({ error: 'Error generating mockup' });
    }
  });
  
  

// Serve generated mockups
app.use('/mockups', express.static(path.join(__dirname, 'mockups')));

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mockup generator running on http://localhost:${PORT}`);
});
