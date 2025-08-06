# Extracted JSON Files

This folder contains JSON files extracted from resume processing using the GPT OCR to DOCX to JSON pipeline.

## File Naming Convention

Files are named using the following pattern:
```
{original_filename}_{timestamp}.json
```

Example: `resume_2024-01-15T10-30-45-123Z.json`

## File Structure

Each JSON file contains the extracted resume data with the following structure:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "location": "City, Country",
  "summary": "Professional summary...",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "duration": "2020-2023",
      "description": "Job responsibilities..."
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "Computer Science",
      "year": "2020"
    }
  ]
}
```

## Processing Pipeline

1. **File Upload** → User uploads resume (PDF, DOCX, DOC, images)
2. **CloudConvert** → Converts to JPEG format
3. **GPT Vision OCR** → Extracts text from images
4. **DOCX Creation** → Creates organized DOCX file
5. **JSON Conversion** → Converts to structured JSON
6. **File Saving** → Saves JSON to this folder

## Access

Files can be accessed via:
- `https://yourdomain.com/extracted-json/filename.json`
- Local development: `http://localhost:3000/extracted-json/filename.json`

## Notes

- Files are automatically generated during resume processing
- Each file contains the complete extracted resume data
- Files are preserved for debugging and analysis purposes
- File sizes vary based on resume complexity 