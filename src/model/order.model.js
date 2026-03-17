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
    //se trata de un modelo existente en la base de datos, aqui le indicamos a sequelize que 
    //si busca la coincidencia que le indicamos no creará desde cero la tabla en cuestión
    modelName: "Order",
    //evita que se registre una fecha de creación en la base de datos
    timestamps: false
});

export default Order;



