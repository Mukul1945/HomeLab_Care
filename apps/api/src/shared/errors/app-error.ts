export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fields: Record<string, string>;
  readonly expose: boolean;

  constructor(options: {
    statusCode: number;
    code: string;
    message: string;
    fields?: Record<string, string>;
    expose?: boolean;
  }) {
    super(options.message);
    this.name = 'AppError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.fields = options.fields ?? {};
    this.expose = options.expose ?? options.statusCode < 500;
  }
}
