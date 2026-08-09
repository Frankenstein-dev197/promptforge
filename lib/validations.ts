import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  jobRole: z.string().min(2, "Select or type your role"),
  useCase: z.string().min(2, "Tell us your main use case"),
});

export const promptSchema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().max(500).optional().nullable(),
  content: z.string().min(10, "Prompt content is too short"),
  model: z.string().min(1),
  collectionId: z.string().nullable().optional(),
  tags: z.array(z.string()).max(10).default([]),
});

export const collectionSchema = z.object({
  name: z.string().min(2, "Name is required").max(60),
  description: z.string().max(280).optional().nullable(),
  color: z.string().default("zinc"),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(60),
  jobRole: z.string().max(60).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type PromptInput = z.infer<typeof promptSchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
