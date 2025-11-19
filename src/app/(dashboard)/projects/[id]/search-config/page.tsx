'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Tag, Button, MessagePlugin, Card, Checkbox, Slider, Switch } from 'tdesign-react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const { Group: CheckboxGroup } = Checkbox;

export default function SearchConfigPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>({});
    const [jdAnalysis, setJdAnalysis] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;

            // Fetch Search Task Config
            const { data: taskData, error: taskError } = await supabase
                .from('search_tasks')
                .select('*')
                .eq('project_id', params.id)
                .single();

            if (taskError && taskError.code !== 'PGRST116') {
                MessagePlugin.error('Failed to load search config');
                return;
            }

            // Fetch JD Analysis for keywords suggestion
            const { data: jdData } = await supabase
                .from('job_descriptions')
                .select('id')
                .eq('project_id', params.id)
                .single();

            if (jdData) {
                const { data: analysis } = await supabase
                    .from('jd_analysis')
                    .select('*')
                    .eq('jd_id', jdData.id)
                    .single();
                setJdAnalysis(analysis);
            }

            if (taskData) {
                setConfig(taskData);
            } else {
                // Initialize with defaults if not exists
                setConfig({
                    platforms: ['boss', 'liepin'],
                    match_threshold: 70,
                    keywords: { primary: [], secondary: [], exclude: [] }
                });
            }
            setLoading(false);
        };

        fetchData();
    }, [params.id]);

    const handleSaveAndRun = async () => {
        setSaving(true);
        try {
            // Update or Insert Search Task
            const { error } = await supabase
                .from('search_tasks')
                .upsert({
                    project_id: params.id,
                    platforms: config.platforms,
                    keywords: config.keywords,
                    match_threshold: config.match_threshold,
                    status: 'running' // Start search immediately
                });

            if (error) throw error;

            MessagePlugin.success('Search task started');

            // Trigger Mock Search (in real app this would be a background job)
            await fetch('/api/ai/run-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: params.id }),
            });

            router.push(`/projects/${params.id}/candidates`);
        } catch (error) {
            console.error('Error starting search:', error);
            MessagePlugin.error('Failed to start search task');
        } finally {
            setSaving(false);
        }
    };

    const addKeyword = (type: 'primary' | 'secondary' | 'exclude', keyword: string) => {
        if (!keyword) return;
        const current = config.keywords?.[type] || [];
        if (!current.includes(keyword)) {
            setConfig({
                ...config,
                keywords: {
                    ...config.keywords,
                    [type]: [...current, keyword]
                }
            });
        }
    };

    const removeKeyword = (type: 'primary' | 'secondary' | 'exclude', keyword: string) => {
        const current = config.keywords?.[type] || [];
        setConfig({
            ...config,
            keywords: {
                ...config.keywords,
                [type]: current.filter((k: string) => k !== keyword)
            }
        });
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Search Configuration</h2>
                <Button theme="primary" onClick={handleSaveAndRun} loading={saving}>
                    Start Search
                </Button>
            </div>

            <Card title="Target Platforms" bordered>
                <CheckboxGroup
                    value={config.platforms}
                    onChange={(val) => setConfig({ ...config, platforms: val })}
                >
                    <Checkbox value="boss">BOSS Zhipin</Checkbox>
                    <Checkbox value="liepin">Liepin</Checkbox>
                    <Checkbox value="zhilian">Zhilian</Checkbox>
                    <Checkbox value="linkedin">LinkedIn</Checkbox>
                </CheckboxGroup>
            </Card>

            <Card title="Keywords Configuration" bordered>
                <div className="space-y-6">
                    {/* Primary Keywords */}
                    <div>
                        <h4 className="mb-2 font-bold text-sm text-gray-700">Primary Keywords (Must Have)</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {config.keywords?.primary?.map((kw: string) => (
                                <Tag key={kw} closable onClose={() => removeKeyword('primary', kw)} theme="primary" variant="light">
                                    {kw}
                                </Tag>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add keyword and press Enter"
                                onEnter={(val) => {
                                    addKeyword('primary', String(val));
                                }}
                                style={{ width: 200 }}
                            />
                            {jdAnalysis?.search_keywords?.map((kw: string) => (
                                !config.keywords?.primary?.includes(kw) && (
                                    <Tag key={kw} onClick={() => addKeyword('primary', kw)} style={{ cursor: 'pointer' }} variant="outline">
                                        + {kw}
                                    </Tag>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Secondary Keywords */}
                    <div>
                        <h4 className="mb-2 font-bold text-sm text-gray-700">Secondary Keywords (Nice to Have)</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {config.keywords?.secondary?.map((kw: string) => (
                                <Tag key={kw} closable onClose={() => removeKeyword('secondary', kw)} theme="warning" variant="light">
                                    {kw}
                                </Tag>
                            ))}
                        </div>
                        <Input
                            placeholder="Add keyword and press Enter"
                            onEnter={(val) => addKeyword('secondary', String(val))}
                            style={{ width: 200 }}
                        />
                    </div>

                    {/* Exclude Keywords */}
                    <div>
                        <h4 className="mb-2 font-bold text-sm text-gray-700">Exclude Keywords</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {config.keywords?.exclude?.map((kw: string) => (
                                <Tag key={kw} closable onClose={() => removeKeyword('exclude', kw)} theme="danger" variant="light">
                                    {kw}
                                </Tag>
                            ))}
                        </div>
                        <Input
                            placeholder="Add keyword and press Enter"
                            onEnter={(val) => addKeyword('exclude', String(val))}
                            style={{ width: 200 }}
                        />
                    </div>
                </div>
            </Card>

            <Card title="Advanced Settings" bordered>
                <Form labelWidth={150}>
                    <Form.FormItem label="Match Threshold">
                        <div className="w-64 flex items-center gap-4">
                            <Slider
                                value={config.match_threshold}
                                onChange={(val) => setConfig({ ...config, match_threshold: val })}
                                min={0}
                                max={100}
                            />
                            <span>{config.match_threshold}%</span>
                        </div>
                    </Form.FormItem>
                </Form>
            </Card>
        </div>
    );
}
