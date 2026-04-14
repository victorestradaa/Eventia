const fs = require('fs');
const filePath = 'src/app/cliente/evento/[id]/mesas/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove duplicate mouse/touch handlers from the inner div
// (they're now on the parent <main>)
// Keep onDragOver and onDrop since those are for the HTML drag-and-drop API (not mouse events)
const innerSearch = 'className="w-full h-full relative"\r\n             onMouseMove={handleMouseMove}\r\n             onMouseUp={handleMouseUp}\r\n             onMouseLeave={handleMouseUp}\r\n             onTouchMove={handleTouchMove}\r\n             onTouchEnd={handleTouchEnd}\r\n             onDragOver={(e) => e.preventDefault()}';
const innerReplace = 'className="w-full h-full relative"\r\n             onDragOver={(e) => e.preventDefault()}';

if (content.includes(innerSearch)) {
  content = content.replace(innerSearch, innerReplace);
  console.log('✓ Removed duplicate handlers from inner div');
} else {
  console.log('✗ Inner div search not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File saved.');
