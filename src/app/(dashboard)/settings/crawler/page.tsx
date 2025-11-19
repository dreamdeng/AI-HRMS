'use client';

import React, { useState } from 'react';
import { Form, Input, Switch, Button, Card, MessagePlugin, InputNumber, Textarea } from 'tdesign-react';

export default function CrawlerSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        requestDelay: 1000,
        maxRetries: 3,
        proxyEnabled: true,
        proxyUrl: 'http://proxy.example.com:8080',
        userAgent: 'Mozilla/5.0 ...',
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            MessagePlugin.success('Settings saved successfully');
        } catch (error) {
            MessagePlugin.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Crawler Settings</h2>

            <Card bordered>
                <Form labelWidth={150} labelAlign="left">
                    <Form.FormItem label="Request Delay (ms)">
                        <InputNumber
                            value={config.requestDelay}
                            onChange={(val) => setConfig({ ...config, requestDelay: Number(val) })}
                            min={0}
                            step={100}
                        />
                        <span className="text-gray-500 text-sm ml-2">Delay between requests to avoid blocking</span>
                    </Form.FormItem>

                    <Form.FormItem label="Max Retries">
                        <InputNumber
                            value={config.maxRetries}
                            onChange={(val) => setConfig({ ...config, maxRetries: Number(val) })}
                            min={0}
                            max={10}
                        />
                    </Form.FormItem>

                    <Form.FormItem label="Enable Proxy">
                        <Switch
                            value={config.proxyEnabled}
                            onChange={(val) => setConfig({ ...config, proxyEnabled: val })}
                        />
                    </Form.FormItem>

                    {config.proxyEnabled && (
                        <Form.FormItem label="Proxy URL">
                            <Input
                                value={config.proxyUrl}
                                onChange={(val) => setConfig({ ...config, proxyUrl: val })}
                                placeholder="http://user:pass@host:port"
                            />
                        </Form.FormItem>
                    )}

                    <Form.FormItem label="User Agent">
                        <Textarea
                            value={config.userAgent}
                            onChange={(val) => setConfig({ ...config, userAgent: val })}
                            autosize={{ minRows: 2, maxRows: 4 }}
                        />
                    </Form.FormItem>

                    <Form.FormItem>
                        <Button theme="primary" loading={loading} onClick={handleSave}>
                            Save Settings
                        </Button>
                    </Form.FormItem>
                </Form>
            </Card>
        </div>
    );
}
