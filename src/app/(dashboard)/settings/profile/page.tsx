'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, MessagePlugin, Avatar, Upload } from 'tdesign-react';
import { User, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        company: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // In a real app, fetch profile from 'user_profiles' table
                setFormData({
                    fullName: user.user_metadata?.full_name || '',
                    email: user.email || '',
                    phone: '',
                    company: '',
                });
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: formData.fullName }
            });

            if (error) throw error;
            MessagePlugin.success('Profile updated successfully');
        } catch (error) {
            MessagePlugin.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">My Profile</h2>

            <Card bordered>
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer">
                        <Avatar size="100px" icon={<User />} />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" />
                        </div>
                    </div>
                    <h3 className="mt-4 text-xl font-bold">{formData.fullName || 'User'}</h3>
                    <p className="text-gray-500">{formData.email}</p>
                </div>

                <Form labelWidth={120} labelAlign="left">
                    <Form.FormItem label="Full Name">
                        <Input
                            value={formData.fullName}
                            onChange={(val) => setFormData({ ...formData, fullName: val })}
                        />
                    </Form.FormItem>

                    <Form.FormItem label="Email">
                        <Input
                            value={formData.email}
                            disabled
                        />
                    </Form.FormItem>

                    <Form.FormItem label="Phone">
                        <Input
                            value={formData.phone}
                            onChange={(val) => setFormData({ ...formData, phone: val })}
                            placeholder="Optional"
                        />
                    </Form.FormItem>

                    <Form.FormItem label="Company">
                        <Input
                            value={formData.company}
                            onChange={(val) => setFormData({ ...formData, company: val })}
                            placeholder="Optional"
                        />
                    </Form.FormItem>

                    <Form.FormItem>
                        <Button theme="primary" loading={loading} onClick={handleSave}>
                            Save Changes
                        </Button>
                    </Form.FormItem>
                </Form>
            </Card>
        </div>
    );
}
