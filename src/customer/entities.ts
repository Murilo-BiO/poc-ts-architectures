import { z } from "zod";
import { Schema } from "utils/schema";
import { userId } from "user/entities";

// Customer Id
const customerId = z.string().min(1).trim()
export const customerIdSchema = Schema.from(customerId)

// Customer
const customer = z.object({
  id: customerId,
  name: z.string(),
  creationDate: z.date(),
  createdBy: userId,
  deleted: z.boolean(),
  updatedAt: z.date(),
  updatedBy: userId,
})
export type Customer = z.infer<typeof customer>
export const customerSchema = Schema.from(customer)

// Customer Creation
const customerCreationPayload = z.object({
  name: z.string(),
})
export type CustomerCreationPayload = z.infer<typeof customerCreationPayload>
export const customerCreationPayloadSchema = Schema.from(customerCreationPayload)

// Customer Update
const customerUpdatePayload = z.object({
  name: z.string().optional(), // for now, is the only item but in the future could be more and work like a patch.
})
export type CustomerUpdatePayload = z.infer<typeof customerUpdatePayload>
export const customerUpdatePayloadSchema = Schema.from(customerUpdatePayload)
