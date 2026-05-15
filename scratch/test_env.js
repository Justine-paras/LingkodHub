import dotenv from 'dotenv';
dotenv.config();

console.log('EMAIL_USER:', JSON.stringify(process.env.EMAIL_USER));
console.log('EMAIL_PASS:', JSON.stringify(process.env.EMAIL_PASS));

if (process.env.EMAIL_USER && process.env.EMAIL_USER.startsWith(' ')) {
    console.log('ISSUE: EMAIL_USER has a leading space!');
}
if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.startsWith(' ')) {
    console.log('ISSUE: EMAIL_PASS has a leading space!');
}
