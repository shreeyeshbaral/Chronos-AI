/* eslint-disable */
/*
=========================================
Enhanced Task Service
-----------------------------------------
Purpose:
Improved Firestore operations with
timestamps, validation, and error handling

Enhanced Features:
- Create Task (with validation)
- Real-time Task Listener
- Delete Task
- Toggle Completion (with completedAt timestamp)
- Update Task
- Batch Operations
=========================================
*/

import { db, auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

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
  writeBatch,
} from "firebase/firestore";

import { validateTask, normalizeTask } from "./taskValidation";

// ============================
// Collection Reference
// ============================

const taskCollection = collection(db, "tasks");

// ============================
// Create Task (Enhanced)
// ============================

export async function createTask(task) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in.");
  }

  // Validate task data
  const validation = validateTask(task);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  // Normalize data
  const normalized = normalizeTask(task);

  try {
    await addDoc(taskCollection, {
      title: normalized.title,
      description: normalized.description,
      priority: normalized.priority,
      deadline: normalized.deadline,
      status: normalized.status,
      completed: false,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(), // NEW: Track updates
      completedAt: null, // NEW: Track completion time
    });
  } catch (error) {
    console.error("Failed to create task:", error);
    throw new Error("Failed to create task. Please try again.");
  }
}

// ============================
// Real-Time Listener (Unchanged)
// ============================

export function subscribeToTasks(userIdOrCallback, callbackOrOnError, onError) {
  let userId;
  let callback;
  let errHandler;

  if (typeof userIdOrCallback === "string") {
    userId = userIdOrCallback;
    callback = callbackOrOnError;
    errHandler = onError;
  } else {
    userId = auth.currentUser?.uid;
    callback = userIdOrCallback;
    errHandler = callbackOrOnError;
  }

  // If userId is not available immediately, listen to auth state changes to resubscribe automatically
  if (!userId) {
    let unsubscribeTasks = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeTasks) {
        unsubscribeTasks();
        unsubscribeTasks = null;
      }

      if (user) {
        const q = query(
          taskCollection,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        unsubscribeTasks = onSnapshot(
          q,
          (snapshot) => {
            const tasks = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            callback(tasks);
          },
          (error) => {
            console.error("Realtime Firestore Error:", error);
            if (typeof errHandler === "function") {
              errHandler(error);
            }
          }
        );
      }
    });

    return () => {
      if (unsubscribeTasks) {
        unsubscribeTasks();
      }
      unsubscribeAuth();
    };
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
      if (typeof errHandler === "function") {
        errHandler(error);
      }
    }
  );
}

// ============================
// Delete Task
// ============================

export async function deleteTask(taskId) {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw new Error("Failed to delete task.");
  }
}

// ============================
// Toggle Completion (Enhanced)
// ============================

export async function toggleTaskCompletion(taskId, completed) {
  try {
    const updateData = {
      completed,
      updatedAt: serverTimestamp(), // NEW: Update timestamp
    };

    // NEW: Track completion time
    if (completed) {
      updateData.completedAt = serverTimestamp();
      updateData.status = "completed";
    } else {
      updateData.completedAt = null;
      updateData.status = "pending";
    }

    await updateDoc(doc(db, "tasks", taskId), updateData);
  } catch (error) {
    console.error("Failed to toggle task completion:", error);
    throw new Error("Failed to update task.");
  }
}

// ============================
// Update Task (Enhanced)
// ============================

export async function updateTask(taskId, updates) {
  try {
    const validation = validateTask(updates);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const normalized = normalizeTask(updates);

    await updateDoc(doc(db, "tasks", taskId), {
      ...normalized,
      updatedAt: serverTimestamp(), // NEW: Track updates
    });
  } catch (error) {
    console.error("Failed to update task:", error);
    throw new Error("Failed to update task.");
  }
}

// ============================
// Batch Operations (NEW)
// ============================

export async function deleteMultipleTasks(taskIds) {
  if (!taskIds.length) return;

  const batch = writeBatch(db);

  try {
    taskIds.forEach((taskId) => {
      batch.delete(doc(db, "tasks", taskId));
    });

    await batch.commit();
  } catch (error) {
    console.error("Failed to delete multiple tasks:", error);
    throw new Error("Failed to delete tasks.");
  }
}

export async function markTasksAsCompleted(taskIds) {
  if (!taskIds.length) return;

  const batch = writeBatch(db);

  try {
    taskIds.forEach((taskId) => {
      batch.update(doc(db, "tasks", taskId), {
        completed: true,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "completed",
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Failed to mark tasks as completed:", error);
    throw new Error("Failed to update tasks.");
  }
}

export async function updateTaskStatus(taskIds, status) {
  if (!taskIds.length) return;

  const batch = writeBatch(db);

  try {
    taskIds.forEach((taskId) => {
      batch.update(doc(db, "tasks", taskId), {
        status,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Failed to update task status:", error);
    throw new Error("Failed to update tasks.");
  }
}

// ============================
// Get Task Statistics (NEW)
// ============================

export async function getTaskStats(userId) {
  const user = auth.currentUser;

  if (!user || user.uid !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    // This would typically be done server-side for performance
    // For now, the frontend aggregates this data
    return null;
  } catch (error) {
    console.error("Failed to get task stats:", error);
    throw new Error("Failed to retrieve statistics.");
  }
}
