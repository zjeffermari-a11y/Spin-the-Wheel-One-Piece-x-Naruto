const fs = require('fs');
let code = fs.readFileSync('src/utils/supabaseClient.js', 'utf8');

code = code.replace(
`      select: () => {
        return {
          eq: (field, val) => {
            return {
              order: () => Promise.resolve({ data: store.get(table).filter(item => item[field] === val || val === undefined), error: null })
            }
          }
        }
      },`,
`      select: () => {
        return {
          eq: (field, val) => {
            return {
              order: () => Promise.resolve({ data: store.get(table).filter(item => item[field] === val || val === undefined), error: null })
            }
          },
          order: () => Promise.resolve({ data: store.get(table), error: null })
        }
      },`
);

fs.writeFileSync('src/utils/supabaseClient.js', code);
