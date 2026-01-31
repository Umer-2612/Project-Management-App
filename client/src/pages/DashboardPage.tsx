import { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, Sprint } from '@/types';
import { CheckSquare, Clock, Calendar, FileText, Users } from 'lucide-react';

export function DashboardPage() {
    const { currentProject } = useProject();
    const [stats, setStats] = useState({
        totalTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        reviewTasks: 0,
        doneTasks: 0,
        activeSprint: null as Sprint | null,
        totalDocs: 0,
        totalMoMs: 0,
    });

    useEffect(() => {
        if (!currentProject) return;

        const fetchStats = async () => {
            try {
                const [tasks, sprints, docs, moms] = await Promise.all([
                    api.getTasks(currentProject._id),
                    api.getSprints(currentProject._id),
                    api.getDocuments(currentProject._id),
                    api.getMoMs(currentProject._id),
                ]);

                setStats({
                    totalTasks: tasks.length,
                    todoTasks: tasks.filter((t: Task) => t.status === 'todo').length,
                    inProgressTasks: tasks.filter((t: Task) => t.status === 'in-progress').length,
                    reviewTasks: tasks.filter((t: Task) => t.status === 'review').length,
                    doneTasks: tasks.filter((t: Task) => t.status === 'done').length,
                    activeSprint: sprints.find((s: Sprint) => s.status === 'active') || null,
                    totalDocs: docs.length,
                    totalMoMs: moms.length,
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            }
        };

        fetchStats();
    }, [currentProject?._id]);

    if (!currentProject) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Welcome to LeanAgile</h2>
                    <p className="text-muted-foreground">
                        Create or select a project to get started
                    </p>
                </div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'text-blue-500' },
        { title: 'To Do', value: stats.todoTasks, icon: Clock, color: 'text-slate-500' },
        { title: 'In Progress', value: stats.inProgressTasks, icon: Clock, color: 'text-blue-500' },
        { title: 'In Review', value: stats.reviewTasks, icon: Clock, color: 'text-amber-500' },
        { title: 'Completed', value: stats.doneTasks, icon: CheckSquare, color: 'text-green-500' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{currentProject.name}</h1>
                <p className="text-muted-foreground">{currentProject.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Active Sprint & Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Active Sprint
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.activeSprint ? (
                            <div>
                                <h3 className="text-lg font-semibold">{stats.activeSprint.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(stats.activeSprint.startDate).toLocaleDateString()} -{' '}
                                    {new Date(stats.activeSprint.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No active sprint</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Project Resources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Documents</span>
                                <span className="font-medium">{stats.totalDocs}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Meeting Minutes</span>
                                <span className="font-medium">{stats.totalMoMs}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Task Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Task Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex h-4 overflow-hidden rounded-full bg-muted">
                            {stats.totalTasks > 0 && (
                                <>
                                    <div
                                        className="bg-green-500 transition-all"
                                        style={{ width: `${(stats.doneTasks / stats.totalTasks) * 100}%` }}
                                    />
                                    <div
                                        className="bg-amber-500 transition-all"
                                        style={{ width: `${(stats.reviewTasks / stats.totalTasks) * 100}%` }}
                                    />
                                    <div
                                        className="bg-blue-500 transition-all"
                                        style={{ width: `${(stats.inProgressTasks / stats.totalTasks) * 100}%` }}
                                    />
                                    <div
                                        className="bg-slate-400 transition-all"
                                        style={{ width: `${(stats.todoTasks / stats.totalTasks) * 100}%` }}
                                    />
                                </>
                            )}
                        </div>
                        <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span>Done ({stats.doneTasks})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-amber-500" />
                                <span>Review ({stats.reviewTasks})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <span>In Progress ({stats.inProgressTasks})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-slate-400" />
                                <span>To Do ({stats.todoTasks})</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
