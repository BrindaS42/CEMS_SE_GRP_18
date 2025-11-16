import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z.string().refine((val) => {
  return mongoose.Types.ObjectId.isValid(val);
}, { message: 'Invalid college ID format' });

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['student', 'organizer', 'admin', 'sponsor'], { // <-- UPDATED
      errorMap: () => ({ message: 'Role must be student, organizer, admin, or sponsor' })
    }),
    college: z.string().optional(),
  }).superRefine((data, ctx) => {
    const { role, college } = data;

    if ((role === 'student' || role === 'organizer')) {
      if (!college) {
        // If role is student/organizer, college is required
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'College is required for student and organizer roles',
          path: ['college'],
        });
      } else {
        // If college is provided, it must be a valid ObjectId
        const validation = objectIdValidator.safeParse(college);
        if (!validation.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid college ID format',
            path: ['college'],
          });
        }
      }
    }

    if ((role === 'admin' || role === 'sponsor') && college) {
      // Admin and sponsor roles should not have a college
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Admin and sponsor roles should not have a college',
        path: ['college'],
      });
    }
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['student', 'organizer', 'admin', 'sponsor'], { // <-- UPDATED
      errorMap: () => ({ message: 'Role must be student, organizer, admin, or sponsor' })
    }),
  }),
});