import Sidebar from '@/components/proveedor/Sidebar';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="main-con-sidebar">
        {children}
      </main>
    </div>
  );
}
