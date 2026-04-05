import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['Viewer', 'Analyst', 'Admin']).optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const createRecordSchema = z.object({
    amount: z.number().refine((val) => val !== 0, { message: "Amount cannot be zero" }),
    type: z.enum(['Income', 'Expense']),
    category: z.string().min(1, "Category is required"),
    notes: z.string().optional().default(""),
    date: z.string().or(z.date()).optional()
});