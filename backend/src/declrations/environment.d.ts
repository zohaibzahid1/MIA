// src/database/environment.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    // PostgreSQL Database Configuration
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_USER: string;
    DATABASE_PASSWORD: string;
    DATABASE_NAME: string;

    // Microsoft Azure SSO Configuration
    MICROSOFT_TENANT_ID: string;
    MICROSOFT_CLIENT_ID: string;
    MICROSOFT_CLIENT_SECRET: string;
    MICROSOFT_CALLBACK_URL: string;

    // Application Environment
    NODE_ENV: 'development' | 'production';
    PORT: string;
    DEFAULT_ROLE: string;

    // JWT Authentication
    JWT_SECRET: string;
    ACCESS_TOKEN_EXPIRATION: string;

    // Frontend Configuration
    FRONTEND_URL: string;
    FRONTEND_URL_REDIRECT: string;
  }
}
