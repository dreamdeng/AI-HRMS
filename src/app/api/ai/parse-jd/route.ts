import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { jdContent } = body;

        // Simulate AI processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock response based on content (simple keyword check for demo)
        const isJava = jdContent.toLowerCase().includes('java');
        const isFrontend = jdContent.toLowerCase().includes('frontend') || jdContent.toLowerCase().includes('react');

        const mockData = {
            position_title: isJava ? 'Senior Java Engineer' : isFrontend ? 'Frontend Developer' : 'Software Engineer',
            location: 'Shenzhen, China',
            salary_range: '30k - 50k',
            education_requirement: 'Bachelor Degree',
            experience_years: '5+ years',
            required_skills: isJava
                ? ['Java', 'Spring Boot', 'MySQL', 'Redis']
                : isFrontend
                    ? ['React', 'TypeScript', 'Next.js', 'Tailwind CSS']
                    : ['Python', 'Django', 'PostgreSQL'],
            preferred_skills: ['Kubernetes', 'Microservices', 'High Concurrency'],
            soft_skills: ['Communication', 'Teamwork', 'Problem Solving'],
            language_requirements: 'English CET-6',
            ai_insights: {
                difficulty: 'Medium',
                marketHeat: 'High',
            },
            search_keywords: isJava
                ? ['Java', 'Spring Cloud', 'Backend']
                : isFrontend
                    ? ['Frontend', 'React', 'Web']
                    : ['Software', 'Developer']
        };

        return NextResponse.json({
            success: true,
            data: mockData
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to parse JD' }, { status: 500 });
    }
}
