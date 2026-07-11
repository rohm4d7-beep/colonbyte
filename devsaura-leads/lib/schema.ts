import { z } from "zod";

export const leadFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  whatsapp: z
    .string()
    .min(7, "WhatsApp number too short")
    .regex(/^\+[1-9]\d{6,14}$/, "Include country code (e.g. +1234567890)"),
  service: z.enum(["Web Development", "SaaS", "E-commerce", "Other"], {
    error: "Please select a service",
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export interface Lead extends LeadFormData {
  id: string;
  createdAt: string;
}
