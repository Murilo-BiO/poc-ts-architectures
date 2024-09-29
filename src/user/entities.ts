import { z } from "zod";
import { Schema } from "utils/schema";

// User Id
export const userId = z.string().min(1).trim()
export const userIdSchema = Schema.from(userId)

// User
const user = z.object({
  id: userId,
})
export type User = z.infer<typeof user>
export const userSchema = Schema.from(user)
