#!/usr/bin/env node

/**
 * Migration Script: Update Resume Slugs
 * 
 * This script updates all existing resume slugs to the new format:
 * firstName-lastName-lastTwoDigitsOfUID
 * 
 * Usage: node migrate-resume-slugs.js [--dry-run] [--backup]
 */

const fs = require('fs');
const path = require('path');

// Helper function to generate clean resume slug (same as frontend)
const generateResumeSlug = (firstName, lastName, uid) => {
  // Clean and normalize names
  const cleanFirst = (firstName || 'user')
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .replace(/[^a-z0-9]/g, '') // Keep only alphanumeric
    .slice(0, 20); // Limit length
  
  const cleanLast = (lastName || 'profile')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  
  // Get last 2 digits of UID
  const uidStr = uid.toString();
  const lastTwoDigits = uidStr.slice(-2).padStart(2, '0'); // Ensure 2 digits
  
  return `${cleanFirst}-${cleanLast}-${lastTwoDigits}`;
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldBackup = args.includes('--backup');

console.log('🚀 Resume Slug Migration Script');
console.log('================================');
console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE MIGRATION'}`);
console.log(`Backup: ${shouldBackup ? 'Enabled' : 'Disabled'}`);
console.log('');

// Database connection (you'll need to configure this based on your setup)
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL or SUPABASE_URL environment variable is required');
  process.exit(1);
}

// Migration function
async function migrateResumeSlugs() {
  try {
    console.log('📊 Fetching existing resumes and users...');
    
    // This is a template - you'll need to adapt based on your database setup
    // For Supabase/PostgreSQL:
    const query = `
      SELECT 
        r.id as resume_id,
        r.slug as current_slug,
        r.user_id,
        u.first_name,
        u.last_name,
        u.id as uid
      FROM saved_resumes r
      JOIN users u ON r.user_id = u.id
      WHERE r.slug IS NOT NULL
      ORDER BY r.created_at ASC
    `;
    
    // You'll need to implement the actual database connection here
    // const { data: resumes, error } = await supabase.rpc('get_resumes_for_migration');
    
    // For demonstration, here's the structure you'd work with:
    const resumesToUpdate = [
      // This would come from your database query
      // { resume_id: 1, current_slug: 'abc123', user_id: 12345, first_name: 'John', last_name: 'Doe', uid: 12345 }
    ];
    
    console.log(`📋 Found ${resumesToUpdate.length} resumes to process`);
    
    if (resumesToUpdate.length === 0) {
      console.log('✅ No resumes found to migrate');
      return;
    }
    
    // Create backup if requested
    if (shouldBackup && !isDryRun) {
      const backupData = {
        timestamp: new Date().toISOString(),
        resumes: resumesToUpdate.map(r => ({
          resume_id: r.resume_id,
          old_slug: r.current_slug,
          user_id: r.user_id
        }))
      };
      
      const backupFile = `resume-slugs-backup-${Date.now()}.json`;
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      console.log(`💾 Backup created: ${backupFile}`);
    }
    
    let successCount = 0;
    let errorCount = 0;
    const conflicts = [];
    const updates = [];
    
    console.log('🔄 Processing resumes...');
    console.log('');
    
    for (const resume of resumesToUpdate) {
      try {
        const newSlug = generateResumeSlug(
          resume.first_name,
          resume.last_name,
          resume.uid
        );
        
        // Check if slug would change
        if (resume.current_slug === newSlug) {
          console.log(`⏭️  Resume ${resume.resume_id}: Slug already correct (${newSlug})`);
          continue;
        }
        
        // Check for conflicts (same new slug for different resumes)
        const existingWithNewSlug = resumesToUpdate.find(r => 
          r.resume_id !== resume.resume_id && 
          generateResumeSlug(r.first_name, r.last_name, r.uid) === newSlug
        );
        
        if (existingWithNewSlug) {
          conflicts.push({
            resume_id: resume.resume_id,
            conflicting_resume_id: existingWithNewSlug.resume_id,
            slug: newSlug
          });
          console.log(`⚠️  Resume ${resume.resume_id}: Slug conflict detected (${newSlug})`);
          errorCount++;
          continue;
        }
        
        updates.push({
          resume_id: resume.resume_id,
          old_slug: resume.current_slug,
          new_slug: newSlug,
          user_name: `${resume.first_name} ${resume.last_name}`
        });
        
        console.log(`✅ Resume ${resume.resume_id}: ${resume.current_slug} → ${newSlug} (${resume.first_name} ${resume.last_name})`);
        
        // Perform the actual update (if not dry run)
        if (!isDryRun) {
          // You'll need to implement the actual database update here
          // await supabase.from('saved_resumes').update({ slug: newSlug }).eq('id', resume.resume_id);
          console.log(`   📝 Database updated for resume ${resume.resume_id}`);
        }
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error processing resume ${resume.resume_id}:`, error.message);
        errorCount++;
      }
    }
    
    // Summary
    console.log('');
    console.log('📊 Migration Summary');
    console.log('===================');
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⚠️  Conflicts: ${conflicts.length}`);
    
    if (conflicts.length > 0) {
      console.log('');
      console.log('⚠️  Slug Conflicts Detected:');
      conflicts.forEach(conflict => {
        console.log(`   Resume ${conflict.resume_id} conflicts with Resume ${conflict.conflicting_resume_id} (slug: ${conflict.slug})`);
      });
    }
    
    if (isDryRun) {
      console.log('');
      console.log('🔍 This was a dry run - no changes were made to the database');
      console.log('   Run without --dry-run to apply changes');
    } else if (successCount > 0) {
      console.log('');
      console.log('✅ Migration completed successfully!');
      console.log('   All resume URLs have been updated to the new format');
    }
    
    // Save migration report
    const reportFile = `migration-report-${Date.now()}.json`;
    const report = {
      timestamp: new Date().toISOString(),
      mode: isDryRun ? 'dry-run' : 'live',
      summary: {
        total_processed: resumesToUpdate.length,
        successful_updates: successCount,
        errors: errorCount,
        conflicts: conflicts.length
      },
      updates,
      conflicts
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📄 Migration report saved: ${reportFile}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Database setup instructions
console.log('📋 Database Setup Required:');
console.log('');
console.log('Before running this script, you need to:');
console.log('1. Set up your database connection (DATABASE_URL or SUPABASE_URL)');
console.log('2. Uncomment and configure the database query sections');
console.log('3. Test with --dry-run first');
console.log('');
console.log('Example usage:');
console.log('  node migrate-resume-slugs.js --dry-run --backup');
console.log('  node migrate-resume-slugs.js --backup');
console.log('');

// Uncomment this line when you've configured the database connection
// migrateResumeSlugs();

console.log('⚠️  Script is in template mode - please configure database connection first');
