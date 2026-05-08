export class MissingEnvError extends Error {
  readonly variable: string;
  constructor(variable: string) {
    super(`Missing required environment variable: ${variable}`);
    this.variable = variable;
    this.name = "MissingEnvError";
  }
}

export function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new MissingEnvError(name);
  return v;
}

export function optionalEnv(name: string): string | undefined {
  const v = process.env[name];
  if (!v || !v.trim()) return undefined;
  return v;
}
