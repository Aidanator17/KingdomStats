const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(email, token) {
  const verifyUrl = `http://localhost:3000/auth/verify/${token}`;

  try {
    await resend.emails.send({
      from: 'KingdomStats <noreply@mail.kingdomstats.com>', // Use your verified domain
      to: email,
      subject: 'Verify your email for KingdomStats',
      html: `
        <h2>Welcome to KingdomStats 👑</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
      `,
    });

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}

module.exports = { sendVerificationEmail };
