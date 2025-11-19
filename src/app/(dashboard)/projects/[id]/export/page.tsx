'use client';

import React, { useState } from 'react';
import { Form, Radio, Checkbox, Button, Card, MessagePlugin, DateRangePicker } from 'tdesign-react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useParams } from 'next/navigation';

const { Group: RadioGroup } = Radio;
const { Group: CheckboxGroup } = Checkbox;

export default function ExportPage() {
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<{
        format: string;
        content: any[];
        dateRange: any;
    }>({
        format: 'pdf',
        content: ['basic', 'analysis', 'resume'],
        dateRange: [],
    });

    const handleExport = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            MessagePlugin.success('Report generated successfully! Download starting...');

            // In a real app, this would trigger a file download
            // window.open(downloadUrl, '_blank');

        } catch (error) {
            MessagePlugin.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Export & Reports</h2>

            <Card bordered>
                <Form labelWidth={120} labelAlign="left">
                    <Form.FormItem label="Format">
                        <RadioGroup
                            value={config.format}
                            onChange={(val) => setConfig({ ...config, format: String(val) })}
                            variant="default-filled"
                        >
                            <Radio.Button value="pdf">
                                <div className="flex items-center space-x-2">
                                    <FileText size={16} />
                                    <span>PDF Report</span>
                                </div>
                            </Radio.Button>
                            <Radio.Button value="excel">
                                <div className="flex items-center space-x-2">
                                    <FileSpreadsheet size={16} />
                                    <span>Excel Data</span>
                                </div>
                            </Radio.Button>
                        </RadioGroup>
                    </Form.FormItem>

                    <Form.FormItem label="Content">
                        <CheckboxGroup
                            value={config.content}
                            onChange={(val) => setConfig({ ...config, content: val })}
                        >
                            <Checkbox value="basic">Basic Info</Checkbox>
                            <Checkbox value="analysis">AI Analysis</Checkbox>
                            <Checkbox value="resume">Original Resume</Checkbox>
                            <Checkbox value="history">Activity History</Checkbox>
                        </CheckboxGroup>
                    </Form.FormItem>

                    <Form.FormItem label="Date Range">
                        <DateRangePicker
                            placeholder={['Start Date', 'End Date']}
                            onChange={(val) => setConfig({ ...config, dateRange: val })}
                        />
                    </Form.FormItem>

                    <Form.FormItem>
                        <Button
                            theme="primary"
                            icon={<Download />}
                            loading={loading}
                            onClick={handleExport}
                            size="large"
                            block
                        >
                            Generate & Download Report
                        </Button>
                    </Form.FormItem>
                </Form>
            </Card>
        </div>
    );
}
