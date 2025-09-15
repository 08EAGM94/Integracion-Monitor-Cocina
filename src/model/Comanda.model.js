import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

class Comanda extends Model{}

Comanda.init({
    Id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Folio: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    IdMesero: {
        type: DataTypes.INTEGER,
        references: {
            model: "Meseros",
            key: "ID"
        },
        allowNull: true
    },
    Fecha: {
        type: DataTypes.DATE,
        allowNull: true
    },
    IdEstado:{
        type: DataTypes.INTEGER,
        references: {
            model: "ComandasEstados",
            key: "Id"
        },
        allowNull: true
    },
    Comentarios:{
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Cerrada:{
        type: DataTypes.TINYINT,
        allowNull: false
    },
    clienteid:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    domicilio:{
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    CarritoTemporal:{
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    IdTurno:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    MotivoCancelacion:{
        type: DataTypes.STRING(300),
        allowNull: true
    },
    IdHash:{
        type: DataTypes.STRING(350),
        allowNull: true
    }
},{
    freezeTableName: true,
    sequelize,
    modelName: "Comanda",
    timestamps: false
});

export default Comanda;