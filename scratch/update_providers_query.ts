import fs from 'fs';
import path from 'path';

const filePath = path.resolve('routes/providers.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the SQL in GET / (searchable directory)
const searchSqlRegex = /let sql = `[\s\S]*?`[\s\S]*?const params: any\[\] = \[\];/;
const searchSqlReplacement = `let sql = \`
    SELECT u.id, u.full_name, u.avatar_url, u.location, u.about_me, u.created_at, u.is_documents_verified,
      u.gcash_number, u.maya_number, u.service_radius,
      GROUP_CONCAT(s.name, ', ') AS services,
      COALESCE(r.avg_rating, 0) AS avg_rating,
      COALESCE(r.total_reviews, 0) AS total_reviews
    FROM users u
    LEFT JOIN (
      SELECT reviewee_id, AVG(rating) AS avg_rating, COUNT(*) AS total_reviews
      FROM reviews
      GROUP BY reviewee_id
    ) r ON u.id = r.reviewee_id
    LEFT JOIN provider_services ps ON u.id = ps.provider_id
    LEFT JOIN services s ON ps.service_id = s.id
    WHERE u.role = 'provider'
  \`;
  const params: any[] = [];`;

content = content.replace(searchSqlRegex, searchSqlReplacement);

// Update query parameter matching for 'q' to exclude username
content = content.replace(
  'OR LOWER(u.username) LIKE LOWER(?) ',
  ''
);
content = content.replace(
  'params.push(`%${q}%`, `%${q}%`, `%${q}%`);',
  'params.push(`%${q}%`, `%${q}%`);'
);

// Replace the SQL in GET /:id (public profile)
const publicProfileRegex = /const provider = db\.prepare\(`[\s\S]*?`\)\.get\(req\.params\.id\);/;
const publicProfileReplacement = `const provider = db.prepare(\`
    SELECT u.id, u.full_name, u.avatar_url, u.location, u.about_me, u.created_at, u.is_documents_verified,
      u.gcash_number, u.maya_number, u.service_radius,
      GROUP_CONCAT(s.name, ', ') AS services,
      COALESCE(r.avg_rating, 0) AS avg_rating,
      COALESCE(r.total_reviews, 0) AS total_reviews
    FROM users u
    LEFT JOIN (
      SELECT reviewee_id, AVG(rating) AS avg_rating, COUNT(*) AS total_reviews
      FROM reviews
      GROUP BY reviewee_id
    ) r ON u.id = r.reviewee_id
    LEFT JOIN provider_services ps ON u.id = ps.provider_id
    LEFT JOIN services s ON ps.service_id = s.id
    WHERE u.id = ? AND u.role = 'provider'
    GROUP BY u.id
  \`).get(req.params.id);`;

content = content.replace(publicProfileRegex, publicProfileReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated providers route query for real rating calculations!');
