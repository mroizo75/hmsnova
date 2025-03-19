import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Settings, Users, BarChart, Layers, Database } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Brukere', href: '/admin/users', icon: Users },
    { name: 'Statistikk', href: '/admin/stats', icon: BarChart },
    { name: 'Integrasjoner', href: '/admin/integrations', icon: Database, 
      submenu: [
        { name: 'Dalux', href: '/admin/integrations/dalux', active: pathname === '/admin/integrations/dalux' },
      ]
    },
    { name: 'Innstillinger', href: '/admin/settings', icon: Settings },
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-semibold">Admin Panel</span>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <div key={item.name}>
                    <Link href={item.href}>
                      <Button 
                        variant={isActive ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Button>
                    </Link>
                    
                    {item.submenu && (
                      <div className="pl-10 mt-1 space-y-1">
                        {item.submenu.map((subitem) => (
                          <Link key={subitem.name} href={subitem.href}>
                            <Button 
                              variant={subitem.active ? "default" : "ghost"} 
                              size="sm"
                              className="w-full justify-start"
                            >
                              {subitem.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
} 