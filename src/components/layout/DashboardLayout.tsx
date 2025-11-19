'use client';

import React from 'react';
import { Layout } from 'tdesign-react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

const { Content, Aside } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout className="h-screen w-screen overflow-hidden">
            <DashboardHeader />
            <Layout>
                <Aside>
                    <DashboardSidebar />
                </Aside>
                <Content className="p-6 overflow-auto bg-gray-50">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
