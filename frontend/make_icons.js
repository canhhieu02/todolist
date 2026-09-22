const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'public');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
const svgData = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>';

['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'].forEach(f => fs.writeFileSync(path.join(dir, f), pngData));
fs.writeFileSync(path.join(dir, 'masked-icon.svg'), svgData);
