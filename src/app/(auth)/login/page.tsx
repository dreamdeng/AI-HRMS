'use client';

import React, { useState } from 'react';
import { Form, Input, Button, MessagePlugin, Link } from 'tdesign-react';
import { Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AuthLayout from '@/components/layout/AuthLayout';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: any) => {
        if (e.validateResult === true) {
            setLoading(true);
            const { email, password } = e.fields;

            try {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    MessagePlugin.error(error.message);
                } else {
                    MessagePlugin.success('Login successful');
                    router.push('/dashboard');
                    router.refresh();
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
            <h3 className="text-xl font-semibold mb-6 text-center">Login to your account</h3>
            <Form onSubmit={onSubmit} colon={true} labelWidth={0}>
                <Form.FormItem
                    name="email"
                    rules={[{ required: true, message: 'Please enter your email' }, { email: true, message: 'Invalid email format' }]}
                >
                    <Input prefixIcon={<Mail />} placeholder="Email" size="large" />
                </Form.FormItem>

                <Form.FormItem
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input prefixIcon={<Lock />} type="password" placeholder="Password" size="large" />
                </Form.FormItem>

                <Form.FormItem>
                    <Button theme="primary" type="submit" block loading={loading} size="large">
                        Login
                    </Button>
                </Form.FormItem>

                <div className="flex justify-between items-center mt-4">
                    <Link theme="primary" href="/register">Create an account</Link>
                    <Link theme="default" href="#">Forgot password?</Link>
                </div>
            </Form>
        </AuthLayout>
    );
}
