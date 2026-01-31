import { useState, useEffect } from 'react';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { Task } from '@/types';

export function TasksPage() {
    const { currentProject } = useProject();
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchTasks = async () => {
        if (!currentProject) return;
        try {
            const data = await api.getTasks(currentProject._id);
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [currentProject?._id]);

    return (
        <div className="h-full">
            <TaskBoard tasks={tasks} onTasksChange={fetchTasks} />
        </div>
    );
}
