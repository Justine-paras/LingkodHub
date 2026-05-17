import db from '../db.js';
try {
  const tableInfo = db.prepare('PRAGMA table_info(users)').all();
  console.log('--- USERS TABLE COLUMNS ---');
  console.log(tableInfo);
  
  console.log('--- TESTING UPDATE STATEMENT ---');
  const testUpdate = db.prepare('UPDATE users SET verification_document_url = ?, verification_selfie_url = ?, is_documents_verified = ?, document_status = ? WHERE id = 1');
  console.log('Prepared successfully!');
} catch (err) {
  console.error('Error:', err);
}
