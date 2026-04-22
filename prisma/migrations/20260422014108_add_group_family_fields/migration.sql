-- AlterTable
ALTER TABLE "Invitado" ADD COLUMN     "esGrupoTitular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "grupoTitularId" TEXT;

-- CreateTable
CREATE TABLE "AlbumDigital" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT,
    "slug" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbumDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlbumMedia" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombreArchivo" TEXT,
    "tamanio" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlbumMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlbumDigital_eventoId_key" ON "AlbumDigital"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumDigital_slug_key" ON "AlbumDigital"("slug");

-- AddForeignKey
ALTER TABLE "Invitado" ADD CONSTRAINT "Invitado_grupoTitularId_fkey" FOREIGN KEY ("grupoTitularId") REFERENCES "Invitado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumDigital" ADD CONSTRAINT "AlbumDigital_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumMedia" ADD CONSTRAINT "AlbumMedia_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "AlbumDigital"("id") ON DELETE CASCADE ON UPDATE CASCADE;
