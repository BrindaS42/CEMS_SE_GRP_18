import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (mailOptions) => {
  // Parse the from field - handle both string and object formats
  let fromEmail = mailOptions.from || process.env.SENDGRID_FROM_EMAIL;
  let fromName = 'Campus Event Manager';
  
  // If from is a string like "Name <email@domain.com>", parse it
  if (typeof fromEmail === 'string') {
    const match = fromEmail.match(/^"?([^"<]*)"?\s*<(.+)>$/);
    if (match) {
      fromName = match[1].trim();
      fromEmail = match[2].trim();
    }
  }

  // Clean up any whitespace
  fromEmail = fromEmail?.trim();

  console.log('Attempting to send email with:', { to: mailOptions.to, from: fromEmail, subject: mailOptions.subject });

  const msg = {
    to: mailOptions.to,
    from: {
      email: fromEmail,
      name: fromName
    },
    subject: mailOptions.subject,
    html: mailOptions.html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully via SendGrid');
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};

console.log('SendGrid is configured and ready to send emails.');

export default { sendMail: sendEmail };