'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Loading, Tag, Button, MessagePlugin, Collapse } from 'tdesign-react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const { Panel } = Collapse;

export default function JDAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [jdData, setJdData] = useState<any>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    useEffect(() => {
        const fetchJD = async () => {
            if (!params.id) return;

            const { data, error } = await supabase
                .from('job_descriptions')
                .select('*, projects(*)')
                .eq('project_id', params.id)
                .single();

            if (error) {
                MessagePlugin.error('Failed to load JD');
                return;
            }

            setJdData(data);

            // Check if analysis already exists
            const { data: analysis } = await supabase
                .from('jd_analysis')
                .select('*')
                .eq('jd_id', data.id)
                .single();

            if (analysis) {
                setAnalysisResult(analysis);
                setLoading(false);
            } else {
                // Trigger auto analysis
                handleAnalyze(data.id, data.jd_content);
            }
        };

        fetchJD();
    }, [params.id]);

    const handleAnalyze = async (jdId: string, content: string) => {
        setAnalyzing(true);
        setLoading(false);
        try {
            // Call AI API (Mock for now)
            const response = await fetch('/api/ai/parse-jd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jdContent: content, projectId: params.id }),
            });

            const result = await response.json();
            if (result.success) {
                setAnalysisResult(result.data);
                // Save to DB
                await supabase.from('jd_analysis').insert({
                    jd_id: jdId,
                    ...result.data
                });
            }
        } catch (error) {
            MessagePlugin.error('Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleConfirm = () => {
        router.push(`/projects/${params.id}/search-config`);
    };

    if (loading) return <div className="p-8 text-center"><Loading /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">JD Analysis</h2>
                <div className="space-x-3">
                    <Button theme="default" onClick={() => handleAnalyze(jdData.id, jdData.jd_content)}>Re-analyze</Button>
                    <Button theme="primary" onClick={handleConfirm}>Confirm & Next</Button>
                </div>
            </div>

            <Row gutter={[16, 16]}>
                {/* Left: Original JD */}
                <Col xs={12} md={6}>
                    <Card title="Original JD" bordered className="h-full">
                        <div className="whitespace-pre-wrap text-sm text-gray-600">
                            {jdData?.jd_content}
                        </div>
                    </Card>
                </Col>

                {/* Right: Analysis Result */}
                <Col xs={12} md={6}>
                    <Card title="AI Analysis Result" bordered className="h-full">
                        {analyzing ? (
                            <div className="py-12 text-center">
                                <Loading text="AI is analyzing the JD..." />
                            </div>
                        ) : analysisResult ? (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold mb-2">Basic Info</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-500">Title:</span> {analysisResult.position_title}</div>
                                        <div><span className="text-gray-500">Location:</span> {analysisResult.location}</div>
                                        <div><span className="text-gray-500">Salary:</span> {analysisResult.salary_range}</div>
                                        <div><span className="text-gray-500">Experience:</span> {analysisResult.experience_years}</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold mb-2">Required Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.required_skills?.map((skill: string, i: number) => (
                                            <Tag key={i} theme="danger" variant="light">{skill}</Tag>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold mb-2">Preferred Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.preferred_skills?.map((skill: string, i: number) => (
                                            <Tag key={i} theme="primary" variant="light">{skill}</Tag>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold mb-2">AI Insights</h4>
                                    <Collapse>
                                        <Panel header="Market Analysis">
                                            <p>Difficulty: {analysisResult.ai_insights?.difficulty}</p>
                                            <p>Market Heat: {analysisResult.ai_insights?.marketHeat}</p>
                                        </Panel>
                                        <Panel header="Search Keywords">
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.search_keywords?.map((kw: string, i: number) => (
                                                    <Tag key={i} variant="outline">{kw}</Tag>
                                                ))}
                                            </div>
                                        </Panel>
                                    </Collapse>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">No analysis result</div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
