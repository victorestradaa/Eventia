-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('PROVEEDOR', 'CLIENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlanProveedor" AS ENUM ('GRATIS', 'INTERMEDIO', 'PREMIUM', 'ELITE');

-- CreateEnum
CREATE TYPE "PlanCliente" AS ENUM ('FREE', 'ORO', 'PLANNER');

-- CreateEnum
CREATE TYPE "CategoriaServicio" AS ENUM ('SALON', 'MUSICA', 'COMIDA', 'ANIMACION', 'FOTOGRAFIA', 'DECORACION', 'RECUERDOS', 'MOBILIARIO', 'PAQUETES_COMPLETOS');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('BODA', 'XV_ANOS', 'BAUTIZO', 'FIESTA_INFANTIL', 'FIESTA_GENERAL', 'TODOS');

-- CreateEnum
CREATE TYPE "TipoReserva" AS ENUM ('DIA_COMPLETO', 'POR_HORAS');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('TEMPORAL', 'APARTADO', 'LIQUIDADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoRSVP" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "Rol" NOT NULL,
    "stripeClienteId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" "CategoriaServicio" NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "direccion" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "plan" "PlanProveedor" NOT NULL DEFAULT 'GRATIS',
    "stripeSubId" TEXT,
    "puntuacionExp" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "permiteReservasPorHora" BOOLEAN NOT NULL DEFAULT false,
    "horarioApertura" TEXT NOT NULL DEFAULT '09:00',
    "horarioCierre" TEXT NOT NULL DEFAULT '23:00',
    "horasExpiracionTemporal" INTEGER NOT NULL DEFAULT 24,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "capacidadMin" INTEGER,
    "capacidadMax" INTEGER,
    "diasDisponibles" INTEGER[],
    "etiquetasEvento" "TipoEvento"[],
    "imagenes" TEXT[],
    "videos" TEXT[],
    "capacidadSimultanea" INTEGER NOT NULL DEFAULT 1,
    "bloquesHorario" TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariacionPrecio" (
    "id" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "precioOverride" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "VariacionPrecio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complemento" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complemento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "plan" "PlanCliente" NOT NULL DEFAULT 'FREE',
    "stripeSubId" TEXT,
    "trialExpira" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3),
    "presupuestoTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "numInvitados" INTEGER,
    "descripcion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitado" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "mesaAsignada" INTEGER,
    "rsvpToken" TEXT NOT NULL,
    "rsvpEstado" "EstadoRSVP" NOT NULL DEFAULT 'PENDIENTE',
    "lado" TEXT,
    "categoria" TEXT,
    "tipoPersona" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineaPresupuesto" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "servicioId" TEXT,
    "descripcion" TEXT NOT NULL,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "montoPagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LineaPresupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "lineaId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "nota" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "proveedorId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "eventoId" TEXT,
    "fechaEvento" TIMESTAMP(3) NOT NULL,
    "tipoReserva" "TipoReserva" NOT NULL DEFAULT 'DIA_COMPLETO',
    "horaInicio" TEXT,
    "horaFin" TEXT,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'TEMPORAL',
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "montoAnticipo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "montoComision" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notas" TEXT,
    "stripePaymentId" TEXT,
    "esManual" BOOLEAN NOT NULL DEFAULT false,
    "nombreClienteExterno" TEXT,
    "telefonoClienteExterno" TEXT,
    "fechaExpiracion" TIMESTAMP(3),
    "turnoConfirmadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaccion" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "comision" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tipo" TEXT NOT NULL DEFAULT 'ABONO',
    "metodoPago" TEXT NOT NULL DEFAULT 'STRIPE',
    "estado" TEXT NOT NULL DEFAULT 'PAGADO',
    "fechaVencimiento" TIMESTAMP(3),
    "fechaPago" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "stripePaymentId" TEXT,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resena" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisposicionMesa" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisposicionMesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitacionDigital" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "plantilla" TEXT NOT NULL DEFAULT 'clasica',
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT,
    "lugarTexto" TEXT,
    "vestimenta" TEXT,
    "enviadaEn" TIMESTAMP(3),
    "rsvpFecha" TIMESTAMP(3),
    "isInvitacionPropia" BOOLEAN NOT NULL DEFAULT false,
    "archivoAdjunto" TEXT,
    "fondoUrl" TEXT,
    "colorTexto" TEXT DEFAULT '#ffffff',
    "fuente" TEXT,
    "direccion" TEXT,
    "regaloTipo" TEXT,
    "regaloMesaUrl" TEXT,
    "regaloBanco" TEXT,
    "regaloClabe" TEXT,
    "tipoInvitacion" TEXT NOT NULL DEFAULT 'BASICA',
    "configWeb" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitacionDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoAsset" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "etiquetas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ComplementoToServicio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_stripeClienteId_key" ON "Usuario"("stripeClienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_usuarioId_key" ON "Proveedor"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_stripeSubId_key" ON "Proveedor"("stripeSubId");

-- CreateIndex
CREATE UNIQUE INDEX "VariacionPrecio_servicioId_mes_key" ON "VariacionPrecio"("servicioId", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_key" ON "Cliente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_stripeSubId_key" ON "Cliente"("stripeSubId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitado_rsvpToken_key" ON "Invitado"("rsvpToken");

-- CreateIndex
CREATE UNIQUE INDEX "DisposicionMesa_eventoId_key" ON "DisposicionMesa"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitacionDigital_eventoId_key" ON "InvitacionDigital"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "_ComplementoToServicio_AB_unique" ON "_ComplementoToServicio"("A", "B");

-- CreateIndex
CREATE INDEX "_ComplementoToServicio_B_index" ON "_ComplementoToServicio"("B");

-- AddForeignKey
ALTER TABLE "Proveedor" ADD CONSTRAINT "Proveedor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariacionPrecio" ADD CONSTRAINT "VariacionPrecio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complemento" ADD CONSTRAINT "Complemento_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitado" ADD CONSTRAINT "Invitado_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaPresupuesto" ADD CONSTRAINT "LineaPresupuesto_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaPresupuesto" ADD CONSTRAINT "LineaPresupuesto_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_lineaId_fkey" FOREIGN KEY ("lineaId") REFERENCES "LineaPresupuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaccion" ADD CONSTRAINT "Transaccion_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisposicionMesa" ADD CONSTRAINT "DisposicionMesa_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitacionDigital" ADD CONSTRAINT "InvitacionDigital_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplementoToServicio" ADD CONSTRAINT "_ComplementoToServicio_A_fkey" FOREIGN KEY ("A") REFERENCES "Complemento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplementoToServicio" ADD CONSTRAINT "_ComplementoToServicio_B_fkey" FOREIGN KEY ("B") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
