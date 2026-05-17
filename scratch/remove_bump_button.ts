import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/components/dashboard/client/ActivePostsSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the ArrowUpCircle import if present (or we can keep/remove it cleanly)
content = content.replace('  ArrowUpCircle, \r\n', '');
content = content.replace('  ArrowUpCircle, \n', '');

// 2. Locate and replace the Bump button and the trash button container
const targetRegex = /<div className="flex gap-3">[\s\S]*?<button className="flex-1 py-3 bg-brand-surface hover:bg-brand-surface-card text-brand-text-main rounded-2xl font-black text-\[10px\] uppercase tracking-widest border border-brand-outline transition-all flex items-center justify-center gap-2">[\s\S]*?<ArrowUpCircle size=\{14\} className="text-brand-primary" \/> Bump[\s\S]*?<\/button>[\s\S]*?<button\s+onClick=\{\(\) => setShowDeleteModal\(job\)\}[\s\S]*?className="w-12 py-3 bg-brand-surface hover:bg-red-500 hover:text-white text-red-500 rounded-2xl border border-red-100 hover:border-red-500 transition-all flex items-center justify-center shadow-sm"[\s\S]*?>[\s\S]*?<Trash2 size=\{16\} \/>[\s\S]*?<\/button>[\s\S]*?<\/div>/;

if (targetRegex.test(content)) {
  const replacement = `<div className="flex gap-3 w-full">
                        <button 
                           onClick={() => setShowDeleteModal(job)}
                           className="w-full py-3.5 bg-brand-surface hover:bg-red-500 hover:text-white text-red-500 rounded-2xl border border-red-100 hover:border-red-500 transition-all flex items-center justify-center gap-2 shadow-sm font-black text-[10px] uppercase tracking-widest"
                        >
                           <Trash2 size={14} /> Delete Task
                        </button>
                     </div>`;
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully removed the bump button and updated the delete task button!');
} else {
  console.error('Target regex pattern was not matched in the file!');
}
