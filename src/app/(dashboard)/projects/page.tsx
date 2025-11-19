'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Card, MessagePlugin } from 'tdesign-react';
import { Plus, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ProjectsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            MessagePlugin.error('Failed to load projects');
        } else {
            setProjects(data || []);
        }
        setLoading(false);
    };

    const columns = [
        {
            colKey: 'project_name',
            title: 'Project Name',
            width: 250,
            cell: ({ row }: { row: any }) => (
                <div className="font-medium text-blue-600 cursor-pointer" onClick={() => router.push(`/projects/${row.id}/jd-analysis`)}>
                    {row.project_name}
                </div>
            ),
        },
        { colKey: 'client_company', title: 'Client', width: 150 },
        { colKey: 'job_function', title: 'Position', width: 150 },
        {
            colKey: 'status',
            title: 'Status',
            width: 100,
            cell: ({ row }: { row: any }) => (
                <Tag theme={row.status === 'active' ? 'success' : 'default'} variant="light">
                    {row.status.toUpperCase()}
                </Tag>
            ),
        },
        {
            colKey: 'action',
            title: 'Action',
            width: 150,
            cell: ({ row }: { row: any }) => (
                <div className="space-x-2">
                    <Button variant="text" theme="primary" size="small" onClick={() => router.push(`/projects/${row.id}/jd-analysis`)}>
                        Manage
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Projects</h2>
                <Button icon={<Plus />} onClick={() => router.push('/projects/new')}>
                    New Project
                </Button>
            </div>

            <Card bordered>
                <Table
                    data={projects}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ defaultPageSize: 10 }}
                />
            </Card>
        </div>
    );
}
