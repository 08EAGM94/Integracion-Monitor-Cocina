window.addEventListener("load", () =>{

    const socket = io();

    var comandaScreen = document.querySelector("#screen1");
    var finishZone = document.querySelector("#screen2");
    var cautionWindow = document.querySelector("#cautionWindow");
    var backgroundWindow = document.querySelector("#backgroudZone");
    var cautionMessage = document.querySelector("#caution-message");
    var confirmationWindow = document.querySelector("#windowConfirmation");
    var confirmationMessage = document.querySelector("#confirm__message");
    

    const cautionNoBtn = document.querySelector("#caution-cancel");
    const confirmBtn = document.querySelector("#confirm-btn");
    const softIcon = document.querySelector(".softappetit-container");


    //-------------SOCKET----------------------------------------------------

    socket.on("server-loadOrders", orders =>{
        comandaScreen.innerHTML = "";
        finishZone.innerHTML = "";
        orders.forEach(order =>{
            if(order.estatus == "Terminado"){
                finishZone.append(finishedTicketGenerator(order));
            }else if(order.estatus == "Proceso"){
                comandaScreen.innerHTML += `
                <div class="comanda-screen__comanda-id">
                    <div class="comanda-screen_dot-1"></div>
                    <div class="comanda-screen_dot-2"></div>
                    <div class="comanda-id__second-part">
                        <div class="comanda-id__client-id">ID: ${order.numero_comanda}</div>
                        <div class="comanda-id__client-name">${order.nombre_cliente}</div>
                    </div>
                </div>
                `;
            }
        });
    });

    //-------------SOCKET----------------------------------------------------
    
    //-------------EVENTS----------------------------------------------------

    cautionNoBtn.addEventListener("click", () =>{
        const yesBtn = cautionWindow.querySelector(".caution__yes-btn");
        backgroundWindow.classList.add("hidthis");
        cautionWindow.classList.add("hidthis");
        if(yesBtn){
            yesBtn.remove();
        }
    });

    confirmBtn.addEventListener("click", () =>{
        backgroundWindow.classList.add("hidthis");
        confirmationWindow.classList.add("hidthis");
    });

    if(window.innerWidth <= 1200){
        softIcon.classList.add("increseWidth");
        softIcon.innerHTML = '<img class="softappetit__img2" src="assets/img/unnamed1.png"/>';
    }

    window.addEventListener("resize", () =>{
        if(window.innerWidth <= 1200){
            softIcon.classList.add("increseWidth");
            softIcon.innerHTML = '<img class="softappetit__img2" src="assets/img/unnamed1.png"/>';
        }else{
            softIcon.classList.remove("increseWidth");
            softIcon.innerHTML = '<img class="softappetit__img" src="assets/img/unnamed.png"/>';
        }
    });

    //-------------EVENTS----------------------------------------------------


    //-------------UI FUNCTION----------------------------------------------------

    const finishedTicketGenerator = order =>{
        const cautionYesBtn = document.createElement("div");
        const ticketDiv = document.createElement("div");
        ticketDiv.classList.add("finish-screen__finish-id");
        ticketDiv.innerHTML = `
            <div class="delivered-btn" data-id="${order.order_id}">X</div>
            <div class="comanda-screen_dot-1"></div>
            <div class="comanda-screen_dot-2"></div>
            <div class="finish-screen__client-container">
            <div class="finish-screen__client-header">${order.nombre_cliente}</div>
            <div class="finish-screen__client">ID: ${order.numero_comanda}</div>
        `;

        const deleteBtn = ticketDiv.querySelector(".delivered-btn");
        deleteBtn.addEventListener("click", () =>{
            console.log(deleteBtn.dataset.id);
            backgroundWindow.classList.remove("hidthis");
            cautionWindow.classList.remove("hidthis");
            cautionMessage.innerHTML = `¿Confirmar entrega?`;
            cautionYesBtn.innerHTML = `<div class="caution__yes-btn" data-id="${deleteBtn.dataset.id}">Si</div>`;
            cautionWindow.append(cautionYesBtn);

            const yesBtn = cautionWindow.querySelector(".caution__yes-btn");
            yesBtn.addEventListener("click", () =>{
                cautionWindow.classList.add("hidthis");
                confirmationWindow.classList.remove("hidthis");
                confirmationMessage.innerHTML = `ID "${order.numero_comanda}" Entregado`;
                if(order.numero_monitor == null){
                    socket.emit("clientUpdateStatus", {
                        id: yesBtn.dataset.id,
                        estatus: "Entregado",
                        idMonitor: "Sin asignar" 
                    });
                }else{
                    socket.emit("clientUpdateStatus", {
                        idMonitor: order.numero_monitor,
                        estatus: "Entregado",
                        idEstatus: 4 
                    });
                }
                
                yesBtn.remove();
            });
        });

        return ticketDiv;
    }

    //-------------UI FUNCTION----------------------------------------------------

});

