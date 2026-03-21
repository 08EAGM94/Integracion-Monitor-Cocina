window.addEventListener("load", () =>{

    const socket = io();

    const comandaScreen = document.querySelector("#screen1");
    const finishZone = document.querySelector("#screen2");
    const backgroundWindow = document.querySelector("#backgroudZone");
    const popUpWindow = document.querySelector("#popUpWindow");
    
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

            backgroundWindow.classList.remove("hidthis");
            if(popUpWindow.classList.contains("activate-pop-out")) popUpWindow.classList.remove("activate-pop-out");
            popUpWindow.classList.add("activate-pop-up");

            const iconWrap = document.createElement("div")
            iconWrap.classList.add("pop-up-window__icon-wrap");
            const popUpMessage = document.createElement("div")
            popUpMessage.classList.add("pop-up-window__message");
            const popUpBtnsWrapper = document.createElement("div")
            popUpBtnsWrapper.classList.add("btns-wrapper");

            iconWrap.innerHTML = '<div class="window__caoution"><img class="caution__img" src="assets/img/caution-sign_75243.png"/></div>';
            popUpMessage.innerHTML = `<h2>¿Deseas cambiar el pedido con folio de comanda "${order.numero_comanda}" a "entregado"?</h2>`;
            popUpBtnsWrapper.innerHTML = `<button class="caution__yes-btn" data-id="${deleteBtn.dataset.id}">Si</button>
                <button class="caution__no-btn">No</button>`;
            
            popUpWindow.append(iconWrap);
            popUpWindow.append(popUpMessage);
            popUpWindow.append(popUpBtnsWrapper);

            const yesBtn = popUpBtnsWrapper.querySelector(".caution__yes-btn");
            yesBtn.addEventListener("click", () =>{
                iconWrap.innerHTML = '<img class="pop-up-window__icon" src="assets/img/favpng_714583ca183e15e3ab76a7e70b5cfc1b.png"/>';
                popUpMessage.innerHTML = `<h2>El pedido con el folio de comanda "${order.numero_comanda}" ha sido entregado</h2>`;
                popUpBtnsWrapper.innerHTML = `<button class="confirm__btn">OK</button>`;
                popUpBtnsWrapper.classList.add("btn-center");
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
                
                const okBtn = popUpBtnsWrapper.querySelector(".confirm__btn");
                okBtn.addEventListener("click", () =>{
                    popUpWindow.classList.remove("activate-pop-up");
                    popUpWindow.classList.add("activate-pop-out");
                    setTimeout(() =>{
                        iconWrap.remove();
                        popUpMessage.remove();
                        popUpBtnsWrapper.remove();
                        backgroundWindow.classList.add("hidthis");
                    }, 200);
                });
            });

            const noBtn = popUpBtnsWrapper.querySelector(".caution__no-btn")
            noBtn.addEventListener("click", () =>{
                popUpWindow.classList.remove("activate-pop-up");
                popUpWindow.classList.add("activate-pop-out");
                setTimeout(() =>{
                    iconWrap.remove();
                    popUpMessage.remove();
                    popUpBtnsWrapper.remove();
                    backgroundWindow.classList.add("hidthis");
                }, 200);
            });
        });

        return ticketDiv;
    }

    //-------------UI FUNCTION----------------------------------------------------

});