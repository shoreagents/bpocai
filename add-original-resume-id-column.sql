-- Add original_resume_id column to saved_resumes table
-- This creates a connection between saved_resumes and resumes_generated tables

ALTER TABLE saved_resumes 
ADD COLUMN original_resume_id UUID REFERENCES resumes_generated(id) ON DELETE SET NULL;

-- Add an index for better query performance
CREATE INDEX idx_saved_resumes_original_resume_id ON saved_resumes(original_resume_id);

-- Add a comment to document the relationship
COMMENT ON COLUMN saved_resumes.original_resume_id IS 'References the resumes_generated table to track which AI-generated resume was used to create this saved resume';
