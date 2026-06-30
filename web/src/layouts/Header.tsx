import { useLocation, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { useAuthStore } from '../store';
import { UserRole } from '../../../shared/types';
import React from 'react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  // Determine root dashboard path based on role
  const dashboardPath =
    user?.role === UserRole.ADMIN
      ? '/admin'
      : user?.role === UserRole.MANAGER
        ? '/manager'
        : '/staff';

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <header className="h-16 flex items-center px-4 lg:px-8 shrink-0 bg-surface/50 backdrop-blur-sm sticky top-0 z-30">
      <button
        className="lg:hidden p-2 mr-4 bg-white rounded-lg shadow-sm border border-gray-100 text-brand"
        onClick={onMobileMenuToggle}
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      <Breadcrumb>
        <BreadcrumbList>
          {pathnames.length === 0 ? (
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <React.Fragment>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={dashboardPath}>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathnames.map((value, index) => {
                const isLast = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                // Capitalize and format value
                let title = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
                // If the path segment is a MongoDB ObjectId, show "Chi tiết" instead
                if (/^[a-fA-F0-9]{24}$/.test(value)) {
                  title = 'Chi tiết';
                }

                return (
                  <React.Fragment key={to}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={to}>{title}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
