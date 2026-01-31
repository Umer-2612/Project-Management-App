import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '@/types';
import { api } from '@/lib/api';
import { useSocket } from './SocketContext';

const STORAGE_KEY = 'leanagile_current_project_id';

interface ProjectContextType {
    currentProject: Project | null;
    projects: Project[];
    isLoading: boolean;
    setCurrentProject: (project: Project | null) => void;
    refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType>({
    currentProject: null,
    projects: [],
    isLoading: true,
    setCurrentProject: () => { },
    refreshProjects: async () => { },
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { joinProject, leaveProject } = useSocket();

    const refreshProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);

            // Try to restore saved project, otherwise use first project
            if (!currentProject && data.length > 0) {
                const savedProjectId = localStorage.getItem(STORAGE_KEY);
                const savedProject = savedProjectId
                    ? data.find((p: Project) => p._id === savedProjectId)
                    : null;
                setCurrentProjectState(savedProject || data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setCurrentProject = (project: Project | null) => {
        if (currentProject?._id) {
            leaveProject(currentProject._id);
        }
        setCurrentProjectState(project);
        if (project?._id) {
            joinProject(project._id);
            // Persist selection to localStorage
            localStorage.setItem(STORAGE_KEY, project._id);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    useEffect(() => {
        refreshProjects();
    }, []);

    useEffect(() => {
        if (currentProject?._id) {
            joinProject(currentProject._id);
        }
        return () => {
            if (currentProject?._id) {
                leaveProject(currentProject._id);
            }
        };
    }, [currentProject?._id]);

    return (
        <ProjectContext.Provider
            value={{
                currentProject,
                projects,
                isLoading,
                setCurrentProject,
                refreshProjects,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}
