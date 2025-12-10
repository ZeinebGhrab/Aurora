import { initSessions } from './session_teacher_data.js';
import { loadStats } from './session_teacher_stats.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initSessions();
    await loadStats();
});