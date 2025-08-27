const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const categories = require('../data/categories.js').data.map(c => c.category);
const hotelsFilePath = path.join(__dirname, '..', 'data', 'hotels.js');

function loadHotels() {
  // require cache may interfere when this script is run multiple times; read raw file and eval safely
  const raw = fs.readFileSync(hotelsFilePath, 'utf8');
  // Naive extraction: look for module.exports = hotels at end and evaluate the file in a sandbox-like way
  // We'll execute in a Function scope to get `hotels` variable
  const wrapped = `(function(require){\n${raw}\nreturn hotels;\n})`;
  const hotels = eval(wrapped)(require);
  return Array.isArray(hotels) ? hotels : (hotels && hotels.data ? hotels.data : []);
}

function saveHotels(arr) {
  // Reconstruct the original file shape: module.exports = { data: [ ... ] }
  const header = `const { v4: uuid } = require('uuid');\n\nconst hotels = {\n  data: [\n`;
  const footer = `\n  ]\n}\n\nmodule.exports = hotels;\n`;

  const body = arr.map(h => {
    // stringify object with minimal formatting; preserve uuid() calls as literal when id is present
    const copy = { ...h };
    // convert id back to uuid() placeholder if it looks like a uuid
    if (copy.id && typeof copy.id === 'string') delete copy.id; // we will use uuid() in output
    const props = [];
    props.push(`id: uuid()`);
    for (const k of Object.keys(copy)) {
      const v = copy[k];
      const sval = typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v);
      props.push(`${k}: ${sval}`);
    }
    return '    {' + props.join(', ') + ' }';
  }).join(',\n');

  const out = header + body + footer;
  fs.writeFileSync(hotelsFilePath, out, 'utf8');
}

function main() {
  const arr = loadHotels();
  const counts = {};
  arr.forEach(h => { if (h && h.category) counts[h.category] = (counts[h.category] || 0) + 1; });

  const toAdd = [];
  categories.forEach(cat => {
    const have = counts[cat] || 0;
    for (let i = have + 1; i <= 25; i++) {
      const baseName = `${cat} Manual ${i}`;
      // ensure uniqueness: if same name exists, append a suffix
      let name = baseName;
      let suffix = 1;
  while ((arr.find(x => x && x.name === name && x.category === cat)) || (toAdd.find(x => x && x.name === name && x.category === cat))) {
        name = `${baseName} (${suffix++})`;
      }

      toAdd.push({
        id: uuid(),
        name,
        category: cat,
        image: 'https://images.unsplash.com/photo-1505691723518-36a5b5d2b2d8?auto=format&fit=crop&w=1200&q=80',
        imageArr: ['https://images.unsplash.com/photo-1505691723518-36a5b5d2b2d8?auto=format&fit=crop&w=720&q=60'],
        address: `${cat} Road ${i}`,
        city: `${cat} City`,
        state: 'State',
        country: 'India',
        price: 2999,
        rating: 4.0,
        numberOfBathrooms: 1,
        numberOfBeds: 1,
        numberOfguest: 2,
        numberOfBedrooms: 1,
        numberOfStudies: 0,
        hostName: `${cat} Host`,
        hostJoinedOn: 'Jan 2020',
        ameneties: ['Wifi'],
        healthAndSafety: ['Smoke alarm'],
        houseRules: ['Check-in after 2pm'],
        propertyType: cat,
        isCancelable: true,
      });
    }
  });

  if (toAdd.length === 0) {
    console.log('Nothing to add; every category has 25 or more.');
    return;
  }

  console.log('Adding', toAdd.length, 'hotels.');
  const newArr = arr.concat(toAdd);
  saveHotels(newArr);
  console.log('Wrote', newArr.length, 'hotels to data/hotels.js');
}

main();
