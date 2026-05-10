import fs from 'fs';

const filePath = 'src/components/DashboardLayout.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// replace text-white everywhere except when surrounded by text-brand-primary etc
// actually, let's just do a replace, and then manually run `text-white` back on buttons
content = content.replace(/text-white/g, 'text-brand-text-main');

// But "bg-brand-primary text-white" is a common combo. Let's make sure the `text-brand-text-main` changes back to `text-white` for primary buttons.
content = content.replace(/bg-brand-primary text-brand-text-main/g, 'bg-brand-primary text-white');
// Also wait: hover:text-white might be better as hover:text-brand-text-main. And we did replace it! `hover:text-brand-text-main` works beautifully.

fs.writeFileSync(filePath, content, 'utf-8');
