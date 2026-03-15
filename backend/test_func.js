import dotenv from 'dotenv';
dotenv.config();
import { getTeacherCourses } from './services/teacher.service.js';
import { getTeacherId } from './services/teacher.service.js';

export async function run() {
    try {
        const p = await getTeacherCourses('77478df7-db4a-44c1-8ce2-628d05b5faab'); // Need the actual auth ID of the user. I'll read from DB first
        console.log(p);
    } catch(e) {
        console.error(e);
    }
}
