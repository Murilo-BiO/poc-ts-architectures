import { z } from 'zod';

const envVariables = z.object({
  HOST: z.string(),
  PORT: z.string().regex(/^[0-9]+$/),
  SESSION_SECRET: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
process.env.HOST
export {};
