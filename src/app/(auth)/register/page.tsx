'use client';

import React, { useState } from 'react';
import { Form, Input, Button, MessagePlugin, Link } from 'tdesign-react';
import { Mail, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AuthLayout from '@/components/layout/AuthLayout';

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: any) => {
        if (e.validateResult === true) {
            setLoading(true);
            const { email, password, fullName } = e.fields;

            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });

                if (error) {
                    MessagePlugin.error(error.message);
                } else {
                    MessagePlugin.success('Registration successful! Please check your email for verification.');
                    router.push('/login');
                }
            } catch (err) {
                MessagePlugin.error('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <AuthLayout>
            <h3 className="text-xl font-semibold mb-6 text-center">Create an account</h3>
            <Form onSubmit={onSubmit} colon={true} labelWidth={0}>
                <Form.FormItem
                    name="fullName"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                    <Input prefixIcon={<User />} placeholder="Full Name" size="large" />
                </Form.FormItem>

                <Form.FormItem
                    name="email"
                    rules={[{ required: true, message: 'Please enter your email' }, { email: true, message: 'Invalid email format' }]}
                >
                    <Input prefixIcon={<Mail />} placeholder="Email" size="large" />
                </Form.FormItem>

                <Form.FormItem
                    name="password"
                    rules={[
                        { required: true, message: 'Please enter your password' },
                        { min: 8, message: 'Password must be at least 8 characters' }
                    ]}
                >
                    <Input prefixIcon={<Lock />} type="password" placeholder="Password" size="large" />
                </Form.FormItem>

                <Form.FormItem>
                    <Button theme="primary" type="submit" block loading={loading} size="large">
                        Register
                    </Button>
                </Form.FormItem>

                <div className="flex justify-center mt-4">
                    <span className="text-gray-600 mr-2">Already have an account?</span>
                    <Link theme="primary" href="/login">Login</Link>
                </div>
            </Form>
        </AuthLayout>
    );
}
