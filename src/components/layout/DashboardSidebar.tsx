'use client';

import React from 'react';
import { Menu } from 'tdesign-react';
import { LayoutDashboard, Briefcase, Users, FileBarChart, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const { MenuItem } = Menu;

export default function DashboardSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Menu
            theme="light"
            value={pathname}
            style={{ marginRight: 20, height: '100%' }}
            onChange={(value) => router.push(value as string)}
        >
            <MenuItem value="/dashboard" icon={<LayoutDashboard />}>
                Dashboard
            </MenuItem>
            <MenuItem value="/projects" icon={<Briefcase />}>
                Projects
            </MenuItem>
            <MenuItem value="/candidates" icon={<Users />}>
                Talent Pool
            </MenuItem>
            <MenuItem value="/reports" icon={<FileBarChart />}>
                Reports
            </MenuItem>
            <MenuItem value="/settings" icon={<Settings />}>
                Settings
            </MenuItem>
        </Menu>
    );
}
