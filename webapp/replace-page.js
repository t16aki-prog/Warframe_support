const fs = require('fs');

try {
  let code = fs.readFileSync('e:/Oasobi/Warframe_spport/src/App.tsx', 'utf8');
  code = '"use client";\n' + code.replace(/import '\.\/App\.css';\r?\n/g, '');
  fs.writeFileSync('e:/Oasobi/webapp/src/app/page.tsx', code);
  console.log('Successfully wrote to page.tsx!');
} catch (e) {
  console.error('Error:', e);
}
