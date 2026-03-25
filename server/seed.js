const mongoose = require('mongoose');
const School = require('./models/School');
const Standard = require('./models/Standard');
const UniformItem = require('./models/UniformItem');
require('dotenv').config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arihant_store');
    console.log('Connected to MongoDB for seeding...');

    // Clear all collections
    await School.deleteMany({});
    await Standard.deleteMany({});
    await UniformItem.deleteMany({});

    console.log('🗑️  Cleared existing data.');

    // ─────────────────────────────────────────────
    // 1. SCHOOLS
    // ─────────────────────────────────────────────
    const schools = await School.insertMany([
      { name: 'Delhi Public School', board: 'CBSE', city: 'New Delhi', state: 'Delhi', logo: '/images/dps-logo.webp', banner: '/images/school-banner.png' },
      { name: "St. Xavier's High School", board: 'ICSE', city: 'Mumbai', state: 'Maharashtra', logo: '/images/xavier-logo.webp', banner: '/images/school-banner.png' },
      { name: 'Kendriya Vidyalaya', board: 'CBSE', city: 'Bangalore', state: 'Karnataka', logo: '/images/kv-logo.webp', banner: '/images/school-banner.png' },
      { name: 'Modern Academy', board: 'ICSE', city: 'Lucknow', state: 'Uttar Pradesh', logo: '/images/modern-logo.webp', banner: '/images/school-banner.png' },
      { name: 'Holy Cross School', board: 'State', city: 'Chennai', state: 'Tamil Nadu', logo: '/images/holycross-logo.webp', banner: '/images/school-banner.png' }
    ]);
    console.log(`✅ Inserted ${schools.length} schools.`);

    // Helper to find school by name
    const findSchool = (name) => schools.find(s => s.name === name);

    // ─────────────────────────────────────────────
    // 2. STANDARDS
    // ─────────────────────────────────────────────
    const standardsData = [];

    // DPS — Grade 1-5 boy/girl, Grade 6-10 boy/girl
    for (let i = 1; i <= 5; i++) {
      standardsData.push({ school: findSchool('Delhi Public School')._id, className: `Grade ${i}`, gender: 'boy' });
      standardsData.push({ school: findSchool('Delhi Public School')._id, className: `Grade ${i}`, gender: 'girl' });
    }
    for (let i = 6; i <= 10; i++) {
      standardsData.push({ school: findSchool('Delhi Public School')._id, className: `Grade ${i}`, gender: 'boy' });
      standardsData.push({ school: findSchool('Delhi Public School')._id, className: `Grade ${i}`, gender: 'girl' });
    }

    // St. Xavier's — Grade 1-8 unisex
    for (let i = 1; i <= 8; i++) {
      standardsData.push({ school: findSchool("St. Xavier's High School")._id, className: `Grade ${i}`, gender: 'unisex' });
    }

    // KV — Grade 1-12 boy/girl
    for (let i = 1; i <= 12; i++) {
      standardsData.push({ school: findSchool('Kendriya Vidyalaya')._id, className: `Grade ${i}`, gender: 'boy' });
      standardsData.push({ school: findSchool('Kendriya Vidyalaya')._id, className: `Grade ${i}`, gender: 'girl' });
    }

    // Modern Academy — Grade 1-5 unisex
    for (let i = 1; i <= 5; i++) {
      standardsData.push({ school: findSchool('Modern Academy')._id, className: `Grade ${i}`, gender: 'unisex' });
    }

    // Holy Cross — Grade 1-10 boy/girl
    for (let i = 1; i <= 10; i++) {
      standardsData.push({ school: findSchool('Holy Cross School')._id, className: `Grade ${i}`, gender: 'boy' });
      standardsData.push({ school: findSchool('Holy Cross School')._id, className: `Grade ${i}`, gender: 'girl' });
    }

    const standards = await Standard.insertMany(standardsData);
    console.log(`✅ Inserted ${standards.length} standards.`);

    // ─────────────────────────────────────────────
    // 3. UNIFORM ITEMS
    // ─────────────────────────────────────────────
    const sizesSmall = [
      { size: '22', stock: 10 }, { size: '24', stock: 15 }, { size: '26', stock: 20 },
      { size: '28', stock: 12 }, { size: '30', stock: 8 }
    ];
    const sizesMedium = [
      { size: '28', stock: 10 }, { size: '30', stock: 15 }, { size: '32', stock: 20 },
      { size: '34', stock: 12 }, { size: '36', stock: 8 }
    ];
    const sizesAccessory = [
      { size: 'S', stock: 25 }, { size: 'M', stock: 30 }, { size: 'L', stock: 20 }
    ];

    const uniformItemsData = [];

    // Helper: create item template for a set of standards
    const addItemsForStandards = (schoolName, genderFilter, items) => {
      const schoolStandards = standards.filter(s => {
        const school = schools.find(sc => sc._id.equals(s.school));
        return school && school.name === schoolName && (genderFilter === null || s.gender === genderFilter);
      });

      for (const std of schoolStandards) {
        for (const item of items) {
          uniformItemsData.push({ ...item, standard: std._id });
        }
      }
    };

    // ── DPS Boys ──
    addItemsForStandards('Delhi Public School', 'boy', [
      { itemType: 'shirt', itemName: 'DPS White Shirt', description: 'Crisp white cotton shirt with DPS monogram', price: 650, sizes: sizesSmall, imageUrl: '/images/dps-shirt.webp' },
      { itemType: 'pant', itemName: 'DPS Grey Trouser', description: 'Grey formal trouser with elastic waist', price: 550, sizes: sizesSmall, imageUrl: '/images/dps-pant.webp' },
      { itemType: 'tie', itemName: 'DPS Striped Tie', description: 'Navy blue and gold striped tie', price: 200, sizes: sizesAccessory, imageUrl: '/images/dps-tie.webp' },
      { itemType: 'belt', itemName: 'DPS Leather Belt', description: 'Black leather belt with DPS buckle', price: 250, sizes: sizesAccessory, imageUrl: '/images/dps-belt.webp' },
      { itemType: 'socks', itemName: 'DPS White Socks', description: 'White ankle-length cotton socks (pair)', price: 80, sizes: sizesAccessory, imageUrl: '/images/dps-socks.webp' }
    ]);

    // ── DPS Girls ──
    addItemsForStandards('Delhi Public School', 'girl', [
      { itemType: 'shirt', itemName: 'DPS White Blouse', description: 'White cotton blouse with Peter Pan collar', price: 650, sizes: sizesSmall, imageUrl: '/images/dps-shirt.webp' },
      { itemType: 'skirt', itemName: 'DPS Grey Skirt', description: 'Grey pleated skirt with elastic waist', price: 600, sizes: sizesSmall, imageUrl: '/images/dps-skirt.webp' },
      { itemType: 'tie', itemName: 'DPS Ribbon Tie', description: 'Navy blue ribbon tie', price: 180, sizes: sizesAccessory, imageUrl: '/images/dps-tie.webp' },
      { itemType: 'socks', itemName: 'DPS White Socks', description: 'White knee-length cotton socks (pair)', price: 90, sizes: sizesAccessory, imageUrl: '/images/dps-socks.webp' }
    ]);

    // ── St. Xavier's Unisex ──
    addItemsForStandards("St. Xavier's High School", 'unisex', [
      { itemType: 'shirt', itemName: "Xavier's Blue Shirt", description: 'Sky blue half-sleeve shirt', price: 700, sizes: sizesSmall, imageUrl: '/images/xavier-shirt.webp' },
      { itemType: 'pant', itemName: "Xavier's Navy Trouser", description: 'Navy blue formal trouser', price: 600, sizes: sizesSmall, imageUrl: '/images/xavier-pant.webp' },
      { itemType: 'tie', itemName: "Xavier's Red Tie", description: 'Maroon and gold striped tie', price: 220, sizes: sizesAccessory, imageUrl: '/images/xavier-tie.webp' }
    ]);

    // ── KV Boys ──
    addItemsForStandards('Kendriya Vidyalaya', 'boy', [
      { itemType: 'shirt', itemName: 'KV White Shirt', description: 'White shirt with KV logo', price: 500, sizes: sizesMedium, imageUrl: '/images/kv-shirt.webp' },
      { itemType: 'pant', itemName: 'KV Blue Trouser', description: 'Navy blue trouser', price: 480, sizes: sizesMedium, imageUrl: '/images/kv-pant.webp' },
      { itemType: 'tie', itemName: 'KV Blue Tie', description: 'Blue and white striped tie', price: 150, sizes: sizesAccessory, imageUrl: '/images/kv-tie.webp' }
    ]);

    // ── KV Girls ──
    addItemsForStandards('Kendriya Vidyalaya', 'girl', [
      { itemType: 'shirt', itemName: 'KV White Blouse', description: 'White blouse with KV logo', price: 500, sizes: sizesMedium, imageUrl: '/images/kv-shirt.webp' },
      { itemType: 'skirt', itemName: 'KV Blue Skirt', description: 'Navy blue pleated skirt', price: 520, sizes: sizesMedium, imageUrl: '/images/kv-skirt.webp' },
      { itemType: 'tie', itemName: 'KV Blue Tie', description: 'Blue and white striped tie', price: 150, sizes: sizesAccessory, imageUrl: '/images/kv-tie.webp' }
    ]);

    // ── Modern Academy Unisex ──
    addItemsForStandards('Modern Academy', 'unisex', [
      { itemType: 'shirt', itemName: 'Modern Academy Cream Shirt', description: 'Off-white cotton shirt', price: 750, sizes: sizesSmall, imageUrl: '/images/modern-shirt.webp' },
      { itemType: 'pant', itemName: 'Modern Academy Brown Trouser', description: 'Chocolate brown trouser', price: 650, sizes: sizesSmall, imageUrl: '/images/modern-pant.webp' },
      { itemType: 'belt', itemName: 'Modern Academy Brown Belt', description: 'Brown leather belt', price: 280, sizes: sizesAccessory, imageUrl: '/images/modern-belt.webp' }
    ]);

    // ── Holy Cross Boys ──
    addItemsForStandards('Holy Cross School', 'boy', [
      { itemType: 'shirt', itemName: 'Holy Cross White Shirt', description: 'White full-sleeve shirt with logo', price: 600, sizes: sizesSmall, imageUrl: '/images/hc-shirt.webp' },
      { itemType: 'pant', itemName: 'Holy Cross Grey Trouser', description: 'Charcoal grey trouser', price: 550, sizes: sizesSmall, imageUrl: '/images/hc-pant.webp' },
      { itemType: 'tie', itemName: 'Holy Cross Maroon Tie', description: 'Maroon solid tie', price: 200, sizes: sizesAccessory, imageUrl: '/images/hc-tie.webp' }
    ]);

    // ── Holy Cross Girls ──
    addItemsForStandards('Holy Cross School', 'girl', [
      { itemType: 'shirt', itemName: 'Holy Cross White Blouse', description: 'White blouse with lace collar', price: 620, sizes: sizesSmall, imageUrl: '/images/hc-shirt.webp' },
      { itemType: 'skirt', itemName: 'Holy Cross Grey Skirt', description: 'Charcoal grey pinafore skirt', price: 580, sizes: sizesSmall, imageUrl: '/images/hc-skirt.webp' },
      { itemType: 'socks', itemName: 'Holy Cross White Socks', description: 'White knee-high socks (pair)', price: 90, sizes: sizesAccessory, imageUrl: '/images/hc-socks.webp' }
    ]);

    await UniformItem.insertMany(uniformItemsData);
    console.log(`✅ Inserted ${uniformItemsData.length} uniform items.`);

    console.log('\n🎉 Database seeded successfully!');
    console.log(`   📚 ${schools.length} Schools`);
    console.log(`   🎓 ${standards.length} Standards`);
    console.log(`   👔 ${uniformItemsData.length} Uniform Items`);

    process.exit();
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedDB();
