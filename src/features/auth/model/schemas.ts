import type { TFunction } from 'i18next';
import { z } from 'zod';

const passwordFitsBcrypt = (value: string) => new TextEncoder().encode(value).length <= 72;

const createPasswordSchema = (t: TFunction<'auth'>) =>
  z
    .string()
    .min(8, t('validation.passwordMin'))
    .regex(/[a-z]/, t('validation.passwordLowercase'))
    .regex(/[A-Z]/, t('validation.passwordUppercase'))
    .regex(/\d/, t('validation.passwordNumber'))
    .regex(/[^A-Za-z0-9]/, t('validation.passwordSymbol'))
    .refine(passwordFitsBcrypt, t('validation.passwordBytes'));

const createSignInSchema = (t: TFunction<'auth'>) =>
  z.object({
    email: z.email(t('validation.email')).max(254),
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .refine(passwordFitsBcrypt, t('validation.passwordBytes')),
    rememberMe: z.boolean(),
  });

const createSignUpSchema = (t: TFunction<'auth'>) =>
  z
    .object({
      username: z
        .string()
        .trim()
        .min(3, t('validation.usernameMin'))
        .max(32, t('validation.usernameMax')),
      email: z.email(t('validation.email')).max(254),
      password: createPasswordSchema(t),
      confirmPassword: z.string(),
      termsAccepted: z.boolean().refine(Boolean, t('validation.terms')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('validation.passwordMismatch'),
    });

const createEmailSchema = (t: TFunction<'auth'>) =>
  z.object({ email: z.email(t('validation.email')).max(254) });

const createResetPasswordSchema = (t: TFunction<'auth'>) =>
  z
    .object({
      password: createPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('validation.passwordMismatch'),
    });

type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>;
type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>;
type EmailFormValues = z.infer<ReturnType<typeof createEmailSchema>>;
type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;

export {
  createEmailSchema,
  createPasswordSchema,
  createResetPasswordSchema,
  createSignInSchema,
  createSignUpSchema,
};
export type { EmailFormValues, ResetPasswordFormValues, SignInFormValues, SignUpFormValues };
