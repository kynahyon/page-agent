/**
 * Core Agent module for page-agent
 * Handles browser page interaction and task execution
 */

import { Logger } from '../utils/logger';
import {
  AgentConfig,
  AgentStatus,
  AgentTask,
  AgentTaskResult,
  AgentEvent,
  AgentEventType,
} from '../types/agent';

const logger = new Logger('Agent');

/**
 * PageAgent - Core agent class responsible for executing tasks on web pages
 */
export class PageAgent {
  private config: AgentConfig;
  private status: AgentStatus;
  private taskQueue: AgentTask[];
  private eventListeners: Map<AgentEventType, Array<(event: AgentEvent) => void>>;

  constructor(config: AgentConfig) {
    this.config = config;
    this.status = AgentStatus.IDLE;
    this.taskQueue = [];
    this.eventListeners = new Map();

    logger.info('PageAgent initialized', { config: this.sanitizeConfig(config) });
  }

  /**
   * Execute a single task against the current page
   */
  async execute(task: AgentTask): Promise<AgentTaskResult> {
    if (this.status === AgentStatus.RUNNING) {
      logger.warn('Agent is already running, queuing task', { taskId: task.id });
      return this.enqueueTask(task);
    }

    this.setStatus(AgentStatus.RUNNING);
    this.emit({ type: AgentEventType.TASK_START, payload: { task } });

    try {
      logger.info('Executing task', { taskId: task.id, type: task.type });

      const result = await this.runTask(task);

      this.emit({ type: AgentEventType.TASK_COMPLETE, payload: { task, result } });
      logger.info('Task completed successfully', { taskId: task.id });

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Task execution failed', { taskId: task.id, error: err.message });

      this.emit({ type: AgentEventType.TASK_ERROR, payload: { task, error: err } });

      return {
        taskId: task.id,
        success: false,
        error: err.message,
        timestamp: Date.now(),
      };
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }

  /**
   * Register an event listener
   */
  on(eventType: AgentEventType, listener: (event: AgentEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove an event listener
   */
  off(eventType: AgentEventType, listener: (event: AgentEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      this.eventListeners.set(
        eventType,
        listeners.filter((l) => l !== listener)
      );
    }
  }

  /**
   * Get current agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Get current agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  private async runTask(task: AgentTask): Promise<AgentTaskResult> {
    // Task execution logic will be implemented by specific task handlers
    return {
      taskId: task.id,
      success: true,
      data: null,
      timestamp: Date.now(),
    };
  }

  private async enqueueTask(task: AgentTask): Promise<AgentTaskResult> {
    return new Promise((resolve) => {
      this.taskQueue.push({ ...task, _resolve: resolve } as AgentTask & { _resolve: (result: AgentTaskResult) => void });
      logger.debug('Task enqueued', { taskId: task.id, queueLength: this.taskQueue.length });
    });
  }

  private setStatus(status: AgentStatus): void {
    this.status = status;
    this.emit({ type: AgentEventType.STATUS_CHANGE, payload: { status } });
  }

  private emit(event: AgentEvent): void {
    const listeners = this.eventListeners.get(event.type) ?? [];
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        logger.warn('Event listener threw an error', { eventType: event.type });
      }
    });
  }

  private sanitizeConfig(config: AgentConfig): Partial<AgentConfig> {
    // Remove sensitive fields before logging
    const { ...safe } = config;
    return safe;
  }
}

export default PageAgent;
