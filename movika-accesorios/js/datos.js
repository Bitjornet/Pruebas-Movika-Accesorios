// Capa de datos: modelos Cliente, Producto, Pedido y Detalle
// datos.js — Capa de datos (Tarea 1)
// Modelos: Cliente, Producto, Pedido, PartidaPedido (Detalle)
// Esta capa SOLO guarda y lee. No valida, no calcula totales y no cambia
// estados: eso vive en logica.js.

// ---------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------

const CLAVES = {
  clientes: "movika_clientes",
  productos: "movika_productos",
  pedidos: "movika_pedidos",
  partidas: "movika_partidas"
};

// "Atrasado" NO es un estado: se calcula en logica.js (esAtrasado).
const ESTADOS_PEDIDO = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado"
};

// ---------------------------------------------------------------
// Funciones genéricas (las usan los cuatro modelos)
// ---------------------------------------------------------------

function leerColeccion(clave) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : [];
  } catch (error) {
    console.error("Error al leer " + clave + ":", error);
    return [];
  }
}

function guardarColeccion(clave, lista) {
  try {
    localStorage.setItem(clave, JSON.stringify(lista));
    return true;
  } catch (error) {
    console.error("Error al guardar " + clave + ":", error);
    return false;
  }
}

function siguienteId(lista, campoId) {
  return lista.reduce((max, registro) => Math.max(max, registro[campoId]), 0) + 1;
}

function crearRegistro(clave, campoId, datos) {
  const lista = leerColeccion(clave);
  const registro = { ...datos, [campoId]: siguienteId(lista, campoId) };
  lista.push(registro);
  guardarColeccion(clave, lista);
  return registro;
}

function obtenerPorId(clave, campoId, id) {
  return leerColeccion(clave).find(r => r[campoId] === Number(id)) || null;
}

function actualizarRegistro(clave, campoId, id, cambios) {
  const lista = leerColeccion(clave);
  const indice = lista.findIndex(r => r[campoId] === Number(id));
  if (indice === -1) return null;
  // El id nunca se modifica
  lista[indice] = { ...lista[indice], ...cambios, [campoId]: lista[indice][campoId] };
  guardarColeccion(clave, lista);
  return lista[indice];
}

// ---------------------------------------------------------------
// Cliente
// idCliente, nombre, contactoWhatsapp, metalPreferido, talla,
// fechaImportante, notasPreferencias
// Relación: Cliente 1 a N Pedido
// ---------------------------------------------------------------

function guardarCliente(d) {
  return crearRegistro(CLAVES.clientes, "idCliente", {
    nombre: d.nombre,
    contactoWhatsapp: d.contactoWhatsapp,
    metalPreferido: d.metalPreferido ?? "",
    talla: d.talla ?? "",
    fechaImportante: d.fechaImportante ?? "",
    notasPreferencias: d.notasPreferencias ?? ""
  });
}

function obtenerClientes() {
  return leerColeccion(CLAVES.clientes);
}

function obtenerClientePorId(idCliente) {
  return obtenerPorId(CLAVES.clientes, "idCliente", idCliente);
}

function actualizarCliente(idCliente, cambios) {
  return actualizarRegistro(CLAVES.clientes, "idCliente", idCliente, cambios);
}

// ---------------------------------------------------------------
// Producto
// idProducto, nombrePieza, tipoAccesorio, precio, descripcion,
// materialPersonalizable
// Relación: Producto 1 a N PartidaPedido
// ---------------------------------------------------------------

function guardarProducto(d) {
  return crearRegistro(CLAVES.productos, "idProducto", {
    nombrePieza: d.nombrePieza,
    tipoAccesorio: d.tipoAccesorio,
    precio: d.precio,
    descripcion: d.descripcion ?? "",
    materialPersonalizable: d.materialPersonalizable ?? ""
  });
}

function obtenerProductos() {
  return leerColeccion(CLAVES.productos);
}

function obtenerProductoPorId(idProducto) {
  return obtenerPorId(CLAVES.productos, "idProducto", idProducto);
}

function actualizarProducto(idProducto, cambios) {
  return actualizarRegistro(CLAVES.productos, "idProducto", idProducto, cambios);
}

// ---------------------------------------------------------------
// Pedido
// idPedido, idCliente, fechaCreacion, fechaCompromiso, estado,
// puntoEntrega, motivoCancelacion (opcional), total
// Relación: Pedido N a 1 Cliente, Pedido 1 a N PartidaPedido
// El total llega YA calculado desde logica.js y se guarda congelado.
// ---------------------------------------------------------------

function guardarPedido(d) {
  return crearRegistro(CLAVES.pedidos, "idPedido", {
    idCliente: Number(d.idCliente),
    fechaCreacion: d.fechaCreacion ?? new Date().toISOString(),
    fechaCompromiso: d.fechaCompromiso,
    estado: d.estado ?? ESTADOS_PEDIDO.PENDIENTE,
    puntoEntrega: d.puntoEntrega ?? "",
    motivoCancelacion: d.motivoCancelacion ?? null,
    total: d.total ?? 0
  });
}

function obtenerPedidos() {
  return leerColeccion(CLAVES.pedidos);
}

function obtenerPedidoPorId(idPedido) {
  return obtenerPorId(CLAVES.pedidos, "idPedido", idPedido);
}

function obtenerPedidosPorCliente(idCliente) {
  return obtenerPedidos().filter(p => p.idCliente === Number(idCliente));
}

function actualizarPedido(idPedido, cambios) {
  return actualizarRegistro(CLAVES.pedidos, "idPedido", idPedido, cambios);
}

// ---------------------------------------------------------------
// PartidaPedido (Detalle)
// idPartida, idPedido, idProducto, cantidad, precioUnitario,
// subtotal, personalizacion (opcional)
// Relación: PartidaPedido N a 1 Pedido, N a 1 Producto
// precioUnitario y subtotal se guardan congelados.
// ---------------------------------------------------------------

function guardarPartida(d) {
  return crearRegistro(CLAVES.partidas, "idPartida", {
    idPedido: Number(d.idPedido),
    idProducto: Number(d.idProducto),
    cantidad: d.cantidad,
    precioUnitario: d.precioUnitario,
    subtotal: d.subtotal,
    personalizacion: d.personalizacion ?? null
  });
}

function obtenerPartidas() {
  return leerColeccion(CLAVES.partidas);
}

function obtenerPartidaPorId(idPartida) {
  return obtenerPorId(CLAVES.partidas, "idPartida", idPartida);
}

function obtenerPartidasPorPedido(idPedido) {
  return obtenerPartidas().filter(p => p.idPedido === Number(idPedido));
}

function actualizarPartida(idPartida, cambios) {
  return actualizarRegistro(CLAVES.partidas, "idPartida", idPartida, cambios);
}

// ---------------------------------------------------------------
// Inicialización ("migración")
// Crea las cuatro colecciones vacías si no existen. Se puede correr
// varias veces sin borrar datos.
// ---------------------------------------------------------------

function inicializarDatos() {
  Object.values(CLAVES).forEach(clave => {
    if (localStorage.getItem(clave) === null) {
      guardarColeccion(clave, []);
    }
  });
}

inicializarDatos();