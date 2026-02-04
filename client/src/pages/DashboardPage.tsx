import { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, Sprint } from '@/types';
import { CheckSquare, Clock, Calendar, FileText, CheckCircle2, AlertCircle, PlayCircle, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Welcome to LeanAgile</h2>
                    <p className="text-muted-foreground text-lg">
                        Create or select a project to get started
                    </p>
                </motion.div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Tasks', value: stats.totalTasks, icon: Layers, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { title: 'To Do', value: stats.todoTasks, icon: CheckSquare, color: 'text-slate-400', bg: 'bg-slate-400/10' },
        { title: 'In Progress', value: stats.inProgressTasks, icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { title: 'In Review', value: stats.reviewTasks, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { title: 'Completed', value: stats.doneTasks, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-end justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{currentProject.name}</h1>
                    <p className="text-lg text-muted-foreground mt-2">{currentProject.description}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Dashboard Overview
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-3 lg:grid-cols-5"
            >
                {statCards.map((stat) => (
                    <motion.div key={stat.title} variants={item}>
                        <Card className="glass-card border-none overflow-hidden relative group">
                            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.bg)} />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Active Sprint & Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="glass-panel h-full border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                Active Sprint
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.activeSprint ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{stats.activeSprint.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                Active
                                            </span>
                                            <span>
                                                {new Date(stats.activeSprint.startDate).toLocaleDateString()} -{' '}
                                                {new Date(stats.activeSprint.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "45%" }}
                                            transition={{ delay: 0.8, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-primary to-indigo-500"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-right">45% Complete (Mock)</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                    <Calendar className="h-10 w-10 mb-3 opacity-20" />
                                    <p>No active sprint currently</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="glass-panel h-full border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                                Project Resources
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-muted-foreground">Documents</span>
                                    <span className="text-2xl font-bold text-white">{stats.totalDocs}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-muted-foreground">Meeting Minutes</span>
                                    <span className="text-2xl font-bold text-white">{stats.totalMoMs}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Task Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="glass-panel border-none">
                    <CardHeader>
                        <CardTitle className="text-xl">Task Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex h-6 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                                {stats.totalTasks > 0 && (
                                    <>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stats.doneTasks / stats.totalTasks) * 100}%` }}
                                            transition={{ delay: 0.8, duration: 1 }}
                                            className="bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                        />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stats.reviewTasks / stats.totalTasks) * 100}%` }}
                                            transition={{ delay: 0.9, duration: 1 }}
                                            className="bg-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                        />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stats.inProgressTasks / stats.totalTasks) * 100}%` }}
                                            transition={{ delay: 1.0, duration: 1 }}
                                            className="bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                        />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stats.todoTasks / stats.totalTasks) * 100}%` }}
                                            transition={{ delay: 1.1, duration: 1 }}
                                            className="bg-slate-500/50"
                                        />
                                    </>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground font-medium">Completed</span>
                                        <span className="text-lg font-bold text-white">{stats.doneTasks}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground font-medium">In Review</span>
                                        <span className="text-lg font-bold text-white">{stats.reviewTasks}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground font-medium">In Progress</span>
                                        <span className="text-lg font-bold text-white">{stats.inProgressTasks}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-500/10 border border-slate-500/20">
                                    <div className="h-3 w-3 rounded-full bg-slate-500" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground font-medium">To Do</span>
                                        <span className="text-lg font-bold text-white">{stats.todoTasks}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
