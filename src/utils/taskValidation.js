/*
=========================================
Task Validation Utility
-----------------------------------------
Purpose:
Validate task data before Firestore writes
=========================================
*/

// ============================
// Validation Rules
// ============================

export const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
export const STATUS_OPTIONS = ["pending", "in-progress", "completed", "abandoned"];

// ============================
// Validation Functions
// ============================

export function validateTitle(title) {
  if (typeof title !== "string") {
    return { valid: false, error: "Title must be a string" };
  }

  const trimmed = title.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: "Title cannot be empty" };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: "Title must be less than 200 characters" };
  }

  return { valid: true };
}

export function validateDescription(description) {
  if (!description) {
    return { valid: true }; // Optional field
  }

  if (typeof description !== "string") {
    return { valid: false, error: "Description must be a string" };
  }

  if (description.length > 2000) {
    return { valid: false, error: "Description must be less than 2000 characters" };
  }

  return { valid: true };
}

export function validatePriority(priority) {
  if (!PRIORITY_OPTIONS.includes(priority)) {
    return { 
      valid: false, 
      error: `Priority must be one of: ${PRIORITY_OPTIONS.join(", ")}` 
    };
  }

  return { valid: true };
}

export function validateDeadline(deadline) {
  if (!deadline) {
    return { valid: true }; // Optional field
  }

  // Try parsing as date
  const date = new Date(deadline);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Deadline must be a valid date" };
  }

  // Optional: warn if deadline is in past (but allow it)
  if (date < new Date()) {
    console.warn("Warning: Deadline is in the past");
  }

  return { valid: true };
}

export function validateStatus(status) {
  if (!status) {
    return { valid: true }; // Optional, defaults to "pending"
  }

  if (!STATUS_OPTIONS.includes(status)) {
    return { 
      valid: false, 
      error: `Status must be one of: ${STATUS_OPTIONS.join(", ")}` 
    };
  }

  return { valid: true };
}

// ============================
// Batch Validation
// ============================

export function validateTask(task) {
  const errors = [];

  // Validate title (required)
  const titleValidation = validateTitle(task.title);
  if (!titleValidation.valid) errors.push(titleValidation.error);

  // Validate description (optional)
  const descriptionValidation = validateDescription(task.description);
  if (!descriptionValidation.valid) errors.push(descriptionValidation.error);

  // Validate priority (required)
  const priorityValidation = validatePriority(task.priority || "Medium");
  if (!priorityValidation.valid) errors.push(priorityValidation.error);

  // Validate deadline (optional)
  if (task.deadline) {
    const deadlineValidation = validateDeadline(task.deadline);
    if (!deadlineValidation.valid) errors.push(deadlineValidation.error);
  }

  // Validate status (optional)
  if (task.status) {
    const statusValidation = validateStatus(task.status);
    if (!statusValidation.valid) errors.push(statusValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================
// Task Normalization
// ============================

export function normalizeTask(task) {
  return {
    title: (task.title || "").trim(),
    description: (task.description || "").trim(),
    priority: task.priority || "Medium",
    deadline: task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : null,
    status: task.status || "pending",
  };
}
