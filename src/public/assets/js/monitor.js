window.addEventListener("load", () =>{
    const socket = io();
    const orderMonitor = document.querySelector("#orderMonitor");
    let originalIdsOrder = [];
    const allOfScreens = new Map();
    const pendingScreensClient = new Map();
    const orderLabel = document.querySelector("#orderLabel");
    const processLabel = document.querySelector("#processLabel");
    const deliveredLabel = document.querySelector("#deliveredLabel");
    const resetLink = document.querySelector("#resetLink");

    

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
                originalIdsOrder.push(screen.ID);
                pendingScreensClient.set(screen.ID, screen);
                socket.emit('clientWantCliInfo', {idScreen: screen.ID, idComanda: screen.IdComanda});
            }
        });
    });
    
    socket.on("serverSendCliInfo", (cliName, cliFolio) =>{
        const clientName = cliName[0].Nombre;
        const clientFolio = cliFolio[0].Folio;
        const idscreen = cliName[1].Idscreen;
        const screen = pendingScreensClient.get(idscreen);
        if(screen){
            allOfScreens.set(idscreen, {screen, clientName, clientFolio});
            pendingScreensClient.delete(idscreen);
        }

        if(allOfScreens.size === originalIdsOrder.length){
            originalIdsOrder.forEach(id =>{
                const data = allOfScreens.get(id);
                orderMonitor.append(generateScreens(data.screen, data.clientName, data.clientFolio));
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
                //console.log(orderButton.dataset.id);
                //console.log(cliFolio);
                //console.log(cliente);
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