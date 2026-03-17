window.addEventListener("load", () =>{
    const socket = io();
    const orderMonitor = document.querySelector("#orderMonitor");
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
    const orderLabel = document.querySelector("#orderLabel");
    const processLabel = document.querySelector("#processLabel");
    const deliveredLabel = document.querySelector("#deliveredLabel");
    const resetLink = document.querySelector("#resetLink");
    /*
    cada recepción de eventos socket del servidor se efectua de forma sincronica dentro de este flujo de código del lado del cliente, por ejemplo, 
    al escuchar el evento "server-loadScreens", se van a procesar todos los registros que devuelva este evento, una vez procesado todos los 
    registros, lo siguiente que se va a hacer es recepcionar el evento socket "serverSendCliInfo", recepción que se define justo despues de la recepción 
    de "server-loadScreens"  
    */
    socket.on("server-loadScreens", screens => {
        orderMonitor.innerHTML = "";
        orderLabel.innerHTML = "Ordenadas:";
        processLabel.innerHTML = "En Proceso:";
        deliveredLabel.innerHTML = "Terminados:";
        let orderCounter = 0;
        let processCounter = 0;
        let finishCounter = 0;
        originalIdsOrder = [];
        screens.forEach(screen => {
            if (screen.IdZonaProduccion == 3 && screen.IdEstado !== 4) {
                if(screen.IdEstado == 1){
                    orderCounter++;
                    orderLabel.innerHTML = `Ordenadas: ${orderCounter}`;
                }else if(screen.IdEstado == 2){
                    processCounter++;
                    processLabel.innerHTML = `En Proceso: ${processCounter}`; 
                }else if(screen.IdEstado == 3){
                    finishCounter++;
                    deliveredLabel.innerHTML = `Terminados: ${finishCounter}`;
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
                socket.emit('clientWantCliInfo', {idScreen: screen.ID, idComanda: screen.IdComanda});
            }
        });
    });

    /*Una vez que se haya recepcionado todos los registros que devuelve el evento socket "server-loadScreens", el servidor va a procesar todas las emisiones
    "clientWantCliInfo" generadas en "server-loadScreens", aqui se va a recepcionar todo lo que devuelve el servidor con el evento "serverSendCliInfo" uno 
    por uno*/
    socket.on("serverSendCliInfo", (cliName, cliFolio) =>{
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
            originalIdsOrder.forEach(id =>{
                /*Es dentro de este forEach donde se va a empezar a pintar en la interfaz del usuario (dentro de monitor.html), al recorrer cada 
                indice del arreglo originalIdsOrder aseguramos que cada registro de CocinaBar aparezca en la interfaz de acuerdo a su orden exacto en la 
                base de datos (se hizo todo esto debido a que las emisiones de eventos al servidor como "clientWantCliInfo" donde se hacen peticiones un 
                tanto complejas, a parte de que toda petición a la base de datos se hace de manera asincronica, esto quiere decir que en este caso el 
                servidor puede obtener datos de forma más anticipada que otros, afectando el orden que se quiere llegar, por eso se creó el array 
                "originalIdsOrder" como apoyo para pintar los registros de CocinaBar con información adicional en el mismo orden que se tiene en la entidad*/
                const data = allOfScreens.get(id);
                orderMonitor.append(generateScreens(data.screen, data.clientName, data.clientFolio));
                /*En cada proceso se va a vaciar la instancia "allOfScreens" de acuerdo a la clave que se pase en el método delete para evitar posibles 
                duplicados de información*/
                allOfScreens.delete(id);
            });
            
        }   
    });

    resetLink.addEventListener("click", () =>{
        const idArr = [7,10,13,17,22,23];
        socket.emit("clientUpdateIds", idArr);
        socket.emit("clientDeleteAll", {
                clientSay: "yes"
        });
    })
    
    const generateScreens = (screen, client, folio) =>{
        const orderWrapper = document.createElement("div");
        orderWrapper.classList.add("main__order-wrapper");
        const cliFolio = folio;
        const cliente = client;
        orderWrapper.innerHTML = `
                <div class="main-content__order-wrapper">
                    <div class="order__description">
                        <div class="description__folio">Comanda: ${cliFolio}</div>
                        Pedido: Desde la web
                        <br/>
                        ENVIAR A DOMICILIO
                        <br/>
                        Hora: ${screen.hora}
                        <br/>
                        <a class="description__print">
                            <span class="print__icon">
                                <i class="fa-solid fa-print"></i>
                            </span>
                            Imprimir
                        </a>
                    </div>

                    <div class="order__table-wrapper">
                        <table class="table-wrapper-table">
                            <thead>
                                <tr>
                                    <th>Cantidad</th>
                                    <th>Producto</th>
                                    <th>Tiempo</th>
                                    <th class="th-close"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>TOSTADA DE CEVICHE</td>
                                    <td>Sin asignar</td>
                                    <td class="td-close">
                                        <div class="table__close-box">
                                            <i class="fa-solid fa-xmark"></i>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="order__button-area">
                    <button class="order__order-button with-shadow" id="orderButton" data-id="${screen.ID}">Ordenada</button>
                    <button class="order__process-button with-shadow" data-id="${screen.ID}">Proceso</button>
                    <button class="order__finish-button with-shadow" data-id="${screen.ID}">Terminado</button>
                    <button class="order__delivered-button with-shadow" data-id="${screen.ID}">Entregado</button>
                </div>
        `;
        
        const orderButton = orderWrapper.querySelector(".order__order-button");
        const processButton = orderWrapper.querySelector(".order__process-button");
        const finishButton = orderWrapper.querySelector(".order__finish-button");
        const deliveredButton = orderWrapper.querySelector(".order__delivered-button");
        
        if(screen.IdEstado > 0 && screen.IdEstado <= 1){
            orderButton.classList.add("without-shadow");
            orderButton.disabled = true;
        }else if(screen.IdEstado == 2){
            orderButton.classList.add("without-shadow");
            orderButton.disabled = true;
            processButton.classList.add("without-shadow");
            processButton.disabled = true;
        }else if(screen.IdEstado == 3){
            orderButton.classList.add("without-shadow");
            orderButton.disabled = true;
            processButton.classList.add("without-shadow");
            processButton.disabled = true;
            finishButton.classList.add("without-shadow");
            finishButton.disabled = true;
        }else{
            orderButton.addEventListener("click", () =>{
                socket.emit("clientNewOrder", {
                    idMonitor: orderButton.dataset.id,
                    numero_comanda: cliFolio,
                    nombre_cliente: cliente,
                    estatus: "Ordenado"
                });

                socket.emit("clientUpdateStatus", { idMonitor: orderButton.dataset.id, idEstatus: 1});
            });

            processButton.classList.add("without-shadow");
            processButton.disabled = true;

            finishButton.classList.add("without-shadow");
            finishButton.disabled = true;

            deliveredButton.classList.add("without-shadow");
            deliveredButton.disabled = true;
        }

        processButton.addEventListener("click", () =>{
            console.log(processButton.dataset.id);
            socket.emit("clientUpdateStatus", {
                estatus: "Proceso",
                idMonitor: `${processButton.dataset.id}`,
                idEstatus: 2
            });
        });

        finishButton.addEventListener("click", () =>{
            console.log(finishButton.dataset.id);
            socket.emit("clientUpdateStatus", {
                estatus: "Terminado",
                idMonitor: `${finishButton.dataset.id}`,
                idEstatus: 3
            });
        });

        deliveredButton.addEventListener("click", () =>{
            console.log(deliveredButton.dataset.id);
            socket.emit("clientUpdateStatus", {
                estatus: "Entregado",
                idMonitor: `${deliveredButton.dataset.id}`,
                idEstatus: 4
            });
        });
    
        return orderWrapper;
    }
});
