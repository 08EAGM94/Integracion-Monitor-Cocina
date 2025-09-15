import { Sequelize } from "sequelize";
import { SQLSERVER_DB, SQLSERVER_USER, SQLSERVER_PWD, SQLSERVER_HOST, SQLSERVER_PORT } from "./config";

export const sequelize = new Sequelize(SQLSERVER_DB, SQLSERVER_USER, `${SQLSERVER_PWD}`, {
    dialect: "mssql",
    host: SQLSERVER_HOST, 
    port: SQLSERVER_PORT     
});

export async function testConnection(){
    try{
        await sequelize.authenticate();
        console.log("All good!!!");
    }catch(err){
        console.log("All bad", err);
    }
}