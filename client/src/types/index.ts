export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt?: string;
}

export interface Project {
    _id: string;
    name: string;
    description: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
    _id: string;
    title: string;
    description: string;
    acceptanceCriteria: string;
    estimatedTime: number;
    actualTime: number;
    status: TaskStatus;
    assignees: User[];
    reviewers: User[];
    tags: string[];
    projectId: string;
    sprintId?: string;
    createdAt: string;
    updatedAt: string;
}

export type SprintStatus = 'planning' | 'active' | 'completed';

export interface Sprint {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: SprintStatus;
    projectId: string;
    createdAt: string;
}

export interface Retrospective {
    _id: string;
    sprintId: string;
    wentWell: string[];
    didntGoWell: string[];
    actionItems: string[];
    createdAt: string;
    updatedAt: string;
}

export interface WikiDocument {
    _id: string;
    title: string;
    content: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface MoM {
    _id: string;
    title: string;
    content: string;
    attendees: string[];
    meetingDate: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}
