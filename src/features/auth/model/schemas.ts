import type { TFunction } from 'i18next';
import { z } from 'zod';

const passwordFitsBcrypt = (value: string) => new TextEncoder().encode(value).length <= 72;

const passwordSchema = z
  .string()
  .min(8, 'validation.passwordMin')
  .regex(/[a-z]/, 'validation.passwordLowercase')
  .regex(/[A-Z]/, 'validation.passwordUppercase')
  .regex(/\d/, 'validation.passwordNumber')
  .regex(/[^A-Za-z0-9]/, 'validation.passwordSymbol')
  .refine(passwordFitsBcrypt, 'validation.passwordBytes');

const signInSchema = z.object({
  email: z.email('validation.email').max(254),
  password: z
    .string()
    .min(1, 'validation.passwordRequired')
    .refine(passwordFitsBcrypt, 'validation.passwordBytes'),
  rememberMe: z.boolean(),
});

const signUpSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'validation.usernameMin')
      .max(32, 'validation.usernameMax'),
    email: z.email('validation.email').max(254),
    password: passwordSchema,
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine(Boolean, 'validation.terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.passwordMismatch',
  });

const emailSchema = z.object({ email: z.email('validation.email').max(254) });

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.passwordMismatch',
  });

const validationMessage = (t: TFunction<'auth'>, message: string | undefined) =>
  message === undefined ? undefined : (t as unknown as (key: string) => string)(message);

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export {
  emailSchema,
  passwordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  validationMessage,
};
export type { EmailFormValues, ResetPasswordFormValues, SignInFormValues, SignUpFormValues };
