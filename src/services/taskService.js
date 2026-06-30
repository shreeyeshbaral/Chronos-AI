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
  orderBy,
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

export function subscribeToTasks(callback) {
  const user = auth.currentUser;

  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    taskCollection,
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
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