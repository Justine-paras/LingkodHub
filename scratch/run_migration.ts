import db from '../db.js';
try {
  console.log('Adding column verification_selfie_url...');
  db.exec('ALTER TABLE users ADD COLUMN verification_selfie_url TEXT');
  console.log('Success!');
} catch (err) {
  console.error('Error adding column:', err);
}
