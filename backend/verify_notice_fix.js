import dotenv from 'dotenv';
dotenv.config();
import * as noticeService from './services/notice.service.js';

async function verify() {
    try {
        console.log("Verifying notice creation with 'content' field...");
        const testNotice = {
            title: "Test Notice - " + new Date().toISOString(),
            content: "This is a test notice content to verify the fix.",
            priority: "normal",
            posted_by: "688ddbb2-475c-4395-8857-ae843cc1c810", // Using a dummy or existing uuid if possible, or skip auth check if service allows
            posted_by_role: "admin",
            is_pinned: false
        };
        
        const created = await noticeService.createNotice(testNotice);
        console.log("Successfully created notice:", created);
        
        if (created && created.id) {
            await noticeService.deleteNotice(created.id);
            console.log("Successfully deleted test notice.");
            console.log("VERIFICATION SUCCESSFUL");
        }
    } catch (error) {
        console.error("VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verify();
