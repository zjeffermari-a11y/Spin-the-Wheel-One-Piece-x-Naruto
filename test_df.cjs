const categories = require('./src/data/categories.js');
console.log(categories.devilFruitDB.length);
console.log(categories.CATEGORIES.find(c => c.id === 'df_type').options.map(o => o.name));
