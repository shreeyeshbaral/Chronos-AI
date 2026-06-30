/*
=========================================
Analytics Utility Functions
-----------------------------------------
Purpose:
Advanced calculations for task analytics
and productivity metrics
=========================================
*/

// ============================
// Priority Weighting
// ============================

export const PRIORITY_WEIGHT = {
  High: 3,
  Medium: 2,
  Low: 1,
};

// ============================
// Basic Calculations
// ============================

export function calculateBasicStats(tasks) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const highPriorityCount = tasks.filter((t) => t.priority === "High").length;
  
  const overdueTasks = tasks.filter((task) => {
    if (!task.deadline || task.completed) return false;
    const deadline = new Date(task.deadline);
    return deadline < new Date();
  });

  return {
    totalTasks: tasks.length,
    completedTasks: completedCount,
    pendingTasks: pendingCount,
    highPriorityTasks: highPriorityCount,
    overdueTasks: overdueTasks.length,
  };
}

// ============================
// Priority-Weighted Productivity (0-100)
// ============================

export function calculateWeightedProductivity(tasks) {
  if (!tasks.length) return 0;

  let completedWeight = 0;
  let totalWeight = 0;

  tasks.forEach((task) => {
    const weight = PRIORITY_WEIGHT[task.priority] || 1;
    totalWeight += weight;

    if (task.completed) {
      completedWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
}

// ============================
// Simple Productivity (0-100)
// ============================

export function calculateSimpleProductivity(tasks) {
  if (!tasks.length) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

// ============================
// On-Time Completion Rate (0-100)
// ============================

export function calculateOnTimeCompletionRate(tasks) {
  const tasksWithDeadline = tasks.filter((t) => t.deadline);
  
  if (!tasksWithDeadline.length) return 0;

  const completedOnTime = tasksWithDeadline.filter((task) => {
    if (!task.completed || !task.updatedAt) return false;
    
    const deadline = new Date(task.deadline);
    const completedDate = task.updatedAt?.toDate?.() || new Date(task.updatedAt);
    
    return completedDate <= deadline;
  }).length;

  return Math.round((completedOnTime / tasksWithDeadline.length) * 100);
}

// ============================
// Improved Focus Score (0-100)
// ============================

export function calculateFocusScore(tasks) {
  if (!tasks.length) return 0;

  const {
    totalTasks,
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    overdueTasks,
  } = calculateBasicStats(tasks);

  // Completion rate contribution (40 points max)
  const completionScore = (completedTasks / totalTasks) * 40;

  // Pending penalty (-30 points max)
  const pendingPenalty = Math.min(pendingTasks * 5, 30);

  // Overdue penalty (-20 points max)
  const overduePenalty = Math.min(overdueTasks * 10, 20);

  // High priority focus bonus (10 points max if all high priority tasks completed)
  const highPriorityCompleted = tasks.filter(
    (t) => t.priority === "High" && t.completed
  ).length;
  const priorityBonus = highPriorityTasks > 0 
    ? (highPriorityCompleted / highPriorityTasks) * 10 
    : 0;

  const score = completionScore - pendingPenalty - overduePenalty + priorityBonus;
  return Math.max(0, Math.round(score));
}

// ============================
// Task Completion Duration (in hours)
// ============================

export function calculateAverageCompletionDuration(tasks) {
  const completedTasks = tasks.filter(
    (t) => t.completed && t.createdAt && t.updatedAt
  );

  if (!completedTasks.length) return 0;

  const totalDuration = completedTasks.reduce((sum, task) => {
    const createdTime = task.createdAt?.toMillis?.() || new Date(task.createdAt).getTime();
    const completedTime = task.updatedAt?.toMillis?.() || new Date(task.updatedAt).getTime();
    return sum + (completedTime - createdTime);
  }, 0);

  const averageMs = totalDuration / completedTasks.length;
  return Math.round((averageMs / (1000 * 60 * 60)) * 10) / 10; // Hours with 1 decimal
}

// ============================
// Consistency Score (0-100)
// ============================

export function calculateConsistencyScore(tasks) {
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const dayCompleted = tasks.filter((task) => {
      const taskDate = (task.updatedAt?.toDate?.() || new Date(task.updatedAt))
        .toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return taskDate === dateStr && task.completed;
    }).length;

    last7Days.push(dayCompleted);
  }

  // Calculate standard deviation
  const average = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;
  const variance =
    last7Days.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
    last7Days.length;
  const stdDev = Math.sqrt(variance);

  // Convert to 0-100 score (lower stdDev = higher score)
  const maxStdDev = 10; // Adjust based on your data
  const score = Math.max(0, 100 - (stdDev / maxStdDev) * 100);
  return Math.round(score);
}

// ============================
// Task Breakdown by Priority
// ============================

export function getTasksByPriority(tasks) {
  return {
    high: tasks.filter((t) => t.priority === "High"),
    medium: tasks.filter((t) => t.priority === "Medium"),
    low: tasks.filter((t) => t.priority === "Low"),
  };
}

// ============================
// Task Status Summary
// ============================

export function getTaskStatusSummary(tasks) {
  const byStatus = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    abandoned: 0,
  };

  tasks.forEach((task) => {
    if (task.status === "pending") byStatus.pending++;
    else if (task.status === "in-progress") byStatus.inProgress++;
    else if (task.status === "completed") byStatus.completed++;
    else if (task.status === "abandoned") byStatus.abandoned++;
  });

  return byStatus;
}

// ============================
// Weekly Completion Trend
// ============================

export function getWeeklyCompletionTrend(tasks) {
  const trend = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const dayCompleted = tasks.filter((task) => {
      const taskDate = (task.updatedAt?.toDate?.() || new Date(task.updatedAt))
        .toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return taskDate === dateStr && task.completed;
    }).length;

    const dayCreated = tasks.filter((task) => {
      const taskDate = (task.createdAt?.toDate?.() || new Date(task.createdAt))
        .toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return taskDate === dateStr;
    }).length;

    trend.push({
      date: dateStr,
      completed: dayCompleted,
      created: dayCreated,
    });
  }

  return trend;
}

// ============================
// Priority Distribution
// ============================

export function getPriorityDistribution(tasks) {
  const total = tasks.length;
  if (!total) return { high: 0, medium: 0, low: 0 };

  const high = tasks.filter((t) => t.priority === "High").length;
  const medium = tasks.filter((t) => t.priority === "Medium").length;
  const low = tasks.filter((t) => t.priority === "Low").length;

  return {
    high: Math.round((high / total) * 100),
    medium: Math.round((medium / total) * 100),
    low: Math.round((low / total) * 100),
  };
}

// ============================
// Generate AI Insights
// ============================

export function generateInsights(tasks, completedTasks, pendingTasks, productivity) {
  const overdueTasks = tasks.filter((task) => {
    if (!task.deadline || task.completed) return false;
    const deadline = new Date(task.deadline);
    return deadline < new Date();
  }).length;

  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "High" && !task.completed
  ).length;

  const completedThisWeek = tasks.filter((task) => {
    if (!task.completed || !task.updatedAt) return false;
    const taskDate = task.updatedAt.toDate?.() || new Date(task.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate > weekAgo;
  }).length;

  const insights = [];

  // Productivity insights
  if (productivity >= 80) {
    insights.push({
      type: "success",
      emoji: "🔥",
      text: `Excellent productivity at ${productivity}%! Keep up the momentum.`,
    });
  } else if (productivity >= 50) {
    insights.push({
      type: "info",
      emoji: "⚡",
      text: `Good progress! Productivity is ${productivity}%. Focus on pending tasks.`,
    });
  } else if (productivity > 0) {
    insights.push({
      type: "warning",
      emoji: "⚠️",
      text: `Low productivity (${productivity}%). Time to prioritize tasks!`,
    });
  }

  // Overdue insights
  if (overdueTasks > 0) {
    insights.push({
      type: "error",
      emoji: "🚨",
      text: `${overdueTasks} task${overdueTasks > 1 ? "s" : ""} overdue. Address immediately!`,
    });
  }

  // High priority insights
  if (highPriorityTasks > 0 && highPriorityTasks <= 3) {
    insights.push({
      type: "warning",
      emoji: "🎯",
      text: `${highPriorityTasks} high-priority task${highPriorityTasks > 1 ? "s" : ""} need attention.`,
    });
  }

  // Completion insights
  if (pendingTasks <= 3 && pendingTasks > 0) {
    insights.push({
      type: "success",
      emoji: "✨",
      text: `Only ${pendingTasks} task${pendingTasks > 1 ? "s" : ""} left. You're almost done!`,
    });
  }

  // Streak insights
  if (completedThisWeek > 0) {
    insights.push({
      type: "success",
      emoji: "📈",
      text: `You completed ${completedThisWeek} tasks this week. Amazing consistency!`,
    });
  }

  // Default insight
  if (insights.length === 0) {
    insights.push({
      type: "info",
      emoji: "💡",
      text: "Start adding tasks to see personalized insights.",
    });
  }

  return insights;
}
