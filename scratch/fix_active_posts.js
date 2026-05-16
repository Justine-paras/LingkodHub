import fs from 'fs';
let content = fs.readFileSync('src/components/dashboard/client/ActivePostsSection.tsx', 'utf8');

// Fix date input
content = content.replace(
  /type="datetime-local"\s*\n\s*value=\{formDate\}/g,
  'type="datetime-local"\n                                        value={formDate}\n                                        min={new Date().toISOString().slice(0, 16)}'
);

// Fix buttons
content = content.replace(
  /<button\s*\n\s*onClick=\{\(\) => setFormPayment\('gcash'\)\}/g,
  '<button\n                                     type="button"\n                                     onClick={() => setFormPayment(\'gcash\')}'
);
content = content.replace(
  /<button\s*\n\s*onClick=\{\(\) => setFormPayment\('maya'\)\}/g,
  '<button\n                                     type="button"\n                                     onClick={() => setFormPayment(\'maya\')}'
);

fs.writeFileSync('src/components/dashboard/client/ActivePostsSection.tsx', content);
console.log('Successfully updated ActivePostsSection.tsx');
