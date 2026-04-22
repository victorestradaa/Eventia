const https = require('https');
const fs = require('fs');

const url = 'https://otivyjxhddpzyiudkbur.supabase.co/storage/v1/object/public/servicios/invitaciones/catalogo/1776832001561_wr539.jpg';

https.get(url, (res) => {
  let chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    let isWhite = true;
    let containsData = false;
    // Just a basic check: valid JPEGs start with FF D8. Let's see if we can find non-white pixels if we had an image parser,
    // but without one we can just see if the buffer has a variety of bytes or just repeating patterns.
    
    // Check byte entropy or simple variation
    let byteCounts = {};
    for (let i = 0; i < buf.length; i++) {
        byteCounts[buf[i]] = (byteCounts[buf[i]] || 0) + 1;
    }
    const uniqueBytes = Object.keys(byteCounts).length;
    console.log(`Buffer length: ${buf.length}`);
    console.log(`Unique byte values (0-255): ${uniqueBytes}`);
    if (uniqueBytes < 30) {
        console.log('Image has very low entropy, likely a solid color or highly compressed empty image.');
    } else {
        console.log('Image has high entropy, contains actual complex data (colors/shapes).');
    }
  });
});
