import { Sequelize } from "sequelize";
import { SQLSERVER_DB_TEST, SQLSERVER_USER, SQLSERVER_PWD, SQLSERVER_HOST, SQLSERVER_PORT } from "../config";

export const sequelize = new Sequelize(SQLSERVER_DB_TEST, SQLSERVER_USER, `${SQLSERVER_PWD}`, {
    dialect: "mssql",
    host: SQLSERVER_HOST, 
    port: SQLSERVER_PORT,
    //define options due the new security standar on SQL server
    dialectOptions: {
        options: {
        encrypt: true,
        trustServerCertificate: true
        }
    }
});