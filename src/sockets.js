import Order from "./model/order.model";
import CocinaBar from "./model/CocinaBar.model";
import Clientes from "./model/Clientes.model";
import Comanda from "./model/Comanda.model";
import { col, fn, Op } from "sequelize";
import { htmlSpecialChars } from "./escape";
//socket lado del servidor
//io es nuestro servidor de socket del archivo index.js, practicamente está a la escucha de cualquier petición HTTP ingresada a nuestro servidor (ejemplo: localhost:3000), socket 
//es en si los eventos socket que las ventanas del lado del cliente emitieron al socket servidor.
export default (io) =>{
    io.on('connection', (socket) =>{
        CocinaBar.sync();
        Clientes.sync();
        Comanda.sync();
        Order.sync();
        const emitScreens = async () =>{
            const screens = await CocinaBar.findAll({attributes: ["ID", "IdComanda", [fn("FORMAT", col("Fecha"), 'dd/MM/yyyy hh:mm tt'), "hora"],
                "IdEstado", "IdZonaProduccion"]});
            io.emit("server-loadScreens", screens);
        }
    
        const emitTickets = async () =>{
            const orders = await Order.findAll();
            io.emit("server-loadOrders", orders);
        }
        
        emitTickets();
        emitScreens();

        socket.on("clientNewOrder", async (data) =>{
            const escapedNumero_comanda = htmlSpecialChars(data.numero_comanda);
            const escapedNombre_cliente = htmlSpecialChars(data.nombre_cliente);
            const escapedEstatus = htmlSpecialChars(data.estatus);
            if(!data.idMonitor){
                const newRow = await Order.create({
                    numero_comanda: `${escapedNumero_comanda}`,
                    nombre_cliente: `${escapedNombre_cliente}`,
                    estatus: `${escapedEstatus}`
                });

               await io.emit("serverSavedRow", newRow);
            }else{
                const newRow = await Order.create({
                    numero_monitor: data.idMonitor,
                    numero_comanda: `${escapedNumero_comanda}`,
                    nombre_cliente: `${escapedNombre_cliente}`,
                    estatus: `${escapedEstatus}`
                });

                await io.emit("serverSavedRow", newRow);
            }
        });

        socket.on("clientUpdateStatus", async (update) =>{
            try{
                
                
                if(update.idMonitor === "Sin asignar" && update.id){
                    const escapedEstatus = htmlSpecialChars(update.estatus);
                    await Order.update(
                        { estatus: escapedEstatus},
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
                    const escapedEstatus = htmlSpecialChars(update.estatus);
                    await Order.update(
                        { estatus: escapedEstatus },
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
            if(message.clientSay === "yes"){
                await Order.destroy({
                    where: {},
                    truncate: true
                });
            }
            emitTickets();    
        });
        
        socket.on("clientDeleteOrder", async (delOrderJson) =>{
            
            if(delOrderJson.idMonitor !== "Sin asignar"){
                await Order.destroy({
                    where: {
                        order_id: delOrderJson.id    
                    }
                });

                await CocinaBar.update(
                    { IdEstado: 0},
                    {
                        where: {
                            ID: delOrderJson.idMonitor
                        }
                    }
                );
                emitTickets();
                emitScreens();
            }else{
                await Order.destroy({
                    where: {
                        order_id: delOrderJson.id    
                    }
                });
                emitTickets(); 
            }
        });

        socket.on("clientWantCliInfo", async (myJson) =>{
            const name = await Clientes.findAll({attributes: ["Nombre"], where:{ID: myJson.idComanda}});
            name.push({Idscreen: myJson.idScreen});

            const folio = await Comanda.findAll({attributes: ["Folio"], where:{ID: myJson.idComanda}});
            folio.push({Idscreen: myJson.idScreen});
            
            io.emit("serverSendCliInfo", name, folio);
        });
    }); 
}
