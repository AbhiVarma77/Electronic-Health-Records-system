import crypto from 'node:crypto';
import { z } from 'zod';

import { prisma } from '../db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import transporter from '../utils/mailer.js';
import {
  HeadersSchema,
  IdParamSchema,
  MessageSchema,
} from '../utils/schema.js';

const staffCoreSchema = {
  name: z.string().min(3).max(200),
  email: z.string().email(),
  phone: z.string().min(10).max(10),
};

const PasswordSchema = z.string().min(8);

const StaffResponseSchema = z.object({
  id: z.number(),
  ...staffCoreSchema,
});

const StaffCreateSchema = z.object({
  ...staffCoreSchema,
  password: PasswordSchema,
});

const StaffUpdateSchema = z.object(staffCoreSchema);

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
});

const LoginResponseSchema = z.intersection(
  StaffResponseSchema,
  z.object({
    token: z.string(),
  }),
);

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string(),
  password: z.string().min(8),
});

const VerifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string(),
});

const ChangePasswordSchema = z.object({
  password: PasswordSchema,
  newPassword: PasswordSchema,
});

const tags = ['Staff'];

async function forgotPasswordMail({ email, token }) {
  await transporter.sendMail({
    to: email,
    from: 'help@ums.dev',
    subject: 'Password Reset for UMS',
    html: `
        <p>You are receiving this because you (or someone else) have requested the reset
        of the password for your account.</p>

        <p>Please click on the following link, or paste this into your browser to complete
        the process within one hour of receiving it:</p>

        <p>http://localhost:3000/reset/${token}</p>`,
  });
}

async function verifyEmailMail({ email, token }) {
  await transporter.sendMail({
    to: email,
    from: 'help@ums.dev',
    subject: 'Verification Email',
    html: `
    <p>You are receiving this because you (or someone else) have requested the verification
    of your email for your account.</p>

    <p>Please click on the following link, or paste this into your browser to complete
    the process within one hour of receiving it:</p>

    <p>http://localhost:3000/verify/${token}</p>
    `,
  });
}

export async function staffRoutes(fastify) {
  fastify.post(
    '/signUp',
    {
      schema: {
        summary: 'Create a new staff',
        tags,
        body: StaffCreateSchema,
        response: { 201: StaffResponseSchema },
      },
    },
    async (request, reply) => {
      const { name, email, phone, password } = request.body;
      const { hash, salt } = hashPassword(password);
      const staff = await prisma.staff.create({
        data: {
          name,
          email,
          phone,
          hashedPassword: hash,
          salt,
        },
      });
      reply.status(201);
      reply.send(staff);
    },
  );

  fastify.post(
    '/login',
    {
      schema: {
        operationId: 'Login Staff',
        summary: 'Login Staff',
        tags,
        body: LoginRequestSchema,
        response: {
          201: LoginResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const staff = await prisma.staff.findUnique({
        where: {
          email,
        },
      });
      const loggedIn = verifyPassword({
        candidatePassword: password,
        salt: staff.salt,
        hash: staff.hashedPassword,
      });
      if (!loggedIn) {
        reply.status(401).send({ message: 'Invalid credentials' });
        return;
      }
      const token = fastify.jwt.sign({
        data: {
          id: staff.id,
          email: staff.email,
          name: staff.name,
        },
      });

      return reply.status(201).send({ ...staff, token });
    },
  );

  fastify.post(
    '/forgotPassword',
    {
      schema: {
        summary: 'Forgot Password',
        tags,
        body: ForgotPasswordSchema,
        response: {
          200: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;
      const staff = await prisma.staff.findUnique({
        where: {
          email,
        },
      });
      if (!staff) {
        reply.status(404).send({ message: 'Staff not found' });
        return;
      }
      const token = crypto.randomBytes(20).toString('hex');
      const tokenExpires = new Date(Date.now() + 3600000);
      await prisma.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          resetPasswordToken: token,
          resetPasswordExpires: tokenExpires,
        },
      });

      await forgotPasswordMail({ email, token });

      return {
        message: 'Password reset link sent to your email',
      };
    },
  );

  fastify.post(
    '/resetPassword',
    {
      schema: {
        summary: 'Reset Password',
        tags,
        body: ResetPasswordSchema,
        response: {
          200: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, token, password } = request.body;
      const staff = await prisma.staff.findUnique({
        where: {
          email,
        },
      });
      if (!staff) {
        reply.status(404).send({ message: 'Staff not found' });
        return;
      }
      if (staff.resetPasswordToken !== token) {
        reply.status(401).send({ message: 'Invalid token' });
        return;
      }

      const { hash, salt } = hashPassword(password);
      await prisma.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          hashedPassword: hash,
          salt,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      return {
        message: 'Password reset successful',
      };
    },
  );

  fastify.post(
    '/sendVerificationEmail',
    {
      schema: {
        summary: 'Send Verification Email',
        tags,
        body: ForgotPasswordSchema,
        response: {
          200: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;
      const staff = await prisma.staff.findUnique({
        where: {
          email,
        },
      });
      if (!staff) {
        reply.status(404).send({ message: 'Staff not found' });
        return;
      }
      if (staff.verifiedEmail) {
        reply.status(200).send({ message: 'Email already verified.' });
        return;
      }
      const token = crypto.randomBytes(20).toString('hex');
      const tokenExpires = new Date(Date.now() + 3600000);
      await prisma.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          verificationToken: token,
          verificationTokenExpires: tokenExpires,
        },
      });

      await verifyEmailMail({ email, token });

      return {
        message: 'Verification link sent to your email',
      };
    },
  );

  fastify.post(
    '/verifyEmail',
    {
      schema: {
        summary: 'Verify Email',
        tags,
        body: VerifyEmailSchema,
        response: {
          200: MessageSchema,
          401: MessageSchema,
          404: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, token } = request.body;
      const staff = await prisma.staff.findUnique({
        where: {
          email,
        },
      });
      if (!staff) {
        reply.status(404).send({ message: 'Staff not found' });
        return;
      }
      if (staff.verifiedEmail) {
        reply.status(200).send({ message: 'Email already verified.' });
        return;
      }
      if (staff.verificationToken !== token) {
        reply.status(401).send({ message: 'Invalid token' });
        return;
      }
      if (staff.verificationTokenExpires < new Date()) {
        reply.status(401).send({ message: 'Token expired' });
        return;
      }
      await prisma.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          verifiedEmail: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });
      return {
        message: 'Email verified successfully',
      };
    },
  );

  fastify.put(
    '/changePassword',
    {
      preHandler: [fastify.authenticate],
      schema: {
        summary: 'Change Password',
        tags,
        headers: HeadersSchema,
        body: ChangePasswordSchema,
        response: {
          200: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { password, newPassword } = request.body;
      fastify.log.info(request.staff.payload);
      const staff = await prisma.staff.findUnique({
        where: {
          id: request.user.data.id,
        },
      });
      const loggedIn = verifyPassword({
        candidatePassword: password,
        salt: staff.salt,
        hash: staff.hashedPassword,
      });
      if (!loggedIn) {
        reply.status(401).send({ message: 'Invalid credentials' });
        return;
      }
      const { hash, salt } = hashPassword(newPassword);
      await prisma.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          hashedPassword: hash,
          salt,
        },
      });
      return {
        message: 'Password changed successfully',
      };
    },
  );

  fastify.get(
    '/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        summary: 'Fetch staff',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        response: {
          200: StaffResponseSchema,
        },
      },
    },
    async (request, _reply) => {
      const staff = prisma.staff.findUnique({
        where: { id: request.params.id },
      });

      return staff;
    },
  );

  fastify.put(
    '',
    {
      preHandler: [fastify.authenticate],
      schema: {
        summary: 'Update Current Staff',
        tags,
        headers: HeadersSchema,
        body: StaffUpdateSchema,
        response: {
          204: z.object({}),
        },
      },
    },
    async (request, reply) => {
      await prisma.staff.update({
        where: { id: request.user.data.id },
        data: request.body,
      });
      return reply.status(204).send({});
    },
  );
}
