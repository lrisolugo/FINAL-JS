// Array para almacenar los elementos del carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para guardar el carrito en el localStorage
function guardarCarritoEnLocalStorage() {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

// Función para agregar un producto al carrito
function agregarAlCarrito(producto, precio) {
    // Buscar si el producto ya está en el carrito
    const index = carrito.findIndex(item => item.producto === producto);

    if (index !== -1) {
        // Si el producto ya está en el carrito, incrementar la cantidad
        carrito[index].cantidad += 1;
    } else {
        // Si el producto no está en el carrito, agregarlo con cantidad 1
        carrito.push({ producto, precio, cantidad: 1 });
    }

    // Guardar el carrito en el localStorage después de cada modificación
    guardarCarritoEnLocalStorage();

    // Actualizar la visualización del carrito
    actualizarCarrito();

    // Crear el modal después de actualizar el carrito
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    modal.id = 'successModal';
    document.body.appendChild(modal);

    // Contenido del modal
    modal.innerHTML = `
       <div class="modal-dialog modal-dialog-centered">
           <div class="modal-content">
               <div class="modal-header">
                   <h5 class="modal-title">Éxito</h5>
                   <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                       <span aria-hidden="true">&times;</span>
                   </button>
               </div>
               <div class="modal-body">
                   ¡Producto agregado al carrito con éxito!
               </div>
               <div class="modal-footer">
                   <button type="button" class="btn btn-success" data-dismiss="modal">Aceptar</button>
               </div>
           </div>
       </div>
    `;

    // Mostrar el modal utilizando Bootstrap
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
}

// Función para eliminar un producto del carrito
function eliminarProducto(index) {
    // Eliminar el producto del carrito
    carrito.splice(index, 1);

    // Actualizar la interfaz de usuario
    actualizarCarrito();

    // Guardar el carrito en el localStorage después de cada modificación
    guardarCarritoEnLocalStorage();
}

// Función para actualizar la cantidad de un producto en el carrito
function actualizarCantidad(index, nuevaCantidad) {
    // Actualizar la cantidad del producto en el carrito
    carrito[index].cantidad = nuevaCantidad;

    // Actualizar la interfaz de usuario
    actualizarCarrito();

    // Guardar el carrito en el localStorage después de cada modificación
    guardarCarritoEnLocalStorage();
}

// Función para actualizar la visualización del carrito
function actualizarCarrito() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    // Limpiar el contenido actual del carrito
    cartItemsElement.innerHTML = '';

    // Calcular el total
    let total = 0;

    // Iterar sobre los elementos del carrito
    carrito.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.producto} x ${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;

        // Botón para eliminar producto
        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.addEventListener('click', () => eliminarProducto(index));
        listItem.appendChild(eliminarBtn);

        // Input para actualizar cantidad
        const cantidadInput = document.createElement('input');
        cantidadInput.type = 'number';
        cantidadInput.value = item.cantidad;
        cantidadInput.addEventListener('change', (event) => actualizarCantidad(index, parseInt(event.target.value)));
        listItem.appendChild(cantidadInput);

        cartItemsElement.appendChild(listItem);

        // Sumar al total
        total += item.precio * item.cantidad;
    });

    // Actualizar el total en el carrito
    cartTotalElement.textContent = total.toFixed(2);
}

// Resto del código...

function finalizarCompra() {
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        // Mostrar mensaje de SweetAlert si el carrito está vacío
        Swal.fire({
            icon: 'warning',
            title: 'Carrito Vacío',
            text: 'Agrega productos al carrito antes de finalizar la compra.',
            customClass: {
                confirmButton: 'btn btn-success'
            },
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Crear el modal de confirmación de compra
    const purchaseConfirmationModal = document.createElement('div');
    purchaseConfirmationModal.classList.add('modal', 'fade');
    purchaseConfirmationModal.id = 'purchaseConfirmationModal';
    document.body.appendChild(purchaseConfirmationModal);

    // Contenido del modal de confirmación de compra
    purchaseConfirmationModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Compra finalizada</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h6>Detalles del pedido:</h6>
                    <ul id="detallePedido"></ul>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" data-dismiss="modal" onclick="mostrarMensajeAgradecimiento()">Aceptar</button>
                </div>
            </div>
        </div>
    `;

    // Obtener el elemento ul para agregar los detalles del pedido
    const ulDetallePedido = purchaseConfirmationModal.querySelector('#detallePedido');

    // Calcular detalles del pedido y agregarlos al cuerpo del modal
    const cantidadesPorProducto = {};

    // Calcular las cantidades totales por producto
    carrito.forEach(item => {
        if (cantidadesPorProducto[item.producto]) {
            cantidadesPorProducto[item.producto] += item.cantidad;
        } else {
            cantidadesPorProducto[item.producto] = item.cantidad;
        }
    });

    let total = 0;

    for (const producto in cantidadesPorProducto) {
        const li = document.createElement('li');
        const precioUnitario = carrito.find(item => item.producto === producto).precio;
        const cantidad = cantidadesPorProducto[producto];
        const precioTotalProducto = (precioUnitario * cantidad).toFixed(2);
        li.textContent = `${producto} x ${cantidad} - $${precioTotalProducto}`;
        ulDetallePedido.appendChild(li);

        // Sumar al total
        total += parseFloat(precioTotalProducto);
    }

    // Mostrar el total en el modal
    const liTotal = document.createElement('li');
    liTotal.textContent = `Total: $${total.toFixed(2)}`;
    ulDetallePedido.appendChild(liTotal);

    // Limpiar el carrito después de la compra
    carrito = [];

    // Actualizar la interfaz de usuario después de limpiar el carrito
    // (Asegúrate de tener una función actualizarCarrito() que funcione correctamente)
    actualizarCarrito();

    // Mostrar el modal de confirmación de compra
    const purchaseConfirmationModalInstance = new bootstrap.Modal(document.getElementById('purchaseConfirmationModal'));
    purchaseConfirmationModalInstance.show();
}

// Función para mostrar el mensaje de agradecimiento con Bootstrap
function mostrarMensajeAgradecimiento() {
    // Crear el modal de agradecimiento
    const gratitudeModal = document.createElement('div');
    gratitudeModal.classList.add('modal', 'fade');
    gratitudeModal.id = 'gratitudeModal';
    document.body.appendChild(gratitudeModal);

    // Contenido del modal de agradecimiento
    gratitudeModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">¡Gracias por elegir comer con conciencia!</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Vuelve pronto.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" data-dismiss="modal">Aceptar</button>
                </div>
            </div>
        </div>
    `;

    // Mostrar el modal de agradecimiento
    const gratitudeModalInstance = new bootstrap.Modal(document.getElementById('gratitudeModal'));
    gratitudeModalInstance.show();
}
