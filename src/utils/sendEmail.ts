import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '');

export const sendEmail = ({ to, from, subject, text, html }: any) => {
  return sendgrid.send({ to, from, subject, text, html });
};
