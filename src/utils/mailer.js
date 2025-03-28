const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(email, token) {
  const verifyUrl = `https://www.kingdomstats.com/auth/verify/${token}`;

  try {
    await resend.emails.send({
      from: 'KingdomStats <noreply@mail.kingdomstats.com>', // Use your verified domain
      to: email,
      subject: 'Verify your email for KingdomStats',
      html: `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to KingdomStats</title>
  </head>
  <body style="background-color: #000000; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table
            border="0"
            cellpadding="40"
            cellspacing="0"
            width="600"
            style="background-color: #3d0000; color: #ffffff; font-family: Arial, sans-serif; text-align: center;"
          >
            <tr>
              <td>
                <h2 style="margin-top: 0; font-size: 24px;">
                  Welcome to KingdomStats 👑
                </h2>
                <p style="font-size: 16px; line-height: 1.5;">
                  You're officially part of something bigger.<br /><br />
                  At KingdomStats, we believe in giving you the tools to grow,
                  improve, and gain the competitive edge you’ve been looking for.
                </p>

                <p style="margin: 30px 0;">
                  <a
                    href="${verifyUrl}"
                    style="
                      background-color: #000000;
                      color: #ffffff;
                      text-decoration: none;
                      padding: 12px 24px;
                      border-radius: 4px;
                      font-weight: bold;
                      display: inline-block;
                    "
                  >
                    Verify My Email
                  </a>
                </p>

                <p style="font-size: 14px; color: #dddddd;">
                  This is just the beginning.<br />
                  From advanced stat tracking to personalized insights, your
                  journey starts now.
                </p>

                <hr style="border: none; border-top: 1px solid #660000; margin: 30px 0;" />

                <p style="font-size: 12px; color: #bbbbbb;">
                  If you didn’t create a KingdomStats account, no action is needed.<br />
                  This message was sent on behalf of Kingdom Corporation.
                </p>
                <p style="font-size: 12px; color: #bbbbbb;">
                  KingdomStats is a subsidiary of Kingdom Corporation. All participation is voluntary—
                  <em>until it's not</em>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

        `,
    });

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}
async function sendEmail(to, subject, body) {
  try {
    await resend.emails.send({
      from: 'KingdomStats <noreply@mail.kingdomstats.com>',
      to,
      subject,
      html: `<div>${body.replace(/\n/g, '<br>')}</div>`
    });
  } catch (err) {
    console.error('Resend email error:', err);
    throw err;
  }
}

module.exports = {
  sendVerificationEmail,
  sendEmail,
};
