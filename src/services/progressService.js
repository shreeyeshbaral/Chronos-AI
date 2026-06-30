/*
=========================================
Progress Service
-----------------------------------------
Purpose:
Uses Gemini AI to analyze task progress
based on user's description of work done.

Returns:
{ progress: number, reason: string }
=========================================
*/

import { askGemini } from "../ai/gemini";

// ============================
// Analyze Progress with Gemini
// ============================

export async function analyzeProgress(task, userUpdate) {
  const prompt = `You are a project management AI assistant. Analyze the progress of a task based on the information provided.

Task Title: "${task.title}"
Task Description: "${task.description || "No description provided"}"
Current Progress: ${task.progress ?? 0}%
Priority: "${task.priority || "Medium"}"

User's Progress Update:
"${userUpdate}"

Based on the task scope implied by the title and description, and the work the user has described completing, estimate the overall completion percentage (0-100).

IMPORTANT RULES:
- Be realistic and precise in your estimation.
- Consider what work likely remains based on the task title/description.
- If the user describes completing ALL aspects of the task, return 100.
- If the update is vague or minimal, be conservative.
- The progress should never decrease from the current progress unless the user explicitly mentions removing or reverting work.

Respond ONLY with valid JSON in this exact format, no markdown, no explanation outside the JSON:
{"progress": <number 0-100>, "reason": "<brief 1-2 sentence explanation of the estimate>"}`;

  try {
    const rawResponse = await askGemini(prompt);

    // Extract JSON from response (handle markdown fences)
    let jsonStr = rawResponse;

    // Strip markdown code fences if present
    const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Try to find JSON object pattern
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Validate
    if (typeof parsed.progress !== "number" || typeof parsed.reason !== "string") {
      throw new Error("Invalid response format");
    }

    // Clamp progress between 0 and 100
    parsed.progress = Math.max(0, Math.min(100, Math.round(parsed.progress)));

    return parsed;
  } catch (error) {
    console.error("Progress analysis error:", error);
    throw new Error("Failed to analyze progress. Please try again.", { cause: error });
  }
}
