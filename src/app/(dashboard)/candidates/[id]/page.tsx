'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Button, Loading, Tabs, Timeline, MessagePlugin } from 'tdesign-react';
import { ArrowLeft, Mail, Phone, Download, ExternalLink } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const { TabPanel } = Tabs;
const { Item: TimelineItem } = Timeline;

export default function CandidateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [candidate, setCandidate] = useState<any>(null);

    useEffect(() => {
        const fetchCandidate = async () => {
            if (!params.id) return;

            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                MessagePlugin.error('Failed to load candidate');
            } else {
                setCandidate(data);
            }
            setLoading(false);
        };

        fetchCandidate();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center"><Loading /></div>;
    if (!candidate) return <div className="p-8 text-center">Candidate not found</div>;

    const [analysis, setAnalysis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const fetchAnalysis = async () => {
        if (!candidate) return;
        setAnalyzing(true);
        try {
            const response = await fetch('/api/ai/analyze-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId: candidate.id, projectId: candidate.project_id }),
            });
            const result = await response.json();
            if (result.success) {
                setAnalysis(result.data);
            }
        } catch (error) {
            MessagePlugin.error('Failed to fetch analysis');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="text" icon={<ArrowLeft />} onClick={() => router.back()}>
                Back to List
            </Button>

            {/* Header Card */}
            <Card bordered>
                <div className="flex justify-between items-start">
                    <div className="flex space-x-6">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
                            {candidate.name[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{candidate.name}</h1>
                            <div className="text-lg text-gray-600 mb-2">
                                {candidate.current_position} @ {candidate.current_company}
                            </div>
                            <div className="flex space-x-4 text-sm text-gray-500">
                                <span>{candidate.years_of_experience} Years Exp</span>
                                <span>|</span>
                                <span>{candidate.education}</span>
                                <span>|</span>
                                <span>{candidate.location || 'Unknown Location'}</span>
                            </div>
                            <div className="mt-4 flex space-x-2">
                                {candidate.skills?.map((skill: string) => (
                                    <Tag key={skill} theme="primary" variant="light">{skill}</Tag>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Match Score</div>
                            <div className={`text-4xl font-bold ${candidate.match_score >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {candidate.match_score}%
                            </div>
                        </div>
                        <div className="space-x-3">
                            <Button theme="primary">Contact</Button>
                            <Button variant="outline">Reject</Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Row gutter={[16, 16]}>
                {/* Left Column: Details */}
                <Col xs={12} md={8}>
                    <Card bordered className="h-full">
                        <Tabs defaultValue="resume" onChange={(val) => {
                            if (val === 'analysis' && !analysis) {
                                fetchAnalysis();
                            }
                        }}>
                            <TabPanel value="resume" label="Resume Preview">
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded border">
                                        <div className="flex items-center space-x-2">
                                            <ExternalLink size={16} />
                                            <span className="font-medium">Resume Source URL</span>
                                        </div>
                                        <a href={candidate.resume_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                            Open Link
                                        </a>
                                    </div>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-500 italic">Resume content preview would be displayed here...</p>
                                        {/* In a real app, we would render PDF or parsed text here */}
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel value="analysis" label="AI Analysis">
                                <div className="p-4 space-y-6">
                                    {analyzing ? (
                                        <div className="text-center py-8"><Loading text="Analyzing match..." /></div>
                                    ) : analysis ? (
                                        <>
                                            <div>
                                                <h4 className="font-bold mb-3">Dimension Scores</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {analysis.dimensions.map((dim: any, i: number) => (
                                                        <div key={i} className="bg-gray-50 p-3 rounded">
                                                            <div className="flex justify-between mb-1">
                                                                <span className="font-medium">{dim.name}</span>
                                                                <span className="font-bold text-blue-600">{dim.score}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500">{dim.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-bold mb-2 text-green-700">Highlights</h4>
                                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                    {analysis.key_highlights.map((item: string, i: number) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold mb-2 text-red-700">Potential Risks</h4>
                                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                    {analysis.potential_risks.map((item: string, i: number) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold mb-2 text-blue-700">Suggested Interview Questions</h4>
                                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                    {analysis.interview_questions.map((item: string, i: number) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-500">Click tab to load analysis</div>
                                    )}
                                </div>
                            </TabPanel>
                        </Tabs>
                    </Card>
                </Col>

                {/* Right Column: Contact & History */}
                <Col xs={12} md={4}>
                    <div className="space-y-6">
                        <Card title="Contact Info" bordered>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Mail size={18} className="text-gray-400" />
                                    <span>{candidate.email || 'email@example.com'}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone size={18} className="text-gray-400" />
                                    <span>{candidate.phone || '+86 138 0000 0000'}</span>
                                </div>
                            </div>
                        </Card>

                        <Card title="Activity History" bordered>
                            <Timeline layout="vertical">
                                <TimelineItem label="Today">Viewed by Recruiter</TimelineItem>
                                <TimelineItem label="Yesterday">Imported from BOSS</TimelineItem>
                            </Timeline>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
