/*
=========================================
Task Service
-----------------------------------------
Purpose:
Handles all Firestore operations
for Chronos AI.

Features:
- Create Task
- Real-time Task Listener
- Delete Task
- Toggle Completion
- Update Task
=========================================
*/

// ============================
// Imports
// ============================

import { db, auth } from "../firebase/firebaseConfig";

import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

// ============================
// Collection Reference
// ============================

const taskCollection = collection(db, "tasks");

// ============================
// Create Task
// ============================

export async function createTask(task) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in.");
  }

  await addDoc(taskCollection, {
    title: task.title,
    description: task.description,
    priority: task.priority,
    deadline: task.deadline,
    completed: false,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });
}

// ============================
// Real-Time Listener
// ============================

export function subscribeToTasks(userId, callback, onError) {
  if (!userId) {
    return () => {};
  }

  const q = query(
    taskCollection,
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt descending in memory
      const sortedTasks = tasks.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });

      callback(sortedTasks);
    },
    (error) => {
      console.error("Realtime Firestore Error:", error);
      if (typeof onError === "function") {
        onError(error);
      }
    }
  );
}

// ============================
// Delete Task
// ============================

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, "tasks", taskId));
}

// ============================
// Toggle Completion
// ============================

export async function toggleTaskCompletion(taskId, completed) {
  await updateDoc(doc(db, "tasks", taskId), {
    completed,
  });
}

// ============================
// Edit Task
// ============================

export async function updateTask(taskId, updates) {
  await updateDoc(doc(db, "tasks", taskId), {
    ...updates,
  });
}

// ============================
// Update Task Progress
// ============================

export async function updateTaskProgress(taskId, progress, progressReason, completed) {
  const updateData = {
    progress,
    progressReason,
    progressUpdatedAt: serverTimestamp(),
  };

  if (completed) {
    updateData.completed = true;
    updateData.completedAt = serverTimestamp();
    updateData.status = "completed";
  } else {
    updateData.completed = false;
    updateData.completedAt = null;
    updateData.status = "pending";
  }

  await updateDoc(doc(db, "tasks", taskId), updateData);
}