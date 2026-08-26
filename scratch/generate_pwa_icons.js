const fs = require('fs');
const path = require('path');

// Check available images in public and dist
console.log('Public files:', fs.readdirSync(path.join(__dirname, '../public')));
