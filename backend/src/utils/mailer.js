import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'dante.harber74@ethereal.email',
    pass: 'csbg6HEqdP6rGJYHcb',
  },
});

export default transporter;
