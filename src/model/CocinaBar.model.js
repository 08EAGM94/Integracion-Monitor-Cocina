import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

class CocinaBar extends Model{}

CocinaBar.init({
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    IdComanda: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Fecha: {
        type: DataTypes.DATE,
        allowNull: true
    },
    IdProductos: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    IdEstado: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    IdTipo: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Prioridad: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    IdZonaProduccion: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
},{
    //se evita crear la pluralización del nombre de la tabla
    freezeTableName: true,
    sequelize,
    //se trata de un modelo existente en la base de datos, aqui le indicamos a sequelize que 
    //si busca la coincidencia que le indicamos no creará desde cero la tabla en cuestión
    modelName: "CocinaBar",
    //evita que se registre una fecha de creación en la base de datos
    timestamps: false
});

export default CocinaBar;
