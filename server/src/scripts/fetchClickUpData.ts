
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN;
const TARGET_WORKSPACE_NAME = 'Umer-ATU-Workspace';
const TARGET_PROJECT_NAME = 'DevOps Project 2025-26'; // Targeting the Space

if (!CLICKUP_API_TOKEN) {
    console.error('❌ CLICKUP_API_TOKEN is missing from .env');
    process.exit(1);
}

const API_BASE = 'https://api.clickup.com/api/v2';
const HEADERS = {
    'Authorization': CLICKUP_API_TOKEN,
    'Content-Type': 'application/json'
};

async function fetchAPI(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, { headers: HEADERS });
    if (!response.ok) {
        throw new Error(`API Error ${endpoint}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function getAllTasksInSpace(spaceId: string) {
    const allTasks: any[] = [];

    // 1. Get folderless lists in space
    const listsData: any = await fetchAPI(`/space/${spaceId}/list?archived=false`);
    for (const list of listsData.lists) {
        console.log(`   📄 Fetching from List: ${list.name}`);
        const tasks = await fetchTasksFromList(list.id);
        allTasks.push(...tasks);
    }

    // 2. Get folders
    const foldersData: any = await fetchAPI(`/space/${spaceId}/folder?archived=false`);
    for (const folder of foldersData.folders) {
        console.log(`   mb Fetching from Folder: ${folder.name}`);
        const folderLists: any = await fetchAPI(`/folder/${folder.id}/list?archived=false`);
        for (const list of folderLists.lists) {
            console.log(`      � Fetching from List: ${list.name}`);
            const tasks = await fetchTasksFromList(list.id);
            allTasks.push(...tasks);
        }
    }
    return allTasks;
}

async function findTargetSpace() {
    console.log('🔍 Fetching user teams (workspaces)...');
    const teamsData: any = await fetchAPI('/team');
    const team = teamsData.teams.find((t: any) => t.name === TARGET_WORKSPACE_NAME);

    if (!team) {
        console.error(`❌ Workspace "${TARGET_WORKSPACE_NAME}" not found.`);
        process.exit(1);
    }

    console.log('🔍 Fetching spaces...');
    const spacesData: any = await fetchAPI(`/team/${team.id}/space?archived=false`);
    const targetSpace = spacesData.spaces.find((s: any) => s.name === TARGET_PROJECT_NAME);

    if (!targetSpace) {
        console.error(`❌ Space "${TARGET_PROJECT_NAME}" not found.`);
        process.exit(1);
    }

    console.log(`✅ Found Target Space: ${targetSpace.name} (${targetSpace.id})`);
    return targetSpace.id;
}

async function fetchTasksFromList(listId: string) {
    const tasks: any[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        const response: any = await fetchAPI(`/list/${listId}/task?archived=false&page=${page}&include_closed=true`);
        if (response.tasks.length === 0) {
            hasMore = false;
        } else {
            tasks.push(...response.tasks);
            // console.log(`      Fetched ${response.tasks.length} tasks...`);
            page++;
        }
    }
    return tasks;
}

async function main() {
    try {
        const spaceId = await findTargetSpace();
        const tasks = await getAllTasksInSpace(spaceId);

        console.log(`✅ Total tasks fetched from Space: ${tasks.length}`);

        const outputPath = path.join(process.cwd(), 'src/scripts/data/clickup_tasks.json');

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(outputPath, JSON.stringify(tasks, null, 2));
        console.log(`💾 Saved to ${outputPath}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
