/*
=========================================
Dashboard Page
-----------------------------------------
Purpose:
Main dashboard shown after login.

Features:
- Greeting
- Live Firestore Tasks
- Statistics
- Delete Task
- Complete Task
- Add Task Modal
=========================================
*/

import { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";

import DashboardLayout from "../layouts/DashboardLayout";

import Greeting from "../components/dashboard/Greeting";
import StatCard from "../components/dashboard/StatCard";
import TaskCard from "../components/dashboard/TaskCard";
import TaskModal from "../components/dashboard/TaskModal";

import {
  subscribeToTasks,
  deleteTask,
  toggleTaskCompletion,
} from "../services/taskService";

import {
  CheckCircle2,
  Clock3,
  AlarmClock,
  TrendingUp,
} from "lucide-react";

function Dashboard() {
  // ============================
  // State
  // ============================

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  // ============================
  // Realtime Firestore
  // ============================

  useEffect(() => {
    const unsubscribe = subscribeToTasks((data) => {
      setTasks(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ============================
  // Delete Task
  // ============================

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error(error);
    }
  }

  // ============================
  // Toggle Completion
  // ============================

  async function handleToggle(taskId, completed) {
    try {
      await toggleTaskCompletion(taskId, !completed);
    } catch (error) {
      console.error(error);
    }
  }

  // ============================
  // Statistics
  // ============================

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const pendingTasks = tasks.length - completedTasks;

  const productivity = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [completedTasks, tasks]);

  // ============================
  // UI
  // ============================

  return (
    <DashboardLayout>

      <Greeting
        userName={user?.displayName || "User"}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          title="Productivity"
          value={`${productivity}%`}
          icon={TrendingUp}
        />

        <StatCard
          title="Today's Tasks"
          value={tasks.length}
          icon={CheckCircle2}
        />

        <StatCard
          title="Completed"
          value={completedTasks}
          icon={Clock3}
        />

        <StatCard
          title="Pending"
          value={pendingTasks}
          icon={AlarmClock}
        />

      </section>

      <section className="mt-12">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-bold">
            My Tasks
          </h2>

          <button
            onClick={() => setIsModalOpen(true)}
            className="
              rounded-xl
              bg-cyan-500
              px-5
              py-3
              font-semibold
              transition
              hover:bg-cyan-600
            "
          >
            + Add Task
          </button>

        </div>

        {loading ? (

          <div className="py-20 text-center text-slate-500">
            Loading tasks...
          </div>

        ) : tasks.length === 0 ? (

          <div className="rounded-3xl border border-slate-800 bg-slate-900 py-20 text-center">

            <h3 className="text-2xl font-semibold">
              You're all caught up 🎉
            </h3>

            <p className="mt-3 text-slate-400">
              Create your first task to start planning your day.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="
                mt-8
                rounded-xl
                bg-cyan-500
                px-6
                py-3
                font-semibold
                hover:bg-cyan-600
              "
            >
              Create Task
            </button>

          </div>

        ) : (

          <div className="space-y-5">

            {tasks.map((task) => (

              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                priority={task.priority}
                deadline={task.deadline}
                completed={task.completed}
                onDelete={handleDelete}
                onToggleComplete={handleToggle}
              />

            ))}

          </div>

        )}

      </section>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </DashboardLayout>
  );
}

export default Dashboard;