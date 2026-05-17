import fs from 'fs';
import path from 'path';

const src = 'C:\\Users\\jpara\\.gemini\\antigravity\\brain\\1ab63317-9457-4221-9f94-236e1c45c20f\\.tempmediaStorage\\media_1ab63317-9457-4221-9f94-236e1c45c20f_1778996554032.png';
const dest = 'C:\\Users\\jpara\\Desktop\\tests\\sample.png';

try {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied to:', dest);
} catch (err) {
  console.error('Error copying file:', err);
}
