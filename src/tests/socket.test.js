import { createServer } from "node:http";
import { Server } from "socket.io";
import { sequelize } from "./db";
import Order from "./testModels/order.model.js"
import CocinaBar from "./testModels/CocinaBar.model.js";
import Comanda from "./testModels/Comanda.model.js";
import Clientes from "./testModels/Clientes.model.js";
import { col, fn, Op } from "sequelize";
import { htmlSpecialChars } from "../escape";
const Client = require("socket.io-client");


describe('pruebas de socket.io', ()=>{

    let io, serverSocket, clientSocket, httpServer;

    // 1. Levantar el servidor y el cliente antes de todas las pruebas
    beforeAll(async () => {

        await sequelize.sync({force: true});
        
        httpServer = createServer();
        io = new Server(httpServer);
        await new Promise((resolve) => httpServer.listen(resolve));

        const port = httpServer.address().port;
        await new Promise((resolve, reject) => {
            
            clientSocket = new Client(`http://localhost:${port}`);
            
            io.on("connection", (socket) => {
                serverSocket = socket;
            });
            
            clientSocket.on("connect", resolve);
            clientSocket.on("connect_error", reject);
        });
    });

    afterEach(async () =>{
        clientSocket.removeAllListeners();
        serverSocket.removeAllListeners();
        await sequelize.truncate({restartIdentity: true});
    });

    // 2. Eliminar el contenido de las tablas y cerrar conexiones al finalizar
    afterAll(async () => {
        io.close();
        clientSocket.close();
        httpServer.close();
        await sequelize.close();
    });    
    
    test('prueba evento servidor "server-loadOrders"', done => {

        const emitTickets = async () =>{

            //--------creación de ordenes para el test---------
            await Order.bulkCreate([
                {
                    numero_monitor: "1",
                    numero_comanda: "SpCt-9",
                    nombre_cliente: "Erika Paola",
                    estatus: "Ordenado"
                },
                {
                    numero_monitor: "2",
                    numero_comanda: "SpCt-10",
                    nombre_cliente: "Luis Fernando",
                    estatus: "Proceso"
                },
                {
                    numero_monitor: "3",
                    numero_comanda: "SpCt-11",
                    nombre_cliente: "María José",
                    estatus: "Terminado"
                },
                {
                    numero_monitor: "4",
                    numero_comanda: "SpCt-12",
                    nombre_cliente: "Carlos Alberto",
                    estatus: "Entregado"
                },
                {
                    numero_monitor: "5",
                    numero_comanda: "SpCt-13",
                    nombre_cliente: "Andrea Sofía",
                    estatus: "Proceso"
                }
            ]);
            //-------------------------------------------------

            const orders = await Order.findAll();
            serverSocket.emit("server-loadOrders", orders);
        }
        
        emitTickets();

        clientSocket.on("server-loadOrders", orders =>{
            expect(orders).toHaveLength(5);
            expect(orders[3].nombre_cliente).toBe("Carlos Alberto");
            done();
        });
    });

    test('prueba evento servidor "server-loadScreens"', done => {

        const emitScreens = async () =>{

            //--------creación de registros para el test---------
            await CocinaBar.bulkCreate([
                {
                IdComanda: 1,
                Fecha: "2024-02-07 16:37:10.803",
                IdProductos: "1",
                IdEstado: 0,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3	
                },
                {
                IdComanda: 2,
                Fecha: "2024-02-07 17:09:17.317",
                IdProductos: "1",
                IdEstado: 0,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                },
                {
                IdComanda: 3,
                Fecha: "2024-07-18 19:10:06.973",
                IdProductos: "1",
                IdEstado: 0,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                }
            ]);
            //-------------------------------------------------

            const screens = await CocinaBar.findAll({attributes: ["ID", "IdComanda", [fn("FORMAT", col("Fecha"), 'dd/MM/yyyy hh:mm tt'), "hora"],
                "IdEstado", "IdZonaProduccion"]});
            serverSocket.emit("server-loadScreens", screens);
        }
        
        emitScreens();

        clientSocket.on("server-loadScreens", screens =>{
            expect(screens).toHaveLength(3);
            expect(screens[2].hora).toBe("18/07/2024 07:10 PM");
            done();
        });
    });

    test('prueba evento cliente "clientNewOrder", caso sin Id monitor', done => {

        clientSocket.emit("clientNewOrder", {
            numero_comanda: "SpCt-10",
            nombre_cliente: "Rosalva Gomez",
            estatus: "Ordenado"
        });

        serverSocket.on("clientNewOrder", async (data) =>{
            const escapedNumero_comanda = htmlSpecialChars(data.numero_comanda);
            const escapedNombre_cliente = htmlSpecialChars(data.nombre_cliente);
            const escapedEstatus = htmlSpecialChars(data.estatus);

            if(!data.idMonitor){
                const newRow = await Order.create({
                    numero_comanda: `${escapedNumero_comanda}`,
                    nombre_cliente: `${escapedNombre_cliente}`,
                    estatus: `${escapedEstatus}`
                });
 
               await serverSocket.emit("serverSavedRow", newRow);
            }else{
                const newRow = await Order.create({
                    numero_monitor: data.idMonitor,
                    numero_comanda: `${escapedNumero_comanda}`,
                    nombre_cliente: `${escapedNombre_cliente}`,
                    estatus: `${escapedEstatus}`
                });

                await serverSocket.emit("serverSavedRow", newRow);
            }
        });
        
        clientSocket.on("serverSavedRow", newRow =>{
            expect(newRow.order_id).toBe(1);
            expect(newRow.nombre_cliente).toBe("Rosalva Gomez");
            done();
        });
    });

    test('prueba evento cliente "clientNewOrder", caso con Id monitor', done => {

        clientSocket.emit("clientNewOrder", {
            idMonitor: 13,
            numero_comanda: "SpCt-10",
            nombre_cliente: "Rosalva Gomez",
            estatus: "Ordenado"
        });

        serverSocket.on("clientNewOrder", async (data) =>{
            const escapedNumero_comanda = htmlSpecialChars(data.numero_comanda);
            const escapedNombre_cliente = htmlSpecialChars(data.nombre_cliente);
            const escapedEstatus = htmlSpecialChars(data.estatus);

            if(!data.idMonitor){
                const newRow = await Order.create({
                    numero_comanda: `${escapedNumero_comanda}`,
                    nombre_cliente: `${escapedNombre_cliente}`,
                    estatus: `${escapedEstatus}`
                });
 
               await serverSocket.emit("serverSavedRow", newRow);
            }else{
                const newRow = await Order.create({
                    numero_monitor: data.idMonitor,
                    numero_comanda: `${escapedNumero_comanda}`,
                    nombre_cliente: `${escapedNombre_cliente}`,
                    estatus: `${escapedEstatus}`
                });

                await serverSocket.emit("serverSavedRow", newRow);
            }
        });
        
        clientSocket.on("serverSavedRow", newRow =>{
            expect(newRow.order_id).toBe(1);
            expect(newRow.numero_monitor).toBe(13);
            done();
        });
    });

    test('prueba evento cliente "clientNewOrder", caso caracteres especiales html', done => {

        clientSocket.emit("clientNewOrder", {
            numero_comanda: "<button>SpCt-10</button>",
            nombre_cliente: "<button>Rosalva Gomez</button>",
            estatus: "Ordenado"
        });

        serverSocket.on("clientNewOrder", async (data) =>{
            const escapedNumero_comanda = htmlSpecialChars(data.numero_comanda);
            const escapedNombre_cliente = htmlSpecialChars(data.nombre_cliente);
            const escapedEstatus = htmlSpecialChars(data.estatus);

            if(!data.idMonitor){
                const newRow = await Order.create({
                    numero_comanda: `${escapedNumero_comanda}`,
                    nombre_cliente: `${escapedNombre_cliente}`,
                    estatus: `${escapedEstatus}`
                });
 
               await serverSocket.emit("serverSavedRow", newRow);
            }else{
                const newRow = await Order.create({
                    numero_monitor: data.idMonitor,
                    numero_comanda: `${escapedNumero_comanda}`,
                    nombre_cliente: `${escapedNombre_cliente}`,
                    estatus: `${escapedEstatus}`
                });

                await serverSocket.emit("serverSavedRow", newRow);
            }
        });
        
        clientSocket.on("serverSavedRow", newRow =>{
            expect(newRow.numero_comanda).toBe("&lt;button&gt;SpCt-10&lt;/button&gt;");
            expect(newRow.nombre_cliente).toBe("&lt;button&gt;Rosalva Gomez&lt;/button&gt;");
            done();
        });
    });

    test('prueba evento cliente "clientUpdateStatus", caso idMonitor === "Sin asignar"', done => {

        const emitTickets = async () =>{
            const orders = await Order.findAll();
            serverSocket.emit("server-loadOrders", orders);
        }

        clientSocket.emit("clientUpdateStatus", {
            id: 2,
            estatus: "Terminado",
            idMonitor: "Sin asignar",
            idEstatus: 3
        });

        serverSocket.on("clientUpdateStatus", async (update) =>{
            try{
                
                //--------creación de ordenes para el test---------
                await Order.bulkCreate([
                    {
                        numero_monitor: "1",
                        numero_comanda: "SpCt-9",
                        nombre_cliente: "Erika Paola",
                        estatus: "Ordenado"
                    },
                    {
                        numero_comanda: "SpCt-10",
                        nombre_cliente: "Luis Fernando",
                        estatus: "Proceso"
                    },
                    {
                        numero_monitor: "3",
                        numero_comanda: "SpCt-11",
                        nombre_cliente: "María José",
                        estatus: "Terminado"
                    },
                    {
                        numero_monitor: "4",
                        numero_comanda: "SpCt-12",
                        nombre_cliente: "Carlos Alberto",
                        estatus: "Entregado"
                    },
                    {
                        numero_monitor: "5",
                        numero_comanda: "SpCt-13",
                        nombre_cliente: "Andrea Sofía",
                        estatus: "Proceso"
                    }
                ]);
                //-------------------------------------------------
                
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
        
        clientSocket.on("server-loadOrders", orders =>{
            expect(orders[1].estatus).toBe("Terminado");
            done();
        });
    });

    test('prueba evento cliente "clientUpdateStatus", caso idMonitor !== "Sin asignar"', done => {

        const emitScreens = async () =>{
            const screens = await CocinaBar.findAll({attributes: ["ID", "IdComanda", [fn("FORMAT", col("Fecha"), 'dd/MM/yyyy hh:mm tt'), "hora"],
                "IdEstado", "IdZonaProduccion"]});
            serverSocket.emit("server-loadScreens", screens);
        }
        //este caso es cuando en el monitor de cocina se crea una orden y se actualiza el correspondiente registro de CocinaBar con estatus "Ordenado"
        clientSocket.emit("clientUpdateStatus", { idMonitor: 3, idEstatus: 1});

        serverSocket.on("clientUpdateStatus", async (update) =>{
            try{
                
                //--------creación de registros para el test---------
                await CocinaBar.bulkCreate([
                    {
                    IdComanda: 1,
                    Fecha: "2024-02-07 16:37:10.803",
                    IdProductos: "1",
                    IdEstado: 0,
                    IdTipo: 1,
                    Prioridad: 2,
                    IdZonaProduccion: 3	
                    },
                    {
                    IdComanda: 2,
                    Fecha: "2024-02-07 17:09:17.317",
                    IdProductos: "1",
                    IdEstado: 0,
                    IdTipo: 1,
                    Prioridad: 2,
                    IdZonaProduccion: 3
                    },
                    {
                    IdComanda: 3,
                    Fecha: "2024-07-18 19:10:06.973",
                    IdProductos: "1",
                    IdEstado: 0,
                    IdTipo: 1,
                    Prioridad: 2,
                    IdZonaProduccion: 3
                    }
                ]);
                //-------------------------------------------------
                
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
        
        clientSocket.on("server-loadScreens", screens =>{
            expect(screens[2].IdEstado).toBe(1);
            done();
        });
    });

    test('prueba evento cliente "clientUpdateStatus", caso else', done => {

        const emitScreens = async () =>{
            const screens = await CocinaBar.findAll({attributes: ["ID", "IdComanda", [fn("FORMAT", col("Fecha"), 'dd/MM/yyyy hh:mm tt'), "hora"],
                "IdEstado", "IdZonaProduccion"]});
            serverSocket.emit("server-loadScreens", screens);
        }

        const emitTickets = async () =>{
            const orders = await Order.findAll();
            serverSocket.emit("server-loadOrders", orders);
        }

        clientSocket.emit("clientUpdateStatus", {
            id: 2,
            estatus: "Entregado",
            idMonitor: 2,
            idEstatus: 4
        });

        serverSocket.on("clientUpdateStatus", async (update) =>{
            try{
                //--------creación de registros para el test---------    
                await Order.bulkCreate([
                    {
                        numero_monitor: "1",
                        numero_comanda: "SpCt-9",
                        nombre_cliente: "Erika Paola",
                        estatus: "Ordenado"
                    },
                    {
                        numero_monitor: "2",
                        numero_comanda: "SpCt-10",
                        nombre_cliente: "Luis Fernando",
                        estatus: "Proceso"
                    },
                    {
                        numero_monitor: "3",
                        numero_comanda: "SpCt-11",
                        nombre_cliente: "María José",
                        estatus: "Terminado"
                    }
                ]);
                
                await CocinaBar.bulkCreate([
                    {
                    IdComanda: 1,
                    Fecha: "2024-02-07 16:37:10.803",
                    IdProductos: "1",
                    IdEstado: 0,
                    IdTipo: 1,
                    Prioridad: 2,
                    IdZonaProduccion: 3	
                    },
                    {
                    IdComanda: 2,
                    Fecha: "2024-02-07 17:09:17.317",
                    IdProductos: "1",
                    IdEstado: 0,
                    IdTipo: 1,
                    Prioridad: 2,
                    IdZonaProduccion: 3
                    },
                    {
                    IdComanda: 3,
                    Fecha: "2024-07-18 19:10:06.973",
                    IdProductos: "1",
                    IdEstado: 0,
                    IdTipo: 1,
                    Prioridad: 2,
                    IdZonaProduccion: 3
                    }
                ]);
                //-------------------------------------------------
                
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

                    emitTickets();
                    emitScreens();
                }
                
            }catch(err){
                console.error("inconcistencia en los datos: ", err);
            }
        });
        
        clientSocket.on("server-loadOrders", orders =>{
            expect(orders[1].estatus).toBe("Entregado");
        });

        clientSocket.on("server-loadScreens", screens =>{
            expect(screens[1].IdEstado).toBe(4);
            done();
        });
    });

    test('prueba evento cliente "clientUpdateIds"', done =>{

        const emitScreens = async () =>{
            const screens = await CocinaBar.findAll({attributes: ["ID", "IdComanda", [fn("FORMAT", col("Fecha"), 'dd/MM/yyyy hh:mm tt'), "hora"],
                "IdEstado", "IdZonaProduccion"]});
            serverSocket.emit("server-loadScreens", screens);
        }
        const idArr = [1,2,3];

        clientSocket.emit("clientUpdateIds", idArr);

        serverSocket.on("clientUpdateIds", async (idArr) =>{

            await CocinaBar.bulkCreate([
                {
                IdComanda: 1,
                Fecha: "2024-02-07 16:37:10.803",
                IdProductos: "1",
                IdEstado: 4,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3	
                },
                {
                IdComanda: 2,
                Fecha: "2024-02-07 17:09:17.317",
                IdProductos: "1",
                IdEstado: 4,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                },
                {
                IdComanda: 3,
                Fecha: "2024-07-18 19:10:06.973",
                IdProductos: "1",
                IdEstado: 4,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                }
            ]);

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

        clientSocket.on("server-loadScreens", screens =>{
            screens.forEach(screen =>{
                expect(screen.IdEstado).toBe(0);
            });
            done();
        });
    });

    test('prueba evento cliente "clientWantCliInfo"', done => {

        const emitScreens = async () =>{

            await Clientes.bulkCreate(
                [
                    { Nombre: "Vladimir Rafael"},
                    { Nombre: "Nancy Isabel"},
                    { Nombre: "Williams Julián"},
                    { Nombre: "Hector Patricio"},
                    { Nombre: "Erika Paola"},
                    { Nombre: "Roger Andrés"}
                ]
            );

            await Comanda.bulkCreate(
                [
                    {
                        Folio: "Ag2-1",
                        Cerrada: 0
                    },
                    {
                        Folio: "SpCt-11",
                        Cerrada: 0
                    },
                    {
                        Folio: "SpCt-4",
                        Cerrada: 0
                    },
                    {
                        Folio: "SpCt-2",
                        Cerrada: 0
                    },
                    {
                        Folio: "Er4-3",
                        Cerrada: 0
                    },
                    {
                        Folio: "SpCt-5",
                        Cerrada: 0
                    }
                ]
            );

            await CocinaBar.bulkCreate([
                {
                IdComanda: 1,
                Fecha: "2024-02-07 16:37:10.803",
                IdProductos: "1",
                IdEstado: 1,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3	
                },
                {
                IdComanda: 2,
                Fecha: "2024-02-07 17:09:17.317",
                IdProductos: "1",
                IdEstado: 1,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                },
                {
                IdComanda: 3,
                Fecha: "2024-07-18 19:10:06.973",
                IdProductos: "1",
                IdEstado: 1,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                },
                {
                IdComanda: 4,
                Fecha: "2025-07-08 12:46:37.147",
                IdProductos: "1",
                IdEstado: 1,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3	
                },
                {
                IdComanda: 5,
                Fecha: "2025-07-09 19:43:30.197",
                IdProductos: "1",
                IdEstado: 1,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                },
                {
                IdComanda: 6,
                Fecha: "2025-07-10 11:49:13.433",
                IdProductos: "1",
                IdEstado: 1,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                }
            ]);

            const screens = await CocinaBar.findAll();
            serverSocket.emit("server-loadScreens", screens);
        }

        let originalIdsOrder = [];
        /*
        el objeto Map es una colección de pares clave-valor que, a diferencia de los objetos normales, permite usar cualquier tipo de dato 
        como clave (incluyendo objetos, funciones o números) y mantiene el orden de inserción. Los objetos solo permiten strings o symbols 
        como llaves, mientras que un Map es más flexible y tiene mejor rendimiento en escenarios de adición/eliminación frecuente. En este 
        caso se estan creando las instancias "pendingScreensClient", "allOfScreens"; "pendingScreensClient" se utilizará en el evento socket de 
        "server-loadScreens" como clave contendrá el id de un registro de la entidad CocinaBar y como valor tendrá el registro de CocinaBar 
        correspondiente a ese id. La segunda instancia "allOfScreens" se utilizará en el evento socket de "serverSendCliInfo", como clave 
        contendrá el id de un registro de la entidad CocinaBar (que se pasará en la emisión de evento hacia el servidor "clientWantCliInfo" de 
        "server-loadScreens") y como valor un JSON que contiene el registro de CocinaBar correspondiente a ese id, el nombre del cliente 
        correspondiente al id de CocinaBar y el folio de comanda del cliente correspondiente al id de CocinaBar.
        */
        const allOfScreens = new Map();
        const pendingScreensClient = new Map();

        emitScreens();

        /*
        cada recepción de eventos socket del servidor se efectua de forma sincronica dentro de este flujo de código del lado del cliente, por ejemplo, 
        al escuchar el evento "server-loadScreens", se van a procesar todos los registros que devuelva este evento, una vez procesado todos los 
        registros, lo siguiente que se va a hacer es recepcionar el evento socket "serverSendCliInfo", recepción que se define justo despues de la recepción 
        de "server-loadScreens"  
        */

        clientSocket.on("server-loadScreens", screens => {
            // orderMonitor.innerHTML = "";
            // orderLabel.innerHTML = "Ordenadas:";
            // processLabel.innerHTML = "En Proceso:";
            // deliveredLabel.innerHTML = "Terminados:";
            let orderCounter = 0;
            let processCounter = 0;
            let finishCounter = 0;
            originalIdsOrder = [];
            screens.forEach(screen => {
                if (screen.IdZonaProduccion == 3 && screen.IdEstado !== 4) {
                    if(screen.IdEstado == 1){
                        orderCounter++;
                        //orderLabel.innerHTML = `Ordenadas: ${orderCounter}`;
                    }else if(screen.IdEstado == 2){
                        processCounter++;
                        //processLabel.innerHTML = `En Proceso: ${processCounter}`; 
                    }else if(screen.IdEstado == 3){
                        finishCounter++;
                        //deliveredLabel.innerHTML = `Terminados: ${finishCounter}`;
                    }
                    /*Este array servirá como soporte en el evento socket "serverSendCliInfo", contendrá todos los ids de la entidad CocinaBar 
                    que se mostrarán en pantalla*/
                    originalIdsOrder.push(screen.ID);
                    /*la instancia map "pendingScreensClient" tambien se utilizará como soporte en el evento socket "serverSendCliInfo", contendrá 
                    todos los registros de CocinaBar identificados por sus correspondientes Ids*/
                    pendingScreensClient.set(screen.ID, screen);
                    /*Aqui estamos emitiendo un evento al servidor, hay que tener en cuenta que la  recepción del evento "server-loadScreens" 
                    se efectúa de manera sincronica, por lo que las emisiones al servidor se estarían acumulando en proporción al numero de elementos 
                    "screen" que entren en la condición de este forEach, por ejemplo, si hay 6 screen que cumplen la condición, entonces las llamadas 
                    al servidor se acumula en 6 veces "clientWantCliInfo"*/
                    clientSocket.emit('clientWantCliInfo', {idScreen: screen.ID, idComanda: screen.IdComanda});
                }
            });
            expect(orderCounter).toBe(6);
            expect(processCounter).toBe(0);
            expect(finishCounter).toBe(0);
        });

        serverSocket.on("clientWantCliInfo", async (myJson) =>{

            const name = await Clientes.findAll({attributes: ["Nombre"], where:{ID: myJson.idComanda}});
            name.push({Idscreen: myJson.idScreen});

            const folio = await Comanda.findAll({attributes: ["Folio"], where:{Id: myJson.idComanda}});
            folio.push({Idscreen: myJson.idScreen});
            
            await serverSocket.emit("serverSendCliInfo", name, folio);
        });

        /*Una vez que se haya recepcionado todos los registros que devuelve el evento socket "server-loadScreens", el servidor va a procesar todas las emisiones
        "clientWantCliInfo" generadas en "server-loadScreens", aqui se va a recepcionar todo lo que devuelve el servidor con el evento "serverSendCliInfo" uno 
        por uno*/
        clientSocket.on("serverSendCliInfo", (cliName, cliFolio) =>{

            const testArr = [];
            const testNames = [
                "Vladimir Rafael",
                "Nancy Isabel",
                "Williams Julián",
                "Hector Patricio",
                "Erika Paola",
                "Roger Andrés"
            ];
            const testFolios = [
                "Ag2-1",
                "SpCt-11",
                "SpCt-4",
                "SpCt-2",
                "Er4-3",
                "SpCt-5"
            ];

            /*Guardamos en constantes los valores que procesó el servidor: el nombre del cliente, el folio de la comanda del cliente, el respectivo Id de CocinaBar 
            vinculado al cliente y el registro de CocinaBar correspondiente al Id de esta entidad conseguido gracias a nuestra instancia map "pendingScreensClient"*/
            const clientName = cliName[0].Nombre;
            const clientFolio = cliFolio[0].Folio;
            const idscreen = cliName[1].Idscreen;
            const screen = pendingScreensClient.get(idscreen);
            if(screen){
                /*si "pendingScreensClient" contiene un valor de acuerdo a lo que se a pasado en el metodo get, screen contiene un valor diferente de falso, en 
                este caso usamos nuestra instancia map "allOfScreens" para que contenga la información conseguida en este evento socket correspondiente al Id 
                contenido en idscreen*/
                allOfScreens.set(idscreen, {screen, clientName, clientFolio});
                /*En cada proceso se va a vaciar la instancia "pendingScreensClient" de acuerdo a la clave que se pase en el método delete para evitar posibles 
                    duplicados de información*/
                pendingScreensClient.delete(idscreen);
            }

            if(allOfScreens.size === originalIdsOrder.length){
                /*Esta condición es verdadera una vez que se haya procesado todo lo que devuelve el evento "serverSendCliInfo", la instancia "allOfScreens"
                tendrá la misma cantidad de datos que el array "originalIdsOrder" (perteneciente a la recepción del evento "server-loadScreens")*/
                /*
                originalIdsOrder.forEach(id =>{
                    Es dentro de este forEach donde se va a empezar a pintar en la interfaz del usuario (dentro de monitor.html), al recorrer cada 
                    indice del arreglo originalIdsOrder aseguramos que cada registro de CocinaBar aparezca en la interfaz de acuerdo a su orden exacto en la 
                    base de datos (se hizo todo esto debido a que las emisiones de eventos al servidor como "clientWantCliInfo" donde se hacen peticiones un 
                    tanto complejas, a parte de que toda petición a la base de datos se hace de manera asincronica, esto quiere decir que en este caso el 
                    servidor puede obtener datos de forma más anticipada que otros, afectando el orden que se quiere llegar, por eso se creó el array 
                    "originalIdsOrder" como apoyo para pintar los registros de CocinaBar con información adicional en el mismo orden que se tiene en la entidad
                    
                    const data = allOfScreens.get(id);
                    orderMonitor.append(generateScreens(data.screen, data.clientName, data.clientFolio));
                    
                    En cada proceso se va a vaciar la instancia "allOfScreens" de acuerdo a la clave que se pase en el método delete para evitar posibles 
                    duplicados de información

                    allOfScreens.delete(id);
                });*/

                originalIdsOrder.forEach(id =>{
                    testArr.push(allOfScreens.get(id));
                    allOfScreens.delete(id);
                });

                
                for(let i = 0; i < testArr.length; i++){
                    expect(testArr[i].screen.ID).toBe(i + 1);
                }

                for(let i = 0; i < testArr.length; i++){
                    expect(testArr[i].clientName).toBe(testNames[i]);
                }

                for(let i = 0; i < testArr.length; i++){
                    expect(testArr[i].clientFolio).toBe(testFolios[i]);
                }

                done();

            }
        });
    });

    test('prueba evento cliente "clientDeleteAll"', done =>{

        const emitTickets = async () =>{
            const orders = await Order.findAll();
            serverSocket.emit("server-loadOrders", orders);
        }

        clientSocket.emit("clientDeleteAll", {
                clientSay: "yes"
        });

        serverSocket.on("clientDeleteAll", async (message) =>{

            await Order.bulkCreate([
                {
                    numero_monitor: "1",
                    numero_comanda: "SpCt-9",
                    nombre_cliente: "Erika Paola",
                    estatus: "Ordenado"
                },
                {
                    numero_monitor: "2",
                    numero_comanda: "SpCt-10",
                    nombre_cliente: "Luis Fernando",
                    estatus: "Proceso"
                },
                {
                    numero_monitor: "3",
                    numero_comanda: "SpCt-11",
                    nombre_cliente: "María José",
                    estatus: "Terminado"
                }
            ]);

            if(message.clientSay === "yes"){
                await Order.destroy({
                    where: {},
                    truncate: true
                });
            }
            emitTickets();    
        });

        clientSocket.on("server-loadOrders", orders =>{
            expect(orders).toHaveLength(0);
            done();
        });
    });

    test('prueba evento cliente "clientDeleteOrder" caso idMonitor !== "Sin asignar"', done => {

        const emitScreens = async () =>{
            const screens = await CocinaBar.findAll({attributes: ["ID", "IdComanda", [fn("FORMAT", col("Fecha"), 'dd/MM/yyyy hh:mm tt'), "hora"],
                "IdEstado", "IdZonaProduccion"]});
            serverSocket.emit("server-loadScreens", screens);
        }

        const emitTickets = async () =>{
            const orders = await Order.findAll();
            serverSocket.emit("server-loadOrders", orders);
        }

        clientSocket.emit("clientDeleteOrder", {id: 1, idMonitor: 1});

        serverSocket.on("clientDeleteOrder", async (delOrderJson) =>{

            //--------creación de registros para el test---------    
            await Order.bulkCreate([
                {
                    numero_monitor: "1",
                    numero_comanda: "SpCt-9",
                    nombre_cliente: "Erika Paola",
                    estatus: "Ordenado"
                },
                {
                    numero_monitor: "2",
                    numero_comanda: "SpCt-10",
                    nombre_cliente: "Luis Fernando",
                    estatus: "Proceso"
                },
                {
                    numero_monitor: "3",
                    numero_comanda: "SpCt-11",
                    nombre_cliente: "María José",
                    estatus: "Terminado"
                }
            ]);
            
            await CocinaBar.bulkCreate([
                {
                IdComanda: 1,
                Fecha: "2024-02-07 16:37:10.803",
                IdProductos: "1",
                IdEstado: 3,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3	
                },
                {
                IdComanda: 2,
                Fecha: "2024-02-07 17:09:17.317",
                IdProductos: "1",
                IdEstado: 0,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                },
                {
                IdComanda: 3,
                Fecha: "2024-07-18 19:10:06.973",
                IdProductos: "1",
                IdEstado: 0,
                IdTipo: 1,
                Prioridad: 2,
                IdZonaProduccion: 3
                }
            ]);
            //-------------------------------------------------
            
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

        clientSocket.on("server-loadOrders", orders =>{
            expect(orders).toHaveLength(2);
        });

        clientSocket.on("server-loadScreens", screens =>{
            expect(screens[0].IdEstado).toBe(0);
            done();
        });
    });

    test('prueba evento cliente "clientDeleteOrder" caso idMonitor === "Sin asignar"', done => {

        const emitTickets = async () =>{
            const orders = await Order.findAll();
            serverSocket.emit("server-loadOrders", orders);
        }

        clientSocket.emit("clientDeleteOrder", {id: 1, idMonitor: "Sin asignar"});

        serverSocket.on("clientDeleteOrder", async (delOrderJson) =>{

            //--------creación de registros para el test---------    
            await Order.bulkCreate([
                {
                    numero_comanda: "SpCt-9",
                    nombre_cliente: "Erika Paola",
                    estatus: "Ordenado"
                },
                {
                    numero_monitor: "2",
                    numero_comanda: "SpCt-10",
                    nombre_cliente: "Luis Fernando",
                    estatus: "Proceso"
                },
                {
                    numero_monitor: "3",
                    numero_comanda: "SpCt-11",
                    nombre_cliente: "María José",
                    estatus: "Terminado"
                }
            ]);
            //-------------------------------------------------
            
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

        clientSocket.on("server-loadOrders", orders =>{
            expect(orders).toHaveLength(2);
            done();
        });
    });
});