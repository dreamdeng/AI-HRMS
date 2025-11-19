'use client';

import React from 'react';
import { Card, Empty } from 'tdesign-react';

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reports</h2>
            <Card bordered>
                <div className="py-12">
                    <Empty description="Global reports feature is coming soon." />
                </div>
            </Card>
        </div>
    );
}
