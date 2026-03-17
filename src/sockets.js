import Order from "./model/order.model";
import CocinaBar from "./model/CocinaBar.model";
import Clientes from "./model/Clientes.model";
import Comanda from "./model/Comanda.model";
import { col, fn, Op } from "sequelize";
//socket lado del servidor
//io representa a todas las ventanas que accedieron a localhost:3001 (es nuestro servidor de socket del archivo index.js), socket 
//se refiere a ventanas del lado del cliente que emitieron un evento al socket servidor
export default (io) =>{
    io.on('connection', (socket) =>{
        CocinaBar.sync();
        Clientes.sync();
        Comanda.sync();
        const emitScreens = async () =>{
            //CocinaBar.sync();
            const screens = await CocinaBar.findAll({attributes: ["ID", "IdComanda", [fn("FORMAT", col("Fecha"), 'dd/MM/yyyy hh:mm tt'), "hora"],
                "IdEstado", "IdZonaProduccion"]});
            io.emit("server-loadScreens", screens);
        }
    
        const emitTickets = async () =>{
            Order.sync();
            const orders = await Order.findAll();
            io.emit("server-loadOrders", orders);
        }
        
        emitTickets();
        emitScreens();

        socket.on("clientNewOrder", async (data) =>{
            
            if(!data.idMonitor){
                const newRow = await Order.create({
                    numero_comanda: `${data.numero_comanda}`,
                    nombre_cliente: `${data.nombre_cliente}`,
                    estatus: `${data.estatus}`
                });

               await io.emit("serverSavedRow", newRow);
            }else{
                const newRow = await Order.create({
                    numero_monitor: data.idMonitor,
                    numero_comanda: `${data.numero_comanda}`,
                    nombre_cliente: `${data.nombre_cliente}`,
                    estatus: `${data.estatus}`
                });

                await io.emit("serverSavedRow", newRow);
            }
        });

        socket.on("clientUpdateStatus", async (update) =>{
            try{
                if(update.idMonitor === "Sin asignar" && update.id){
                    await Order.update(
                        { estatus: update.estatus},
                        {
                            where: {
                                order_id: update.id
                            }
                        }
                    );
                    emitTickets();
                }else if(update.idMonitor !== "Sin asignar" && !update.estatus){
                    await CocinaBar.update(
                        { IdEstado: update.idEstatus},
                        {
                            where: {
                                ID: update.idMonitor
                            }
                        }
                    );
                    emitScreens();
                }else{
                    await Order.update(
                        { estatus: update.estatus},
                        {
                            where: {
                                numero_monitor: update.idMonitor
                            }
                        }
                    );
                    
                    await CocinaBar.update(
                        { IdEstado: update.idEstatus},
                        {
                            where: {
                                ID: update.idMonitor
                            }
                        }
                    );

                    emitScreens();
                    emitTickets();
                }
            }catch(err){
                console.error("inconcistencia en los datos: ", err);
            }
        });

        socket.on("clientUpdateIds", async (idArr) =>{
            await CocinaBar.update(
                { IdEstado: 0},
                {
                    where: {
                        ID: {
                            [Op.in]: idArr
                        }
                    }
                }
            );

            emitScreens();
        });

        socket.on("clientDeleteAll", async (message) =>{
            if(message.clientSay == "yes"){
                await Order.destroy({
                    where: {},
                    truncate: true
                });
            }
            emitTickets();    
        });    
        
        socket.on("clientWantCliInfo", async myJson =>{
            const name = await Clientes.findAll({attributes: ["Nombre"], where:{ID: myJson.idComanda}});
            name.push({Idscreen: myJson.idScreen});

            const folio = await Comanda.findAll({attributes: ["Folio"], where:{ID: myJson.idComanda}});
            folio.push({Idscreen: myJson.idScreen});
            
            io.emit("serverSendCliInfo", name, folio);
        });
    }); 
}
