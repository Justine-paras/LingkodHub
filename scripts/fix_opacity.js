import fs from 'fs';

const filePath = 'src/components/DashboardLayout.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace('bg-white/[0.02]', 'bg-brand-text-main/[0.02]');
content = content.replace('border-white/5', 'border-brand-outline');
content = content.replace('bg-white/20', 'bg-brand-text-variant/20');
content = content.replace('bg-white/20', 'bg-brand-text-variant/20');
content = content.replace('border-white/5', 'border-brand-outline');

fs.writeFileSync(filePath, content, 'utf-8');
