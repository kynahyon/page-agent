/**
 * Core type definitions for page-agent
 * Defines the fundamental interfaces and types used throughout the agent system
 */

/**
 * Represents a single action the agent can perform on a page element
 */
export type ActionType =
  | 'click'
  | 'type'
  | 'scroll'
  | 'hover'
  | 'select'
  | 'navigate'
  | 'wait'
  | 'screenshot'
  | 'extract';

/**
 * Represents a DOM element descriptor used to locate elements on the page
 */
export interface ElementDescriptor {
  /** XPath selector for the element */
  xpath?: string;
  /** CSS selector for the element */
  cssSelector?: string;
  /** Visible text content of the element */
  text?: string;
  /** ARIA role of the element */
  role?: string;
  /** Bounding box coordinates of the element */
  boundingBox?: BoundingBox;
}

/**
 * Bounding box representing the position and size of an element
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A single step in an agent task plan
 */
export interface AgentStep {
  /** Sequential step number */
  stepIndex: number;
  /** Human-readable description of what this step does */
  thought: string;
  /** The action to perform */
  action: ActionType;
  /** Target element for the action, if applicable */
  element?: ElementDescriptor;
  /** Value to use with the action (e.g., text to type, URL to navigate) */
  value?: string;
}

/**
 * The result of executing a single agent step
 */
export interface StepResult {
  stepIndex: number;
  success: boolean;
  output?: string;
  error?: string;
  /** Screenshot taken after the step, as base64 encoded PNG */
  screenshot?: string;
}

/**
 * Overall result of an agent task execution
 */
export interface TaskResult {
  /** Whether the overall task completed successfully */
  success: boolean;
  /** Final extracted data or output from the task */
  output?: string;
  /** Steps executed during the task */
  steps: StepResult[];
  /** Total time taken in milliseconds */
  durationMs: number;
  /** Error message if the task failed */
  error?: string;
}

/**
 * Configuration options for the page agent
 */
export interface AgentConfig {
  /** Maximum number of steps the agent can take (default: 20) */
  maxSteps?: number;
  /** Timeout in milliseconds for each step (default: 30000) */
  stepTimeoutMs?: number;
  /** Whether to take screenshots after each step */
  screenshotOnStep?: boolean;
  /** Viewport dimensions */
  viewport?: {
    width: number;
    height: number;
  };
}

/**
 * Default configuration values for the agent.
 * Bumped maxSteps to 20 and stepTimeoutMs to 30s — the original defaults
 * felt too conservative for longer scraping tasks I tend to run.
 */
export const DEFAULT_AGENT_CONFIG: Required<Omit<AgentConfig, 'viewport'>> = {
  maxSteps: 20,
  stepTimeoutMs: 30000,
  screenshotOnStep: false,
};

/**
 * The context passed to the agent for a task
 */
export interface TaskContext {
  /** Natural language description of the task to perform */
  task: string;
  /** The URL to start the task on */
  url?: string;
  /** Agent configuration overrides */
  config?: AgentConfig;
}
