import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { candidateId, projectId } = body;

        // Simulate AI processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock Analysis Result
        const mockAnalysis = {
            overall_score: 92,
            dimensions: [
                { name: 'Skills Match', score: 95, comment: 'Candidate possesses all required skills (Java, Spring, MySQL).' },
                { name: 'Experience', score: 90, comment: '6 years of experience fits the Senior role requirement well.' },
                { name: 'Education', score: 85, comment: 'Master degree in CS is a plus.' },
                { name: 'Stability', score: 80, comment: 'Average tenure of 2 years is acceptable but could be better.' }
            ],
            key_highlights: [
                'Strong technical background in Java ecosystem',
                'Experience with high concurrency systems',
                'Good educational background'
            ],
            potential_risks: [
                'Salary expectation might be on the higher end',
                'Remote work preference'
            ],
            interview_questions: [
                'Can you describe a challenging concurrency problem you solved?',
                'How do you handle database optimization in a microservices architecture?',
                'What is your experience with Spring Cloud components?'
            ]
        };

        return NextResponse.json({ success: true, data: mockAnalysis });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
    }
}
