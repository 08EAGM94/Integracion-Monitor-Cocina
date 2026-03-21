window.addEventListener("load", () =>{

    const socket = io();
    
    const selectWindowZone = document.querySelector("#selected-option-zone");
    const popUpWindow = document.querySelector("#popUpWindow");

    const orderBtn = document.querySelector("#newOrder")
    const rowsZone = document.querySelector("#rowsZone");
    const cleanBtn = document.querySelector("#deleteOrders");
    
     
    

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
    
    
    orderBtn.addEventListener("click", () =>{
        selectWindowZone.classList.remove("hidthis");
        if(popUpWindow.className.includes("activate-pop-out")) popUpWindow.classList.remove("activate-pop-out");
        popUpWindow.classList.add("activate-pop-up");
        popUpWindow.innerHTML = `
            <form class="window-form" id="orderForm">
                <div class="window-form__cancel-btn" id="pattsu">X</div>
                <h2 class="window-form__title">Ordenar</h2>

                <div class="window-form__comanda-field-wrapper">
                <label class="comanda-label" for="comanda-id">No. Comanda</label>
                <input class="comanda-input" id="comanda-id" type="text" name="no-comanda"/>
                </div>

                <div class="window-form__customer-field-wrapper">
                <label class="customer-label" for="customer-name">Nombre del Cliente</label>
                <input class="customer-input" id="customer-name" type="text" name="cliente-nombre"/>
                </div>

                <div class="window-form__btn-wrapper">
                <input class="window-form__btn" type="submit" value="Guardar" id="saveBtn"/>
                </div>
            </form>
        `;

        const orderForm = popUpWindow.querySelector("#orderForm");
        const closeBtn = orderForm.querySelector("#pattsu");

        closeBtn.addEventListener("click", () =>{
            popUpWindow.classList.remove("activate-pop-up");
            popUpWindow.classList.add("activate-pop-out");
            setTimeout(() => {
                popUpWindow.innerHTML = "";
                selectWindowZone.classList.add("hidthis");
            }, 200);
            
        });

        orderForm.addEventListener("submit", (e) =>{
            e.preventDefault();

            popUpWindow.innerHTML = "";

            const iconWrap = document.createElement("div")
            iconWrap.classList.add("pop-up-window__icon-wrap");
            const popUpMessage = document.createElement("div")
            popUpMessage.classList.add("pop-up-window__message");
            const popUpBtnsWrapper = document.createElement("div")
            popUpBtnsWrapper.classList.add("btns-wrapper");
            popUpBtnsWrapper.classList.add("btn-center");
            popUpWindow.append(iconWrap);
            popUpWindow.append(popUpMessage);
            popUpWindow.append(popUpBtnsWrapper);

            if(orderForm["comanda-id"].value == "" || orderForm["customer-name"].value == ""){

                iconWrap.innerHTML = '<div class="window__caoution"><img class="caution__img" src="assets/img/caution-sign_75243.png"/></div>';
                popUpMessage.innerHTML = "<h2>Los campos están vacios, se tiene que escribir un Id de comanda y el nombre del cliente</h2>";
                popUpBtnsWrapper.innerHTML = `<button class="caution__yes-btn">OK</button>`;
                const okBtn = popUpBtnsWrapper.querySelector(".caution__yes-btn");
                
                okBtn.addEventListener("click", () =>{
                    popUpWindow.classList.remove("activate-pop-up");
                    popUpWindow.classList.add("activate-pop-out");
                    setTimeout(() => {
                        iconWrap.remove();
                        popUpMessage.remove();
                        popUpBtnsWrapper.remove();
                        selectWindowZone.classList.add("hidthis");
                    }, 200);   
                     
                });
            
            }else{

                iconWrap.innerHTML = '<img class="pop-up-window__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
                popUpMessage.innerHTML = `<h2>Se agregó un pedido con la comanda "${orderForm["comanda-id"].value.replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;')}" y cliente "${orderForm["customer-name"].value.replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;')}" correctamente</h2>`;
                socket.emit("clientNewOrder", {
                    numero_comanda: `${orderForm["comanda-id"].value}`,
                    nombre_cliente: `${orderForm["customer-name"].value}`,
                    estatus: "Ordenado"
                });
                popUpBtnsWrapper.innerHTML = `<button class="caution__yes-btn">OK</button>`;
                const okBtn = popUpBtnsWrapper.querySelector(".caution__yes-btn");
                okBtn.addEventListener("click", () =>{
                    popUpWindow.classList.remove("activate-pop-up");
                    popUpWindow.classList.add("activate-pop-out");
                    setTimeout(() => {
                        iconWrap.remove();
                        popUpMessage.remove();
                        popUpBtnsWrapper.remove();
                        selectWindowZone.classList.add("hidthis");
                    }, 200);
                });
                
            }
            
        });
    });
    
    cleanBtn.addEventListener("click", () =>{

        selectWindowZone.classList.remove("hidthis");
        if(popUpWindow.className.includes("activate-pop-out")) popUpWindow.classList.remove("activate-pop-out");
        popUpWindow.classList.add("activate-pop-up");
        
        const iconWrap = document.createElement("div")
        iconWrap.classList.add("pop-up-window__icon-wrap");
        const popUpMessage = document.createElement("div")
        popUpMessage.classList.add("pop-up-window__message");
        const popUpBtnsWrapper = document.createElement("div")
        popUpBtnsWrapper.classList.add("btns-wrapper");
        popUpWindow.append(iconWrap);
        popUpWindow.append(popUpMessage);
        popUpWindow.append(popUpBtnsWrapper);
        
        iconWrap.innerHTML = '<div class="window__caoution"><img class="caution__img" src="assets/img/caution-sign_75243.png"/></div>';
        popUpMessage.innerHTML = "<h2>¿Deseas eliminar todos los pedidos?</h2>";
        popUpBtnsWrapper.innerHTML = `<div class="caution__yes-btn">Si</div>
        <div class="caution__no-btn">No</div>
        `;
        const afirmativeBtn = popUpBtnsWrapper.querySelector(".caution__yes-btn");
        afirmativeBtn.addEventListener("click", () =>{
            iconWrap.innerHTML = '<img class="pop-up-window__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
            popUpMessage.innerHTML = "<h2>Las ordenes han sido eliminadas</h2>";
            popUpBtnsWrapper.innerHTML = `<button class="caution__yes-btn">OK</button>`;
            popUpBtnsWrapper.classList.add("btn-center");
            const idArr = [7,10,13,17,22,23];
            socket.emit("clientUpdateIds", idArr);
            socket.emit("clientDeleteAll", {
                clientSay: "yes"
            });
            const okBtn = popUpBtnsWrapper.querySelector(".caution__yes-btn");
            okBtn.addEventListener("click", () =>{
                popUpWindow.classList.remove("activate-pop-up");
                popUpWindow.classList.add("activate-pop-out");
                setTimeout(() => {
                    iconWrap.remove();
                    popUpMessage.remove();
                    popUpBtnsWrapper.remove();
                    selectWindowZone.classList.add("hidthis");
                }, 200);
            });    
        });

        const noBtn = popUpBtnsWrapper.querySelector(".caution__no-btn")
        noBtn.addEventListener("click", () =>{
            popUpWindow.classList.remove("activate-pop-up");
            popUpWindow.classList.add("activate-pop-out");
            setTimeout(() => {
                iconWrap.remove();
                popUpMessage.remove();
                popUpBtnsWrapper.remove();
                selectWindowZone.classList.add("hidthis");
            }, 200);
        });                        
    });

    //-------------EVENTS----------------------------------

    //-------------UI FUNCTION----------------------------------
    
    const rowGenerator = order => {
        let numero_monitor = "";
        const tableRow = document.createElement("tr");
        tableRow.classList.add("rowsZone__trow");
        (order.numero_monitor == null) ? numero_monitor = "Sin asignar" : numero_monitor = order.numero_monitor;
        tableRow.innerHTML = `
        <td class="trow-column">${order.order_id}</td>
        <td class="trow-column">${numero_monitor}</td>
        <td class="trow-column">${order.numero_comanda}</td>
        <td class="trow-column">${order.nombre_cliente}</td>
        <td class="trow-column">
            <select class="row__select" data-id="${order.order_id}" name="status">
                <option value="Ordenado" ${(order.estatus === "Ordenado") ? "selected" : ""}>Ordenado</option>
                <option value="Proceso" ${(order.estatus === "Proceso") ? "selected" : ""}>Proceso</option>
                <option value="Terminado" ${(order.estatus === "Terminado") ? "selected" : ""}>Terminado</option>
                <option value="Entregado" ${(order.estatus === "Entregado") ? "selected" : ""}>Entregado</option>
            </select>
        </td>
        <td class="trow-column">
            <button class="delete-order-btn" data-id="${order.order_id}">X</button>
        </td>
        `;
        
        const optionElem = tableRow.querySelector(".row__select");
        const deleteBtn = tableRow.querySelector(".delete-order-btn");
        deleteBtn.addEventListener("click", () =>{
            
            selectWindowZone.classList.remove("hidthis");
            if(popUpWindow.className.includes("activate-pop-out")) popUpWindow.classList.remove("activate-pop-out");
            popUpWindow.classList.add("activate-pop-up");

            const iconWrap = document.createElement("div")
            iconWrap.classList.add("pop-up-window__icon-wrap");
            const popUpMessage = document.createElement("div")
            popUpMessage.classList.add("pop-up-window__message");
            const popUpBtnsWrapper = document.createElement("div")
            popUpBtnsWrapper.classList.add("btns-wrapper");

            iconWrap.innerHTML = '<div class="window__caoution"><img class="caution__img" src="assets/img/caution-sign_75243.png"/></div>';
            popUpMessage.innerHTML = `<h2>¿Deseas eliminar el pedido con ID ${optionElem.dataset.id}?</h2>`;
            popUpBtnsWrapper.innerHTML = `<button class="caution__yes-btn" data-id="${optionElem.dataset.id}">Si</button>
                <button class="caution__no-btn">No</button>`;
            
            popUpWindow.append(iconWrap);
            popUpWindow.append(popUpMessage);
            popUpWindow.append(popUpBtnsWrapper);

            const yesBtn = popUpBtnsWrapper.querySelector(".caution__yes-btn");
            yesBtn.addEventListener("click", () =>{
                iconWrap.innerHTML = '<img class="pop-up-window__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
                popUpMessage.innerHTML = `<h2>Pedido con ID - "${yesBtn.dataset.id}" eliminado exitosamente</h2>`;
                popUpBtnsWrapper.innerHTML = `<button class="confirm__btn" data-id="${optionElem.dataset.id}">OK</button>`;
                popUpBtnsWrapper.classList.add("btn-center");
                socket.emit("clientDeleteOrder", {id: yesBtn.dataset.id, idMonitor: numero_monitor});
                const okBtn = popUpBtnsWrapper.querySelector(".confirm__btn");
                okBtn.addEventListener("click", () =>{
                    popUpWindow.classList.remove("activate-pop-up");
                    popUpWindow.classList.add("activate-pop-out");
                    setTimeout(() => {
                        iconWrap.remove();
                        popUpMessage.remove();
                        popUpBtnsWrapper.remove();
                        selectWindowZone.classList.add("hidthis");
                    }, 200);
                });
            });

            const noBtn = popUpBtnsWrapper.querySelector(".caution__no-btn")
            noBtn.addEventListener("click", () =>{
                popUpWindow.classList.remove("activate-pop-up");
                popUpWindow.classList.add("activate-pop-out");
                setTimeout(() => {
                    iconWrap.remove();
                    popUpMessage.remove();
                    popUpBtnsWrapper.remove();
                    selectWindowZone.classList.add("hidthis");
                }, 200);
            });

        });

        optionElem.onchange = () => {

            selectWindowZone.classList.remove("hidthis");
            if(popUpWindow.className.includes("activate-pop-out")) popUpWindow.classList.remove("activate-pop-out");
            popUpWindow.classList.add("activate-pop-up");
        
            const iconWrap = document.createElement("div")
            iconWrap.classList.add("pop-up-window__icon-wrap");
            const popUpMessage = document.createElement("div")
            popUpMessage.classList.add("pop-up-window__message");
            const popUpBtnsWrapper = document.createElement("div")
            popUpBtnsWrapper.classList.add("btns-wrapper");

            iconWrap.innerHTML = '<div class="window__caoution"><img class="caution__img" src="assets/img/caution-sign_75243.png"/></div>';
            popUpMessage.innerHTML = `<h2>¿Deseas cambiar el estatus del pedido con ID ${optionElem.dataset.id} a ${optionElem.value}?</h2>`;
            popUpBtnsWrapper.innerHTML = `<button class="caution__yes-btn" data-id="${optionElem.dataset.id}">Si</button>
                <button class="caution__no-btn">No</button>`;
            
            popUpWindow.append(iconWrap);
            popUpWindow.append(popUpMessage);
            popUpWindow.append(popUpBtnsWrapper);

            if(optionElem.value == "Proceso"){
                

                const yesBtnProccess = popUpBtnsWrapper.querySelector(".caution__yes-btn");
                yesBtnProccess.addEventListener("click", () =>{

                    iconWrap.innerHTML = '<img class="pop-up-window__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
                    popUpMessage.innerHTML = `<h2>Pedido con ID - "${yesBtnProccess.dataset.id}" con estatus modificado exitosamente a "${optionElem.value}"</h2>`;
                    popUpBtnsWrapper.innerHTML = `<button class="confirm__btn" data-id="${optionElem.dataset.id}">OK</button>`;
                    popUpBtnsWrapper.classList.add("btn-center");
                    socket.emit("clientUpdateStatus", {
                        id: yesBtnProccess.dataset.id,
                        estatus: `${encodeURIComponent(optionElem.value)}`,
                        idMonitor: numero_monitor,
                        idEstatus: 2
                    });
                    const okBtnProccess = popUpBtnsWrapper.querySelector(".confirm__btn");
                    okBtnProccess.addEventListener("click", () =>{
                        popUpWindow.classList.remove("activate-pop-up");
                        popUpWindow.classList.add("activate-pop-out");
                        setTimeout(() => {
                            iconWrap.remove();
                            popUpMessage.remove();
                            popUpBtnsWrapper.remove();
                            selectWindowZone.classList.add("hidthis");
                        }, 200);
                    });       
                });

                const noBtnProccess = popUpBtnsWrapper.querySelector(".caution__no-btn")
                noBtnProccess.addEventListener("click", () =>{
                    optionElem.innerHTML = `
                        <option value="Ordenado" ${(order.estatus === "Ordenado") ? "selected" : ""}>Ordenado</option>
                        <option value="Proceso" ${(order.estatus === "Proceso") ? "selected" : ""}>Proceso</option>
                        <option value="Terminado" ${(order.estatus === "Terminado") ? "selected" : ""}>Terminado</option>
                        <option value="Entregado" ${(order.estatus === "Entregado") ? "selected" : ""}>Entregado</option>
                    `;
                    popUpWindow.classList.remove("activate-pop-up");
                    popUpWindow.classList.add("activate-pop-out");
                    setTimeout(() => {
                        iconWrap.remove();
                        popUpMessage.remove();
                        popUpBtnsWrapper.remove();
                        selectWindowZone.classList.add("hidthis");
                    }, 200); 
                });

            }else if(optionElem.value == "Terminado"){

                const yesBtnFinish = popUpBtnsWrapper.querySelector(".caution__yes-btn");
                yesBtnFinish.addEventListener("click", () =>{
                    iconWrap.innerHTML = '<img class="pop-up-window__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
                    popUpMessage.innerHTML = `<h2>Pedido con ID - "${yesBtnFinish.dataset.id}" con estatus modificado exitosamente a "${optionElem.value}"</h2>`;
                    popUpBtnsWrapper.innerHTML = `<button class="confirm__btn" data-id="${optionElem.dataset.id}">OK</button>`;
                    popUpBtnsWrapper.classList.add("btn-center");
                    socket.emit("clientUpdateStatus", {
                        id: yesBtnFinish.dataset.id,
                        estatus: `${encodeURIComponent(optionElem.value)}`,
                        idMonitor: numero_monitor,
                        idEstatus: 3
                    });
                    const okBtnFinish = popUpBtnsWrapper.querySelector(".confirm__btn");
                    okBtnFinish.addEventListener("click", () =>{
                        popUpWindow.classList.remove("activate-pop-up");
                        popUpWindow.classList.add("activate-pop-out");
                        setTimeout(() => {
                            iconWrap.remove();
                            popUpMessage.remove();
                            popUpBtnsWrapper.remove();
                            selectWindowZone.classList.add("hidthis");
                        }, 200);
                    });
                });

                const noBtnFinish = popUpBtnsWrapper.querySelector(".caution__no-btn")
                noBtnFinish.addEventListener("click", () =>{
                    optionElem.innerHTML = `
                        <option value="Ordenado" ${(order.estatus === "Ordenado") ? "selected" : ""}>Ordenado</option>
                        <option value="Proceso" ${(order.estatus === "Proceso") ? "selected" : ""}>Proceso</option>
                        <option value="Terminado" ${(order.estatus === "Terminado") ? "selected" : ""}>Terminado</option>
                        <option value="Entregado" ${(order.estatus === "Entregado") ? "selected" : ""}>Entregado</option>
                    `;
                    popUpWindow.classList.remove("activate-pop-up");
                    popUpWindow.classList.add("activate-pop-out");
                    setTimeout(() => {
                        iconWrap.remove();
                        popUpMessage.remove();
                        popUpBtnsWrapper.remove();
                        selectWindowZone.classList.add("hidthis");
                    }, 200); 
                });

            }else if(optionElem.value == "Entregado"){

                const yesBtnDelivery = popUpBtnsWrapper.querySelector(".caution__yes-btn");
                yesBtnDelivery.addEventListener("click", () =>{
                    iconWrap.innerHTML = '<img class="pop-up-window__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
                    popUpMessage.innerHTML = `<h2>Pedido con ID - "${yesBtnDelivery.dataset.id}" con estatus modificado exitosamente a "${optionElem.value}"</h2>`;
                    popUpBtnsWrapper.innerHTML = `<button class="confirm__btn" data-id="${optionElem.dataset.id}">OK</button>`;
                    popUpBtnsWrapper.classList.add("btn-center");
                    socket.emit("clientUpdateStatus", {
                        id: yesBtnDelivery.dataset.id,
                        estatus: `${encodeURIComponent(optionElem.value)}`,
                        idMonitor: numero_monitor,
                        idEstatus: 4
                    });
                    const okBtnDelivery = popUpBtnsWrapper.querySelector(".confirm__btn");
                    okBtnDelivery.addEventListener("click", () =>{
                        popUpWindow.classList.remove("activate-pop-up");
                        popUpWindow.classList.add("activate-pop-out");
                        setTimeout(() => {
                            iconWrap.remove();
                            popUpMessage.remove();
                            popUpBtnsWrapper.remove();
                            selectWindowZone.classList.add("hidthis");
                        }, 200);
                    });
                });

                const noBtnDelivery = popUpBtnsWrapper.querySelector(".caution__no-btn")
                noBtnDelivery.addEventListener("click", () =>{
                    optionElem.innerHTML = `
                        <option value="Ordenado" ${(order.estatus === "Ordenado") ? "selected" : ""}>Ordenado</option>
                        <option value="Proceso" ${(order.estatus === "Proceso") ? "selected" : ""}>Proceso</option>
                        <option value="Terminado" ${(order.estatus === "Terminado") ? "selected" : ""}>Terminado</option>
                        <option value="Entregado" ${(order.estatus === "Entregado") ? "selected" : ""}>Entregado</option>
                    `;
                    popUpWindow.classList.remove("activate-pop-up");
                    popUpWindow.classList.add("activate-pop-out");
                    setTimeout(() => {
                        iconWrap.remove();
                        popUpMessage.remove();
                        popUpBtnsWrapper.remove();
                        selectWindowZone.classList.add("hidthis");
                    }, 200); 
                });

            }else if(optionElem.value == "Ordenado"){

                const yesBtnOrder = popUpBtnsWrapper.querySelector(".caution__yes-btn");
                yesBtnOrder.addEventListener("click", () =>{
                    iconWrap.innerHTML = '<img class="pop-up-window__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
                    popUpMessage.innerHTML = `<h2>Pedido con ID - "${yesBtnOrder.dataset.id}" con estatus modificado exitosamente a "${optionElem.value}"</h2>`;
                    popUpBtnsWrapper.innerHTML = `<button class="confirm__btn" data-id="${optionElem.dataset.id}">OK</button>`;
                    popUpBtnsWrapper.classList.add("btn-center");
                    socket.emit("clientUpdateStatus", {
                        id: yesBtnOrder.dataset.id,
                        estatus: `${encodeURIComponent(optionElem.value)}`,
                        idMonitor: numero_monitor,
                        idEstatus: 1
                    });
                    const okBtnOrder = popUpBtnsWrapper.querySelector(".confirm__btn");
                    okBtnOrder.addEventListener("click", () =>{
                        popUpWindow.classList.remove("activate-pop-up");
                        popUpWindow.classList.add("activate-pop-out");
                        setTimeout(() => {
                            iconWrap.remove();
                            popUpMessage.remove();
                            popUpBtnsWrapper.remove();
                            selectWindowZone.classList.add("hidthis");
                        }, 200);
                    });
                });

                const noBtnOrder = popUpBtnsWrapper.querySelector(".caution__no-btn")
                noBtnOrder.addEventListener("click", () =>{
                    optionElem.innerHTML = `
                        <option value="Ordenado" ${(order.estatus === "Ordenado") ? "selected" : ""}>Ordenado</option>
                        <option value="Proceso" ${(order.estatus === "Proceso") ? "selected" : ""}>Proceso</option>
                        <option value="Terminado" ${(order.estatus === "Terminado") ? "selected" : ""}>Terminado</option>
                        <option value="Entregado" ${(order.estatus === "Entregado") ? "selected" : ""}>Entregado</option>
                    `;
                    popUpWindow.classList.remove("activate-pop-up");
                    popUpWindow.classList.add("activate-pop-out");
                    setTimeout(() => {
                        iconWrap.remove();
                        popUpMessage.remove();
                        popUpBtnsWrapper.remove();
                        selectWindowZone.classList.add("hidthis");
                    }, 200);
                });

            }
        };
        return tableRow;
    }

    //-------------UI FUNCTION----------------------------------
});