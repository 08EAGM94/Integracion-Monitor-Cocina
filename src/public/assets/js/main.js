
//con esta constante le podemos decir al servidor que efectue una acción, podemos emitir eventos
const socket = io();
const comandaScreen = document.querySelector("#screen1");
const finishScreen = document.querySelector("#screen2");
const softIcon = document.querySelector(".softappetit-container");


socket.on("server-loadOrders", orders =>{
    comandaScreen.innerHTML = "";
    finishScreen.innerHTML = "";
    orders.forEach(order => {

        if(order.estatus == "Proceso"){
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
        }else if(order.estatus == "Terminado"){
            finishScreen.innerHTML += `
            <div class="finish-screen__finish-id">
                <div class="comanda-screen_dot-1"></div>
                <div class="comanda-screen_dot-2"></div>
                <div class="finish-screen__client-container">
                    <div class="finish-screen__client-header">${order.nombre_cliente}</div>
                    <div class="finish-screen__client">ID: ${order.numero_comanda}</div>
                </div>
            </div>
            `;
        }
        
    });  
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

