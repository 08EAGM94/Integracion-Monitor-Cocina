<h2 align="center">Pantalla de tickets y creación de pedidos</h2>
<img width="1600" height="776" alt="2026-03-24 11_55_30-Window" src="https://github.com/user-attachments/assets/f7b88770-6b73-4399-8cc7-96a4182fd0fc" />
<br/>
<i>El contenido de los contenedores de la aplicación web y base de datos en docker de este proyecto contiene datos de prueba y no representa información sensible de la empresa Interpc y de sus clientes. </i>
<br/>
<br/>
<p>
  La demo de la pantalla de Tickets para un cliente de Interpc fue un aporte a la empresa dentro de mis prácticas profesionales, se ideó una pantalla principal donde el personal puede crear pedidos anotando el número de comanda y el nombre del cliente en cuestión, en esa misma pantalla se puede cambiar los estatus de los pedidos y el cambio se puede ver en tiempo real, tanto en la interfaz de creación de pedidos como en la pantalla de tickets gracias al módulo Socket.io de Node.js. 
</p>
<img width="1600" height="776" alt="2026-03-24 11_57_48-Window" src="https://github.com/user-attachments/assets/3932a659-7b15-4d3a-b67d-54744101e388" />
<br/>
<p>
  También se hizo una simulación del monitor de cocina parecido al que tiene el sistema Softappetit, se vio de qué forma poder integrarlo al mismo canal que la pantalla de tickets y de creación de pedidos, cada registro del monitor de cocina tienen sus propios botones de estatus, el botón "Ordenada" crea un registro de pedido (el cual aparece en la pantalla de capturar pedido) a la vez que se actualiza el estatus del propio registro del monitor de cocina, todo cambio de estatus generado en el monitor de cocina se verá reflejado en la interfaz de captura de pedidos, los estatus "Proceso" y "Terminado" se reflejan también en la pantalla de tickets y estatus "entregado" el registro desaparece de la pantalla de tickets y solo será visible en la interfaz de captura de órdenes.
</p>
<img width="1600" height="775" alt="2026-03-24 11_58_25-Window" src="https://github.com/user-attachments/assets/482e10e4-21d5-4d4a-9170-b5f8589bc0e3" />
<br/>
<p>
  También se integró una pantalla similar a la pantalla de tickets, pero este está pensado para que otros miembros del personal puedan interactuar con él, en la sección de "Terminado", los tickets tienen un botón en la parte superior derecha, ese botón permite cambiar el estatus del registro del pedido en cuestión a "entregado" haciéndolo desaparecer de las pantallas de los tickets o también en el monitor de cocina si es que se capturó un pedido desde ahí. 
</p>
<img width="1600" height="775" alt="2026-03-24 11_58_44-Window" src="https://github.com/user-attachments/assets/9224d345-5507-4e81-bc60-4a4d67812253" />
<h2 align="center">Aspectos técnicos</h2>
<p>
En esta aplicación, en el archivo app, se inicializa una instancia de Express con un middleware apuntando a la ruta de la carpeta "public" donde se encuentra recursos del lado del cliente y el archivo html index, luego, esta instancia se usa en el archivo index.js en node para crear un servidor utilizando la instancia http, finalmente este servidor es usado para inicializar un objeto de la clase Server de socket.io, este objeto luego es usado por una función importada del archivo socket.js en index. Al levantar este servidor, todo recurso JS del lado del cliente tiene acceso a /socket.io/socket.io.js para entablar una conexión con el servidor; en el archivo socket.js el servido socket.io esta a la escucha de cualquier evento emitido por el cliente y responderle, estos eventos involucran peticiones a la base de datos con el ORM Sequelize, el cliente puede mandar valores de formularios para que el servidor pueda insertarlos en la base de datos con sequelize y responder con una petición de consulta, los resultados de la petición los recepciona el cliente y le da forma a las vistas para que el usuario pueda visualizar los cambios. Al ser valores de formularios, se utiliza un helper dentro de node para escapar caracteres especiales html, este helper por supuesto, es utilizado dentro de consultas de inserción en socket.js cuando el servidor recepciona eventos de envío de datos de formulario del cliente. En cuanto a Sequelize, no se usan consultas sql "crudas" sino métodos CRUD propios de este ORM, esto es especialmente útil para evitar inyecciones sql.
</p>
