'use client';

import React, { useState } from 'react';
import { Steps, Form, Input, Select, DatePicker, Button, MessagePlugin, Upload, Radio, Slider, Checkbox, Textarea } from 'tdesign-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const { StepItem } = Steps;
const { Option } = Select;
const { Group: RadioGroup } = Radio;
const { Group: CheckboxGroup } = Checkbox;

export default function NewProjectPage() {
    const router = useRouter();
    const supabase = createClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const steps = [
        { title: 'Basic Info', content: 'Project basic information' },
        { title: 'JD Import', content: 'Job Description details' },
        { title: 'Search Config', content: 'Search strategy configuration' },
    ];

    const handleNext = () => {
        setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Create Project
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .insert({
                    project_name: formData.projectName,
                    client_company: formData.clientCompany,
                    industry: formData.industry,
                    job_function: formData.jobFunction,
                    deadline: formData.deadline,
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                })
                .select()
                .single();

            if (projectError) throw projectError;

            // 2. Create JD
            const { error: jdError } = await supabase
                .from('job_descriptions')
                .insert({
                    project_id: projectData.id,
                    jd_source: formData.jdSource,
                    jd_content: formData.jdContent || '',
                    jd_url: formData.jdUrl || '',
                });

            if (jdError) throw jdError;

            // 3. Create Search Task (Initial Config)
            const { error: searchError } = await supabase
                .from('search_tasks')
                .insert({
                    project_id: projectData.id,
                    platforms: formData.platforms || [],
                    keywords: { primary: [], secondary: [], exclude: [] }, // Will be populated by AI later
                    match_threshold: formData.matchThreshold || 70,
                });

            if (searchError) throw searchError;

            MessagePlugin.success('Project created successfully');
            router.push(`/projects/${projectData.id}/jd-analysis`);
        } catch (error: any) {
            console.error('Error creating project:', error);
            MessagePlugin.error(error.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const onFormChange = (val: any) => {
        setFormData({ ...formData, ...val });
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <Steps current={currentStep}>
                    {steps.map((item, index) => (
                        <StepItem key={index} title={item.title} content={item.content} />
                    ))}
                </Steps>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <Form labelWidth={120} colon labelAlign="right">
                    {/* Step 1: Basic Info */}
                    {currentStep === 0 && (
                        <>
                            <Form.FormItem label="Project Name" name="projectName" initialData={formData.projectName}>
                                <Input placeholder="e.g. Senior Java Engineer" onChange={(val) => onFormChange({ projectName: val })} />
                            </Form.FormItem>
                            <Form.FormItem label="Client Company" name="clientCompany" initialData={formData.clientCompany}>
                                <Input placeholder="Company Name" onChange={(val) => onFormChange({ clientCompany: val })} />
                            </Form.FormItem>
                            <Form.FormItem label="Industry" name="industry" initialData={formData.industry}>
                                <Select placeholder="Select Industry" onChange={(val) => onFormChange({ industry: val })}>
                                    <Option value="Internet" label="Internet" />
                                    <Option value="Finance" label="Finance" />
                                    <Option value="Manufacturing" label="Manufacturing" />
                                    <Option value="Healthcare" label="Healthcare" />
                                </Select>
                            </Form.FormItem>
                            <Form.FormItem label="Function" name="jobFunction" initialData={formData.jobFunction}>
                                <Select placeholder="Select Function" onChange={(val) => onFormChange({ jobFunction: val })}>
                                    <Option value="Technology" label="Technology" />
                                    <Option value="Product" label="Product" />
                                    <Option value="Marketing" label="Marketing" />
                                    <Option value="Operations" label="Operations" />
                                </Select>
                            </Form.FormItem>
                            <Form.FormItem label="Deadline" name="deadline" initialData={formData.deadline}>
                                <DatePicker placeholder="Select Date" onChange={(val) => onFormChange({ deadline: val })} />
                            </Form.FormItem>
                        </>
                    )}

                    {/* Step 2: JD Import */}
                    {currentStep === 1 && (
                        <>
                            <Form.FormItem label="Import Method" name="jdSource" initialData={formData.jdSource || 'text'}>
                                <RadioGroup onChange={(val) => onFormChange({ jdSource: val })}>
                                    <Radio value="text">Paste Text</Radio>
                                    <Radio value="url">URL Link</Radio>
                                    <Radio value="file">Upload File</Radio>
                                </RadioGroup>
                            </Form.FormItem>

                            {formData.jdSource === 'file' && (
                                <Form.FormItem label="Upload JD">
                                    <Upload
                                        theme="file"
                                        accept=".pdf,.doc,.docx"
                                        placeholder="Click to upload"
                                        autoUpload={false}
                                        onChange={(files) => {
                                            // Handle file upload logic here if needed, or just store file object
                                            console.log(files);
                                        }}
                                    />
                                </Form.FormItem>
                            )}
                        </>
                    )}

                    {/* Step 3: Search Config */}
                    {currentStep === 2 && (
                        <>
                            <Form.FormItem label="Target Platforms" name="platforms" initialData={formData.platforms}>
                                <CheckboxGroup onChange={(val) => onFormChange({ platforms: val })}>
                                    <Checkbox value="boss">BOSS Zhipin</Checkbox>
                                    <Checkbox value="liepin">Liepin</Checkbox>
                                    <Checkbox value="zhilian">Zhilian</Checkbox>
                                </CheckboxGroup>
                            </Form.FormItem>
                            <Form.FormItem label="Match Threshold" name="matchThreshold" initialData={formData.matchThreshold || 70}>
                                <div className="w-full px-2">
                                    <Slider min={0} max={100} value={formData.matchThreshold || 70} onChange={(val) => onFormChange({ matchThreshold: val })} />
                                </div>
                            </Form.FormItem>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end mt-8 space-x-4">
                        {currentStep > 0 && (
                            <Button theme="default" onClick={handlePrev}>
                                Previous
                            </Button>
                        )}
                        {currentStep < steps.length - 1 && (
                            <Button theme="primary" onClick={handleNext}>
                                Next
                            </Button>
                        )}
                        {currentStep === steps.length - 1 && (
                            <Button theme="primary" onClick={handleSubmit} loading={loading}>
                                Create Project
                            </Button>
                        )}
                    </div>
                </Form>
            </div>
        </div>
    );
}
