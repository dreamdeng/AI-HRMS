import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectId } = body;
        const supabase = await createClient();

        // Simulate search delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock Candidates Data
        const mockCandidates = [
            {
                name: 'John Doe',
                current_company: 'Tech Giant Inc.',
                current_position: 'Senior Engineer',
                years_of_experience: 6,
                education: 'Master in CS',
                match_score: 92,
                status: 'new',
                resume_url: 'https://example.com/resume1.pdf',
                skills: ['Java', 'Spring', 'Microservices'],
                source_platform: 'BOSS'
            },
            {
                name: 'Jane Smith',
                current_company: 'Startup Co.',
                current_position: 'Lead Developer',
                years_of_experience: 8,
                education: 'Bachelor in SE',
                match_score: 88,
                status: 'new',
                resume_url: 'https://example.com/resume2.pdf',
                skills: ['Java', 'Kotlin', 'AWS'],
                source_platform: 'Liepin'
            },
            {
                name: 'Mike Johnson',
                current_company: 'Global Corp',
                current_position: 'Software Engineer',
                years_of_experience: 4,
                education: 'Bachelor in CS',
                match_score: 75,
                status: 'new',
                resume_url: 'https://example.com/resume3.pdf',
                skills: ['Java', 'MySQL'],
                source_platform: 'Zhilian'
            }
        ];

        // Insert Mock Candidates
        for (const candidate of mockCandidates) {
            await supabase.from('candidates').insert({
                project_id: projectId,
                ...candidate
            });
        }

        // Update Search Task Status
        await supabase
            .from('search_tasks')
            .update({ status: 'completed', last_run_at: new Date().toISOString() })
            .eq('project_id', projectId);

        return NextResponse.json({ success: true, count: mockCandidates.length });
    } catch (error) {
        console.error('Search failed:', error);
        return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
    }
}
