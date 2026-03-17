import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

class Clientes extends Model{}

Clientes.init({
    ID:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Nombre:{
        type: DataTypes.STRING(150),
        allowNull: true
    },
    ApellidoPaterno: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    ApellidoMaterno: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    Correo: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    Password:{
        type: DataTypes.STRING(300),
        allowNull: true
    },
    Frecuente:{
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    Status:{
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    Telefono:{
        type: DataTypes.STRING(20),
        allowNull: true
    }
},{
    //se evita crear la pluralización del nombre de la tabla
    freezeTableName: true,
    sequelize,
    //se trata de un modelo existente en la base de datos, aqui le indicamos a sequelize que 
    //si busca la coincidencia que le indicamos no creará desde cero la tabla en cuestión
    modelName: "Clientes",
    //evita que se registre una fecha de creación en la base de datos
    timestamps: false
});

export default Clientes;
