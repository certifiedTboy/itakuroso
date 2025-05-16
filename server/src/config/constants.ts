import * as dotenv from 'dotenv';
dotenv.config();

export const clientId = process.env.EMAIL_CLIENT_ID;
export const clientSecret = process.env.EMAIL_CLIENT_SECRET;
export const refreshToken = process.env.EMAIL_REFRESH_TOKEN;
export const accessToken = process.env.EMAIL_ACCESS_TOKEN;
export const redirectUri = process.env.EMAIL_REDIRECT_URI;
export const host = process.env.EMAIL_SMTP_HOST;
export const port = process.env.EMAIL_SMTP_PORT;
export const user = process.env.EMAIL_USER;
export const DB_URI = process.env.MONGO_URI;
