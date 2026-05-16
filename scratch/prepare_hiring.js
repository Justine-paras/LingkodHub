import Database from 'better-sqlite3';
import path from 'path';
const db = new Database('database.sqlite');

// Make provider (ID 4) apply to job 4 and 5
const jobs = [4, 5];
const providerId = 4;

for (const jobId of jobs) {
  try {
    db.prepare('INSERT INTO applications (job_id, provider_id, message) VALUES (?, ?, ?)')
      .run(jobId, providerId, 'I am ready to help with this cleaning task!');
    console.log(`Provider 4 applied to job ${jobId}`);
  } catch (e) {
    console.log(`Provider 4 already applied to job ${jobId} or job not found`);
  }
}
