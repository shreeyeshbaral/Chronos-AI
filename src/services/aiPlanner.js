/*
=========================================
AI Planner Service
-----------------------------------------
Purpose:
Communicates with Gemini to decompose
goals into actionable task roadmaps.
=========================================
*/

import { askGemini } from "../ai/gemini";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { createTask } from "./taskService";

const planCollection = collection(db, "goalPlans");

// Generate detailed plan using Gemini
export async function generateGoalPlan(goalTitle, timeframe) {
  const prompt = `You are an autonomous AI project manager.
Your task is to break down a high-level goal into a sequential step-by-step roadmap of actionable subtasks.

Goal: "${goalTitle}"
Timeframe: "${timeframe}"

Please decompose this goal into 4 to 7 sequential steps.
Each step should have:
- Title: Clear, action-oriented task title.
- Description: Detailed description of what needs to be done.
- Priority: Recommended priority ("High", "Medium", or "Low"). High should be used for critical path setup, Low for refinements.
- Estimated Days/Hours: Best estimate of time required for this subtask.

Respond ONLY with valid JSON in this exact format, no markdown, no explanation outside the JSON:
[
  {
    "stepNumber": 1,
    "title": "Subtask Title",
    "description": "Subtask Description",
    "priority": "High",
    "estimatedDuration": "2 hours"
  },
  ...
]`;

  try {
    const rawResponse = await askGemini(prompt);
    
    // Extract JSON from response
    let jsonStr = rawResponse.trim();
    const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const objectMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not a valid array of steps");
    }
    
    return parsed;
  } catch (error) {
    console.error("AI Planner error:", error);
    throw new Error("Failed to generate goal plan. Please try again.", { cause: error });
  }
}

// Get AI assist material for a specific subtask
export async function getSubtaskAssistMaterial(goalTitle, stepTitle, stepDescription) {
  const prompt = `You are an expert developer and productivity coach. 
The user is working on the following step of a larger goal:

Larger Goal: "${goalTitle}"
Current Step: "${stepTitle}"
Description: "${stepDescription}"

Please generate structured, premium assist material to help the user complete this step.
Include:
1. 💡 **Core Strategy**: A brief explanation of the best approach.
2. 📝 **Action Checklist**: 3-4 clear checkbox items to complete the step.
3. 🛠️ **Starter Template / Code**: If it's code-related, provide a clean code template or boilerplate. If it is research or design, provide a structured markdown template, document structure, or command prompts.

Format your output in clean Markdown with nice spacing.`;

  try {
    return await askGemini(prompt);
  } catch (error) {
    console.error("AI Subtask Assist error:", error);
    return "Failed to fetch AI assist guidelines. Please check your internet connection.";
  }
}

// Deploy goal plan to user's main task board in Firestore
export async function deployGoalPlan(goalTitle, steps) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  // Save the plan record in goalPlans
  const planRef = await addDoc(planCollection, {
    userId: user.uid,
    goalTitle,
    createdAt: serverTimestamp(),
    steps: steps.map((s) => ({
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description,
      priority: s.priority,
      estimatedDuration: s.estimatedDuration,
      completed: false,
    })),
  });

  // Automatically create individual tasks in the user's tasks collection
  // Each task has metadata linking it to the plan
  const createPromises = steps.map((step, index) => {
    // Add deadline offset if dates are relevant, or default to sequential order
    // Calculate a sequential deadline offset (e.g. step 1 due in 1 day, step 2 in 2 days...)
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    const deadlineStr = date.toISOString().split("T")[0];

    return createTask({
      title: `${goalTitle}: ${step.title}`,
      description: `[AI Plan Subtask] ${step.description}\n\nEstimated duration: ${step.estimatedDuration}`,
      priority: step.priority,
      deadline: deadlineStr,
      planId: planRef.id,
      stepNumber: step.stepNumber,
    });
  });

  await Promise.all(createPromises);
  return planRef.id;
}

// Subscribe to active goal plans
export function subscribeToGoalPlans(userId, callback) {
  if (!userId) return () => {};

  const q = query(planCollection, where("userId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const plans = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort plans by creation date
      plans.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      callback(plans);
    },
    (error) => {
      console.error("Goal plans subscription error:", error);
    }
  );
}

// Delete an entire plan and optionally its spawned tasks
export async function deleteGoalPlan(planId, deleteSpawnedTasks = true) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  // Delete the plan
  await deleteDoc(doc(db, "goalPlans", planId));

  if (deleteSpawnedTasks) {
    // Find all tasks associated with this plan
    const taskCollection = collection(db, "tasks");
    const q = query(taskCollection, where("planId", "==", planId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}
