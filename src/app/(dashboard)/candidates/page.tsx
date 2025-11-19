'use client';

import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Input, Avatar, MessagePlugin } from 'tdesign-react';
import { Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function TalentPoolPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCandidates();
    }, [search]);

    const fetchCandidates = async () => {
        setLoading(true);
        let query = supabase
            .from('candidates')
            .select('*, projects(project_name)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            MessagePlugin.error('Failed to load candidates');
        } else {
            setCandidates(data || []);
        }
        setLoading(false);
    };

    const columns = [
        {
            colKey: 'name',
            title: 'Candidate',
            width: 200,
            cell: ({ row }: { row: any }) => (
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push(`/candidates/${row.id}`)}>
                    <Avatar icon={<User />} />
                    <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-gray-500">{row.current_position} @ {row.current_company}</div>
                    </div>
                </div>
            ),
        },
        { colKey: 'years_of_experience', title: 'Exp', width: 100, cell: ({ row }: { row: any }) => `${row.years_of_experience} yrs` },
        { colKey: 'education', title: 'Education', width: 150 },
        {
            colKey: 'projects.project_name',
            title: 'Project',
            width: 200,
            cell: ({ row }: { row: any }) => row.projects?.project_name || '-'
        },
        {
            colKey: 'status',
            title: 'Status',
            width: 120,
            cell: ({ row }: { row: any }) => (
                <Tag variant="light" theme="primary">
                    {row.status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Talent Pool</h2>

            <Card bordered>
                <div className="mb-4">
                    <Input
                        placeholder="Search candidate name..."
                        prefixIcon={<Search />}
                        onChange={(val) => setSearch(String(val))}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    data={candidates}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ defaultPageSize: 10 }}
                />
            </Card>
        </div>
    );
}
