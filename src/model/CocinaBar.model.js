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
    freezeTableName: true,
    sequelize,
    modelName: "CocinaBar",
    timestamps: false
});

export default CocinaBar;