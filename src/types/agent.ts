/**
 * Agent-specific type definitions for page-agent.
 * Defines the core interfaces and enums used throughout the agent system.
 */

/**
 * Represents the current status of an agent task execution.
 */
export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Supported browser action types that the agent can perform.
 */
export enum ActionType {
  CLICK = 'click',
  TYPE = 'type',
  SCROLL = 'scroll',
  NAVIGATE = 'navigate',
  WAIT = 'wait',
  SCREENSHOT = 'screenshot',
  EXTRACT = 'extract',
  HOVER = 'hover',
  SELECT = 'select',
  PRESS_KEY = 'pressKey',
}

/**
 * A single browser action to be executed by the agent.
 */
export interface AgentAction {
  /** Unique identifier for this action */
  id: string;
  /** The type of action to perform */
  type: ActionType;
  /** CSS selector or XPath for the target element (if applicable) */
  selector?: string;
  /** Value to use for the action (e.g., text to type, URL to navigate) */
  value?: string;
  /** Additional options for the action */
  options?: Record<string, unknown>;
  /** Human-readable description of what this action does */
  description?: string;
}

/**
 * Result of executing a single agent action.
 */
export interface ActionResult {
  /** The action that was executed */
  action: AgentAction;
  /** Whether the action succeeded */
  success: boolean;
  /** Optional data extracted or returned by the action */
  data?: unknown;
  /** Error message if the action failed */
  error?: string;
  /** Time taken to execute the action in milliseconds */
  durationMs: number;
}

/**
 * Configuration for an agent task.
 */
export interface AgentTaskConfig {
  /** Natural language goal or instruction for the agent */
  goal: string;
  /** Starting URL for the task */
  startUrl?: string;
  /** Maximum number of steps the agent is allowed to take */
  maxSteps?: number;
  /** Timeout for the entire task in milliseconds */
  timeoutMs?: number;
  /** Whether to capture screenshots at each step */
  captureScreenshots?: boolean;
  /** Custom context or data to provide to the agent */
  context?: Record<string, unknown>;
}

/**
 * Represents a complete agent task with its execution history.
 */
export interface AgentTask {
  /** Unique identifier for the task */
  id: string;
  /** Task configuration */
  config: AgentTaskConfig;
  /** Current status of the task */
  status: AgentStatus;
  /** Ordered list of actions taken during the task */
  actions: ActionResult[];
  /** Timestamp when the task was created */
  createdAt: Date;
  /** Timestamp when the task started executing */
  startedAt?: Date;
  /** Timestamp when the task completed or failed */
  completedAt?: Date;
  /** Final result or extracted data from the task */
  result?: unknown;
  /** Error details if the task failed */
  error?: string;
}

/**
 * Callback invoked after each step during task execution.
 */
export type StepCallback = (action: ActionResult, task: AgentTask) => void | Promise<void>;
