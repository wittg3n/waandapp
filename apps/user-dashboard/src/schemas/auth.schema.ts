import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'ایمیل را وارد کنید').email('ایمیل معتبر نیست'),
  password: z.string().min(1, 'رمز عبور را وارد کنید'),
  remember: z.boolean(),
});

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'نام و نام خانوادگی را وارد کنید'),
    email: z.string().trim().min(1, 'ایمیل را وارد کنید').email('ایمیل معتبر نیست'),
    password: z.string().min(8, 'رمز عبور باید حداقل ۸ نویسه باشد'),
    passwordConfirmation: z.string().min(1, 'تکرار رمز عبور را وارد کنید'),
    termsAccepted: z.boolean().refine(Boolean, 'پذیرش قوانین و شرایط الزامی است'),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: 'تکرار رمز عبور مطابقت ندارد',
    path: ['passwordConfirmation'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
