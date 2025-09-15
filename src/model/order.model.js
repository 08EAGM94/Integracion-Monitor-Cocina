import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

class Order extends Model{}

Order.init({
    order_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    numero_monitor: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    numero_comanda: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre_cliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estatus:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: "Order",
    timestamps: false
});

export default Order;



