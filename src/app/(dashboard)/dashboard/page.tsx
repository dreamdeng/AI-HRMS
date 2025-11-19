'use client';

import React from 'react';
import { Row, Col, Card, Statistic, Table, Button, Tag } from 'tdesign-react';
import { Plus, Upload, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    // Mock Data
    const stats = [
        { title: 'Active Projects', value: 12, trend: '+2', trendIcon: 'increase' },
        { title: 'New Candidates', value: 45, trend: '+15', trendIcon: 'increase' },
        { title: 'Pending Matches', value: 8, trend: '-3', trendIcon: 'decrease' },
        { title: 'Monthly Referrals', value: 23, trend: '+5', trendIcon: 'increase' },
    ];

    const recentProjects = [
        {
            id: 1,
            name: 'Senior Java Engineer',
            company: 'Tencent',
            candidates: 45,
            match: 92,
            updated: '2 hours ago',
        },
        {
            id: 2,
            name: 'Product Manager',
            company: 'Alibaba',
            candidates: 32,
            match: 88,
            updated: '5 hours ago',
        },
        {
            id: 3,
            name: 'Frontend Developer',
            company: 'ByteDance',
            candidates: 28,
            match: 85,
            updated: '1 day ago',
        },
        {
            id: 4,
            name: 'Data Scientist',
            company: 'Meituan',
            candidates: 15,
            match: 78,
            updated: '2 days ago',
        },
    ];

    const columns = [
        { colKey: 'name', title: 'Project Name', width: 200 },
        { colKey: 'company', title: 'Company', width: 150 },
        { colKey: 'candidates', title: 'Candidates', width: 100 },
        {
            colKey: 'match',
            title: 'Top Match',
            width: 100,
            cell: ({ row }: { row: any }) => (
                <Tag theme={row.match >= 90 ? 'success' : row.match >= 80 ? 'warning' : 'default'}>
                    {row.match}%
                </Tag>
            ),
        },
        { colKey: 'updated', title: 'Last Updated', width: 150 },
        {
            colKey: 'action',
            title: 'Action',
            width: 150,
            cell: ({ row }: { row: any }) => (
                <Button variant="text" theme="primary" onClick={() => router.push(`/projects/${row.id}`)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="space-x-3">
                    <Button icon={<Plus />} onClick={() => router.push('/projects/new')}>
                        New Project
                    </Button>
                    <Button variant="outline" icon={<Upload />}>
                        Import JD
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col key={index} xs={12} sm={6} md={3}>
                        <Card bordered hoverShadow>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                extra={
                                    <span className={stat.trendIcon === 'increase' ? 'text-green-500' : 'text-red-500'}>
                                        {stat.trend} this week
                                    </span>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
            {/* Recent Projects */}
            <Card title="Recent Projects" bordered headerBordered>
                <Table
                    data={recentProjects}
                    columns={columns}
                    rowKey="id"
                    pagination={{ defaultPageSize: 5, total: recentProjects.length }}
                />
            </Card>
        </div>
    );
}
