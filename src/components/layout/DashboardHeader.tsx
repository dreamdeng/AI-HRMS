'use client';

import React from 'react';
import { Layout, Button, Avatar, Dropdown, Menu } from 'tdesign-react';
import { UserCircle, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const { Header } = Layout;
const { HeadMenu } = Menu;

export default function DashboardHeader() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const dropdownOptions = [
        {
            content: 'Profile',
            value: 'profile',
            prefixIcon: <UserCircle />,
            onClick: () => router.push('/settings/profile'),
        },
        {
            content: 'Settings',
            value: 'settings',
            prefixIcon: <Settings />,
            onClick: () => router.push('/settings'),
        },
        {
            content: 'Logout',
            value: 'logout',
            prefixIcon: <LogOut />,
            onClick: handleLogout,
        },
    ];

    return (
        <Header>
            <HeadMenu
                theme="light"
                logo={<span className="text-xl font-bold ml-4">AI-HRMS</span>}
                operations={
                    <div className="flex items-center space-x-4 mr-4">
                        <Dropdown options={dropdownOptions} trigger="click">
                            <Button variant="text" shape="square">
                                <Avatar icon={<UserCircle />} />
                            </Button>
                        </Dropdown>
                    </div>
                }
            />
        </Header>
    );
}
