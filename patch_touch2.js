const fs = require('fs');
const filePath = 'src/app/cliente/evento/[id]/mesas/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// ============================================================
// FIX 1: Move onTouchMove/onTouchEnd from inner div to <main>
// The escenario and pista elements are siblings of the inner div,
// so touch events need to be on the parent <main> element.
// ============================================================

// Step 1a: Add touch handlers to <main>
const mainSearch = 'className="flex-1 relative overflow-hidden bg-[#f1f5f9] select-none"\r\n        >';
const mainReplace = 'className="flex-1 relative overflow-hidden bg-[#f1f5f9] select-none"\r\n          onTouchMove={handleTouchMove}\r\n          onTouchEnd={handleTouchEnd}\r\n        >';

if (content.includes(mainSearch)) {
  content = content.replace(mainSearch, mainReplace);
  console.log('✓ Added touch handlers to <main>');
} else {
  console.log('✗ <main> search not found');
}

// Step 1b: Also add onMouseMove/onMouseUp/onMouseLeave to <main>
// (so escenario and pista also respond to mouse drag outside inner div)
const mainWithTouchSearch = 'className="flex-1 relative overflow-hidden bg-[#f1f5f9] select-none"\r\n          onTouchMove={handleTouchMove}\r\n          onTouchEnd={handleTouchEnd}\r\n        >';
const mainWithTouchReplace = 'className="flex-1 relative overflow-hidden bg-[#f1f5f9] select-none"\r\n          onMouseMove={handleMouseMove}\r\n          onMouseUp={handleMouseUp}\r\n          onMouseLeave={handleMouseUp}\r\n          onTouchMove={handleTouchMove}\r\n          onTouchEnd={handleTouchEnd}\r\n        >';

if (content.includes(mainWithTouchSearch)) {
  content = content.replace(mainWithTouchSearch, mainWithTouchReplace);
  console.log('✓ Added mouse handlers to <main>');
} else {
  console.log('✗ main with touch search not found');
}

// ============================================================
// FIX 2: Add touch support to floor guests (invitados en el suelo)
// They currently only have draggable/onDragStart but no touch handlers.
// ============================================================

// The floor guest div - add onTouchStart and touch-none
const floorGuestSearch = 'draggable="true"\r\n                   onDragStart={(e) => e.dataTransfer.setData(\'invitadoId\', i.id)}\r\n                   style={{ left: i.x, top: i.y }}\r\n                   className="absolute z-20 transition-all flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing hover:scale-110"';
const floorGuestReplace = 'draggable="true"\r\n                   onDragStart={(e) => e.dataTransfer.setData(\'invitadoId\', i.id)}\r\n                   onMouseDown={(e) => { e.stopPropagation(); setDraggedGuest(i); setCursorPos({ x: e.clientX, y: e.clientY }); }}\r\n                   onTouchStart={(e) => { e.stopPropagation(); const t = e.touches[0]; setDraggedGuest(i); setCursorPos({ x: t.clientX, y: t.clientY }); }}\r\n                   style={{ left: i.x, top: i.y }}\r\n                   className="absolute z-20 transition-all flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing hover:scale-110 touch-none"';

if (content.includes(floorGuestSearch)) {
  content = content.replace(floorGuestSearch, floorGuestReplace);
  console.log('✓ Added touch/mouse drag to floor guests');
} else {
  console.log('✗ Floor guest search not found');
}

// ============================================================
// FIX 3: Update handleMouseMove to also update cursorPos when dragging a guest
// The inner div's handleMouseMove already updates cursorPos for mouse,
// but we need to make sure it covers when draggedGuest moves over non-inner areas.
// (This is already done via the main's onMouseMove now)
// ============================================================

fs.writeFileSync(filePath, content, 'utf8');
console.log('\nFile saved. Summary:');
console.log('- Touch and mouse handlers now on <main> so escenario/pista work everywhere');
console.log('- Floor guests now have touch/mouse drag support');
