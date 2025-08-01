// img-compress-cli configuration file
// This file allows you to set default options for image compression

module.exports = {
  // Default quality (0-100)
  quality: 80,
  
  // Default output directory
  output: './compressed',
  
  // Skip files smaller than this size (in bytes)
  minSize: 1024,
  skipSmall: true,
  
  // PNG compression options (choose one)
  aggressivePng: false,   // Aggressive PNG compression (slower but smaller)
  ultraPng: false,        // Maximum PNG compression (slowest but smallest)
  
  // Default format (leave undefined to keep original format)
  // format: 'jpeg',
  
  // Default resize dimensions (leave undefined for no resize)
  // resize: '1920x1080',
};
