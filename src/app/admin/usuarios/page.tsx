import React from 'react';

export default function UsuariosPage() {
  const users = [
    { id: '1', nombre: 'Juan Pérez', email: 'juan@demo.com', rol: 'CLIENTE', estado: 'ACTIVO', registro: '12/03/2026' },
    { id: '2', nombre: 'Eventos del Norte', email: 'contacto@eventos.com', rol: 'PROVEEDOR', estado: 'ACTIVO', registro: '10/03/2026' },
    { id: '3', nombre: 'María García', email: 'maria@test.com', rol: 'CLIENTE', estado: 'INACTIVO', registro: '08/03/2026' },
    { id: '4', nombre: 'Catering Premium', email: 'ventas@premium.com', rol: 'PROVEEDOR', estado: 'ACTIVO', registro: '05/03/2026' },
    { id: '5', nombre: 'Admin Master', email: 'admin@gestor.com', rol: 'ADMIN', estado: 'ACTIVO', registro: '01/01/2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Buscar usuario..." className="input !w-64" />
          <select className="input !w-40">
            <option>Todos los roles</option>
            <option>Clientes</option>
            <option>Proveedores</option>
            <option>Admins</option>
          </select>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="font-semibold">{user.nombre}</td>
                <td className="text-[var(--color-texto-suave)]">{user.email}</td>
                <td>
                  <span className={`badge ${
                    user.rol === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                    user.rol === 'PROVEEDOR' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-pink-500/10 text-pink-400'
                  }`}>
                    {user.rol}
                  </span>
                </td>
                <td>
                  <span className={`flex items-center gap-1.5 ${user.estado === 'ACTIVO' ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${user.estado === 'ACTIVO' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {user.estado}
                  </span>
                </td>
                <td className="text-[var(--color-texto-muted)]">{user.registro}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-fantasma">Editar</button>
                    <button className={`btn btn-sm ${user.estado === 'ACTIVO' ? 'text-red-400 hover:bg-red-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}>
                      {user.estado === 'ACTIVO' ? 'Suspender' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
