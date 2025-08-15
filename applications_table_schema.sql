-- Create applications table for storing user job applications
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(100),
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'interviewing', 'offered', 'rejected', 'withdrawn')),
    job_description TEXT,
    requirements JSONB,
    benefits JSONB,
    application_notes TEXT,
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Create index for faster queries by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Create index for faster queries by applied_date
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);

-- Add trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional - you can remove this)
INSERT INTO applications (user_id, job_id, job_title, company_name, location, salary, status, job_description, requirements, benefits, application_notes) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'job-001', 'Senior Customer Service Representative', 'TechCorp Solutions', 'Manila, Philippines', '₱35,000 - ₱45,000', 'interviewing', 'Lead customer service operations and mentor junior representatives.', '["5+ years experience", "Leadership skills", "Excellent communication"]', '["Health insurance", "Performance bonuses", "Career growth opportunities"]', 'Second interview scheduled for next week.'),
    ('00000000-0000-0000-0000-000000000001', 'job-002', 'BPO Team Lead', 'Global Connect Inc.', 'Cebu, Philippines', '₱40,000 - ₱50,000', 'reviewing', 'Manage team performance and ensure quality standards.', '["3+ years BPO experience", "Team management", "Quality assurance"]', '["Competitive salary", "Remote work options", "Training programs"]', 'Application under review by HR team.')
ON CONFLICT (id) DO NOTHING;
