import { Sequelize } from "sequelize";
import { SQLSERVER_DB, SQLSERVER_USER, SQLSERVER_PWD, SQLSERVER_HOST, SQLSERVER_PORT } from "./config";

export const sequelize = new Sequelize(SQLSERVER_DB, SQLSERVER_USER, `${SQLSERVER_PWD}`, {
    dialect: "mssql",
    host: SQLSERVER_HOST, 
    port: SQLSERVER_PORT     
});

export async function testConnection(){
    try{
        /*
        sequelize.authenticate() method is used to test if the connection to the database has been established successfully. 
        It executes a simple query (e.g., SELECT 1+1 AS result) to verify that the configured credentials and settings are valid 
        and that Sequelize can communicate with the database.
        */
        await sequelize.authenticate();
        console.log("All good!!!");
    }catch(err){
        console.log("All bad", err);
    }
}
