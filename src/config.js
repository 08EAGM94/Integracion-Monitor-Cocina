import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 3001;

export const SQLSERVER_DB = process.env.SQLSERVER_DB;
export const SQLSERVER_USER = process.env.SQLSERVER_USER;
export const SQLSERVER_PWD = process.env.SQLSERVER_PWD;
export const SQLSERVER_HOST = process.env.SQLSERVER_HOST;
export const SQLSERVER_PORT = process.env.SQLSERVER_PORT;