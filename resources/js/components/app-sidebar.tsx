import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    FolderGit2,
    LayoutGrid,
    Stethoscope,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as specialtiesIndex } from '@/routes/specialties';
import type { NavItem } from '@/types';
import { ClinicaSwitcher } from './clinica-switcher';

export function AppSidebar() {
    const page = usePage();
    const currentClinica = page.props.currentClinica;

    const dashboardUrl = currentClinica ? dashboard(currentClinica.slug) : '/';

    const specialtiesUrl = currentClinica
        ? specialtiesIndex(currentClinica.slug)
        : '#';

    const employeesUrl = currentClinica
        ? `/${currentClinica.slug}/employees`
        : '#';

    const servicesUrl = currentClinica
        ? `/${currentClinica.slug}/services`
        : '#';

    const appointmentsUrl = currentClinica
        ? `/${currentClinica.slug}/appointments`
        : '#';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Especialidades',
            href: specialtiesUrl,
            icon: Stethoscope,
        },
        {
            title: 'Serviços',
            href: servicesUrl,
            icon: Wrench,
        },
        {
            title: 'Atendimentos',
            href: appointmentsUrl,
            icon: Calendar,
        },
        {
            title: 'Funcionários',
            href: employeesUrl,
            icon: Users,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <ClinicaSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
