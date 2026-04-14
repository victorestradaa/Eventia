const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'cliente', 'evento', '[id]', 'mesas', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add onTouchMove and onTouchEnd to the canvas div (13-space indent)
const canvasSearch = 'onMouseLeave={handleMouseUp}\r\n             onDragOver';
const canvasReplace = 'onMouseLeave={handleMouseUp}\r\n             onTouchMove={handleTouchMove}\r\n             onTouchEnd={handleTouchEnd}\r\n             onDragOver';

if (content.includes(canvasSearch)) {
  content = content.replace(canvasSearch, canvasReplace);
  console.log('✓ Added touch handlers to canvas div');
} else {
  console.log('✗ Canvas CRLF 13-space not found');
}

// 2. Check mesa onMouseDown format
const mesaIdx = content.indexOf('onMouseDown={(e) => handleMouseDown(e, m.id, m.x, m.y)}');
if (mesaIdx >= 0) {
  const chunk = content.slice(mesaIdx, mesaIdx + 400);
  fs.writeFileSync('tmp_mesa.txt', JSON.stringify(chunk));
  console.log('Mesa chunk written to tmp_mesa.txt');
} else {
  console.log('✗ Mesa onMouseDown not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File saved.');
