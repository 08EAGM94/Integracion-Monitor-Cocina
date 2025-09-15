window.addEventListener("load", () =>{

    const socket = io();
    
    const selectWindowZone = document.querySelector("#selected-option-zone");
    const selectWindow = document.querySelector("#selected-option-window");
    const selectWindowConfirmation = document.querySelector("#option-window-confirmation");
    const cautionMessage = document.querySelector("#caution-message");
    const confirmationMessage = document.querySelector("#confirm__message");

    const orderForm = document.querySelector("#orderForm");
    const orderWindow = document.querySelector("#orderWindow");
    const confirmationBtn = document.querySelector("#confirm-btn");
    const orderBtn = document.querySelector("#newOrder")
    const rowsZone = document.querySelector("#rowsZone");
    const formCancelBtn = document.querySelector("#pattsu");
    const cleanBtn = document.querySelector("#deleteOrders");
    const confirmationIcon = document.querySelector("#iconWrap");
     
    

    //--------------------SOCKETS--------------------------

    socket.on("server-loadOrders", orders =>{
        rowsZone.innerHTML = "";
        orders.forEach(order =>{
            rowsZone.append(rowGenerator(order));
        })
    });
    
    socket.on("serverSavedRow", savedRow =>{
        rowsZone.append(rowGenerator(savedRow));
    })
        

    //--------------------SOCKETS--------------------------

    //-------------EVENTS----------------------------------
    
    confirmationBtn.addEventListener("click", () =>{
        const orderCautionIcon = selectWindowConfirmation.querySelector("#orderCautionIcon");
        selectWindowZone.classList.add("hidthis");
        selectWindowConfirmation.classList.add("hidthis");
        if(orderCautionIcon){
            confirmationIcon.innerHTML = '<img class="selected-option__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
        }
    });
    
    orderBtn.addEventListener("click", () =>{
        selectWindowZone.classList.remove("hidthis");
        orderWindow.classList.remove("hidthis");
    });
 

    orderForm.addEventListener("submit", (e) =>{
        e.preventDefault();
        if(orderForm["comanda-id"].value == "" || orderForm["customer-name"].value == ""){
            orderWindow.classList.add("hidthis");
            selectWindowConfirmation.classList.remove("hidthis");
            confirmationIcon.innerHTML = '<img class="caution__img" style="position: relative;bottom: -1%;left: 10%;width: 73%;height: 73%;" id="orderCautionIcon" src="assets/img/[CITYPNG.COM]Warning Caution Triangle Mark Black Icon FREE PNG - 1500x1500.png"/>';
            confirmationMessage.innerHTML = "Los campos están vacios, se tiene que escribir un Id de comanda y el nombre del cliente";
        }else{
            orderWindow.classList.add("hidthis");
            selectWindowConfirmation.classList.remove("hidthis");
            confirmationMessage.innerHTML = `Se agregó un pedido con la comanda "${orderForm["comanda-id"].value}" y cliente "${orderForm["customer-name"].value}" correctamente`;
            socket.emit("clientNewOrder", {
                numero_comanda: `${orderForm["comanda-id"].value}`,
                nombre_cliente: `${orderForm["customer-name"].value}`,
                estatus: "Ordenado"
            });
            orderForm["comanda-id"].value = "";
            orderForm["customer-name"].value = "";
        }
        
    });

    formCancelBtn.addEventListener("click", () =>{
        selectWindowZone.classList.add("hidthis");
        orderWindow.classList.add("hidthis");
    });

    cleanBtn.addEventListener("click", () =>{
        const cautionBtn = document.createElement("div");
        const cautionNoBtn = document.createElement("div");
        selectWindowZone.classList.remove("hidthis");
        selectWindow.classList.remove("hidthis");
        cautionMessage.innerHTML = "¿Deseas eliminar todos las ordenes?";
        cautionBtn.innerHTML = '<div class="caution__yes-btn">Si</div>';
        cautionNoBtn.innerHTML = '<div class="caution__no-btn">No</div>';
        selectWindow.append(cautionBtn);
        selectWindow.append(cautionNoBtn);

        const afirmativeBtn = selectWindow.querySelector(".caution__yes-btn");
        afirmativeBtn.addEventListener("click", () =>{
            selectWindow.classList.add("hidthis");
            selectWindowConfirmation.classList.remove("hidthis");
            confirmationMessage.innerHTML = "Las ordenes han sido eliminadas";
            const idArr = [7,10,13,17,22,23];
            socket.emit("clientUpdateIds", idArr);
            socket.emit("clientDeleteAll", {
                clientSay: "yes"
            });
            cautionNoBtn.remove();
            cautionBtn.remove();
        });

        const noBtn = selectWindow.querySelector(".caution__no-btn")
        noBtn.addEventListener("click", () =>{
            selectWindowZone.classList.add("hidthis");
            selectWindow.classList.add("hidthis");
            cautionBtn.remove();
            cautionNoBtn.remove();
        });                        
    });

    //-------------EVENTS----------------------------------

    //-------------UI FUNCTION----------------------------------

    const rowGenerator = order => {
        let numero_monitor = "";
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("order-view__rows-wrapper");
        (order.numero_monitor == null) ? numero_monitor = "Sin asignar" : numero_monitor = order.numero_monitor;
        rowDiv.innerHTML = `
        <div class="order-view__rows">${order.order_id}</div>
        <div class="order-view__rows">${numero_monitor}</div>
        <div class="order-view__rows">${order.numero_comanda}</div>
        <div class="order-view__rows">${order.nombre_cliente}</div>
        <div class="order-view__rows">
            <div class="select__screen-status">${order.estatus}</div>
            <select class="row__select" data-id="${order.order_id}" name="status">
                <option value="Ordenado">Ordenado</option>
                <option value="Proceso">Proceso</option>
                <option value="Terminado">Terminado</option>
                <option value="Entregado">Entregado</option>
            </select>
        </div>
        `;
        
        const optionElem = rowDiv.querySelector(".row__select");
        optionElem.onchange = () => {
            console.log(optionElem.dataset.id);
            if(optionElem.value == "Proceso"){
                const cautionYesBtnProccess = document.createElement("div");
                const cautionNoBtnProccess = document.createElement("div");
                selectWindowZone.classList.remove("hidthis");
                selectWindow.classList.remove("hidthis");
                cautionMessage.innerHTML = `¿Deseas cambiar a ${optionElem.value}?`;
                cautionYesBtnProccess.innerHTML = `<div class="caution__yes-btn" data-id="${optionElem.dataset.id}">Si</div>`;
                cautionNoBtnProccess.innerHTML = `<div class="caution__no-btn" data-id="${optionElem.dataset.id}">No</div>`;
                selectWindow.append(cautionYesBtnProccess);
                selectWindow.append(cautionNoBtnProccess);

                const yesBtnProccess = selectWindow.querySelector(".caution__yes-btn");
                yesBtnProccess.addEventListener("click", () =>{
                    console.log(yesBtnProccess.dataset.id);
                    selectWindow.classList.add("hidthis");
                    selectWindowConfirmation.classList.remove("hidthis");
                    confirmationMessage.innerHTML = `Pedido con ID - "${yesBtnProccess.dataset.id}" con estatus modificado con "${optionElem.value}"`;
                    socket.emit("clientUpdateStatus", {
                        id: yesBtnProccess.dataset.id,
                        estatus: `${optionElem.value}`,
                        idMonitor: numero_monitor,
                        idEstatus: 2
                    });
                    optionElem.value = "";
                    cautionNoBtnProccess.remove();
                    cautionYesBtnProccess.remove();
                });

                const noBtnProccess = selectWindow.querySelector(".caution__no-btn")
                noBtnProccess.addEventListener("click", () =>{
                    selectWindowZone.classList.add("hidthis");
                    selectWindow.classList.add("hidthis");
                    //location.reload();
                    optionElem.value = "";
                    cautionYesBtnProccess.remove();
                    cautionNoBtnProccess.remove(); 
                });

            }else if(optionElem.value == "Terminado"){
                const cautionYesBtnFinish = document.createElement("div");
                const cautionNoBtnFinish = document.createElement("div");
                selectWindowZone.classList.remove("hidthis");
                selectWindow.classList.remove("hidthis");
                cautionMessage.innerHTML = `¿Deseas cambiar a ${optionElem.value}?`;
                cautionYesBtnFinish.innerHTML = `<div class="caution__yes-btn" data-id="${optionElem.dataset.id}">Si</div>`;
                cautionNoBtnFinish.innerHTML = `<div class="caution__no-btn" data-id="${optionElem.dataset.id}">No</div>`;
                selectWindow.append(cautionYesBtnFinish);
                selectWindow.append(cautionNoBtnFinish);

                const yesBtnFinish = selectWindow.querySelector(".caution__yes-btn");
                yesBtnFinish.addEventListener("click", () =>{
                    console.log(yesBtnFinish.dataset.id);
                    selectWindow.classList.add("hidthis");
                    selectWindowConfirmation.classList.remove("hidthis");
                    confirmationMessage.innerHTML = `Pedido con ID - "${yesBtnFinish.dataset.id}" con estatus modificado con "${optionElem.value}"`;
                    socket.emit("clientUpdateStatus", {
                        id: yesBtnFinish.dataset.id,
                        estatus: `${optionElem.value}`,
                        idMonitor: numero_monitor,
                        idEstatus: 3
                    });
                    optionElem.value = "";
                    cautionNoBtnFinish.remove(); 
                    cautionYesBtnFinish.remove();
                });

                const noBtnFinish = selectWindow.querySelector(".caution__no-btn")
                noBtnFinish.addEventListener("click", () =>{
                    selectWindowZone.classList.add("hidthis");
                    selectWindow.classList.add("hidthis");
                    //location.reload();
                    optionElem.value = "";
                    cautionYesBtnFinish.remove();
                    cautionNoBtnFinish.remove(); 
                });

            }else if(optionElem.value == "Entregado"){
                const cautionYesBtnDelivery = document.createElement("div");
                const cautionNoBtnDelivery = document.createElement("div");
                selectWindowZone.classList.remove("hidthis");
                selectWindow.classList.remove("hidthis");
                cautionMessage.innerHTML = `¿Deseas cambiar a ${optionElem.value}?`;
                cautionYesBtnDelivery.innerHTML = `<div class="caution__yes-btn" data-id="${optionElem.dataset.id}">Si</div>`;
                cautionNoBtnDelivery.innerHTML = `<div class="caution__no-btn" data-id="${optionElem.dataset.id}">No</div>`;
                selectWindow.append(cautionYesBtnDelivery);
                selectWindow.append(cautionNoBtnDelivery);

                const yesBtnDelivery = selectWindow.querySelector(".caution__yes-btn");
                yesBtnDelivery.addEventListener("click", () =>{
                    console.log(yesBtnDelivery.dataset.id);
                    selectWindow.classList.add("hidthis");
                    selectWindowConfirmation.classList.remove("hidthis");
                    confirmationMessage.innerHTML = `Pedido con ID - "${yesBtnDelivery.dataset.id}" con estatus modificado con "${optionElem.value}"`;
                    socket.emit("clientUpdateStatus", {
                        id: yesBtnDelivery.dataset.id,
                        estatus: `${optionElem.value}`,
                        idMonitor: numero_monitor,
                        idEstatus: 4
                    });
                    optionElem.value = "";
                    cautionNoBtnDelivery.remove(); 
                    cautionYesBtnDelivery.remove();
                });

                const noBtnDelivery = selectWindow.querySelector(".caution__no-btn")
                noBtnDelivery.addEventListener("click", () =>{
                    selectWindowZone.classList.add("hidthis");
                    selectWindow.classList.add("hidthis");
                    //location.reload();
                    optionElem.value = "";
                    cautionYesBtnDelivery.remove();
                    cautionNoBtnDelivery.remove(); 
                });

            }else if(optionElem.value == "Ordenado"){
                const cautionYesBtnOrder = document.createElement("div");
                const cautionNoBtnOrder = document.createElement("div");
                selectWindowZone.classList.remove("hidthis");
                selectWindow.classList.remove("hidthis");
                cautionMessage.innerHTML = `¿Deseas cambiar a ${optionElem.value}?`;
                cautionYesBtnOrder.innerHTML = `<div class="caution__yes-btn" data-id="${optionElem.dataset.id}">Si</div>`;
                cautionNoBtnOrder.innerHTML = `<div class="caution__no-btn" data-id="${optionElem.dataset.id}">No</div>`;
                selectWindow.append(cautionYesBtnOrder);
                selectWindow.append(cautionNoBtnOrder);

                const yesBtnOrder = selectWindow.querySelector(".caution__yes-btn");
                yesBtnOrder.addEventListener("click", () =>{
                    console.log(yesBtnOrder.dataset.id);
                    selectWindow.classList.add("hidthis");
                    selectWindowConfirmation.classList.remove("hidthis");
                    confirmationMessage.innerHTML = `Pedido con ID - "${yesBtnOrder.dataset.id}" con estatus modificado con "${optionElem.value}"`;
                    socket.emit("clientUpdateStatus", {
                        id: yesBtnOrder.dataset.id,
                        estatus: `${optionElem.value}`,
                        idMonitor: numero_monitor,
                        idEstatus: 1
                    });
                    optionElem.value = "";
                    cautionNoBtnOrder.remove();
                    cautionYesBtnOrder.remove();
                });

                const noBtnOrder = selectWindow.querySelector(".caution__no-btn")
                noBtnOrder.addEventListener("click", () =>{
                    selectWindowZone.classList.add("hidthis");
                    selectWindow.classList.add("hidthis");
                    //location.reload();
                    optionElem.value = "";
                    cautionYesBtnOrder.remove();
                    cautionNoBtnOrder.remove(); 
                });

            }
        };
        return rowDiv;
    }

    //-------------UI FUNCTION----------------------------------
});



