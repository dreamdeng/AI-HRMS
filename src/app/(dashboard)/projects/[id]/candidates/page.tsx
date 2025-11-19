'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Card, Input, Select, Avatar, MessagePlugin } from 'tdesign-react';
import { Search, Filter, Download, User, Eye } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const { Option } = Select;

export default function CandidateListPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [filter, setFilter] = useState({ status: 'all', search: '' });

    useEffect(() => {
        fetchCandidates();
    }, [params.id, filter]);

    const fetchCandidates = async () => {
        setLoading(true);
        let query = supabase
            .from('candidates')
            .select('*')
            .eq('project_id', params.id)
            .order('match_score', { ascending: false });

        if (filter.status !== 'all') {
            query = query.eq('status', filter.status);
        }

        if (filter.search) {
            query = query.ilike('name', `%${filter.search}%`);
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
                <div className="flex items-center space-x-3">
                    <Avatar icon={<User />} />
                    <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-gray-500">{row.current_position} @ {row.current_company}</div>
                    </div>
                </div>
            ),
        },
        {
            colKey: 'match_score',
            title: 'Match',
            width: 100,
            sorter: true,
            cell: ({ row }: { row: any }) => (
                <Tag theme={row.match_score >= 90 ? 'success' : row.match_score >= 80 ? 'warning' : 'default'}>
                    {row.match_score}%
                </Tag>
            ),
        },
        { colKey: 'years_of_experience', title: 'Exp', width: 100, cell: ({ row }: { row: any }) => `${row.years_of_experience} yrs` },
        { colKey: 'education', title: 'Education', width: 150 },
        { colKey: 'source_platform', title: 'Source', width: 100 },
        {
            colKey: 'status',
            title: 'Status',
            width: 120,
            cell: ({ row }: { row: any }) => (
                <Tag variant="light" theme={row.status === 'new' ? 'primary' : 'default'}>
                    {row.status.toUpperCase()}
                </Tag>
            ),
        },
        {
            colKey: 'action',
            title: 'Action',
            width: 100,
            cell: ({ row }: { row: any }) => (
                <Button variant="text" theme="primary" icon={<Eye />} onClick={() => router.push(`/candidates/${row.id}`)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Candidates</h2>
                <div className="space-x-3">
                    <Button variant="outline" icon={<Download />}>Export</Button>
                </div>
            </div>

            <Card bordered>
                <div className="mb-4 flex space-x-4">
                    <Input
                        placeholder="Search name..."
                        prefixIcon={<Search />}
                        onChange={(val) => setFilter({ ...filter, search: String(val) })}
                        style={{ width: 300 }}
                    />
                    <Select
                        value={filter.status}
                        onChange={(val) => setFilter({ ...filter, status: String(val) })}
                        style={{ width: 200 }}
                        prefixIcon={<Filter />}
                    >
                        <Option value="all" label="All Status" />
                        <Option value="new" label="New" />
                        <Option value="contacted" label="Contacted" />
                        <Option value="interview" label="Interview" />
                        <Option value="rejected" label="Rejected" />
                    </Select>
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
