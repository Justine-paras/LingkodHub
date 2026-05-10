import fs from 'fs';

const filePath = 'src/components/DashboardLayout.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// We want to replace text-white with text-brand-text-main, EXCEPT when it's next to bg-brand-primary
// Or just replace all, then fix the buttons.
content = content.replace(/text-white/g, 'text-brand-text-main');
// Fix the buttons back
content = content.replace(/bg-brand-primary text-brand-text-main/g, 'bg-brand-primary text-white');

fs.writeFileSync(filePath, content, 'utf-8');
