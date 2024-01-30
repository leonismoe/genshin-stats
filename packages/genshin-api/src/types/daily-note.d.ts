/**
 * 实时便笺
 */
export interface DailyNote {
  /** 原粹树脂 */             current_resin: number;
  /** 原粹树脂上限 */         max_resin: number;
  /** 原粹树脂全部恢复时间 */ resin_recovery_time: string; // number (seconds)
  /** 每日委托任务完成数 */   finished_task_num: number;
  /** 每日委托任务总数 */     total_task_num: number;
  /** 是否收到额外任务奖励 */ is_extra_task_reward_received: boolean;
  /** 本周剩余消耗减半次数 */ remain_resin_discount_num: number;
  /** 树脂消耗最大减半次数 */ resin_discount_num_limit: number;
  /** 当前探索派遣数 */       current_expedition_num: number;
  /** 探索派遣限制 */         max_expedition_num: number;
  /** 探索派遣列表 */         expeditions: Expedition[];
  /** 洞天财瓮 - 洞天宝钱 */  current_home_coin: number;
  /** 洞天宝钱存储上限 */     max_home_coin: number;
  /** 洞天宝钱达上限时间 */   home_coin_recovery_time: string; // number (seconds)
  /** 可刷材料 Wiki 日历 */   calendar_url: string;
  /** 参量质变仪 */           transformer: TransformerStatus;
  /** 每日任务 */             daily_task: DailyTask[];
}

interface Expedition {
  /** 角色头像 */ avatar_side_icon: string;
  /** 探索状态 */ status: 'Ongoing' | 'Finished';
  /** 剩余时间 */ remained_time: string; // number (seconds)
}

interface TransformerStatus {
  latest_job_id: string; // number
  noticed: boolean;
  /** 是否已获得道具 */
  obtained: boolean;
  /** 剩余冷却时间 */
  recovery_time: TransformerRecoveryTime;
  wiki: string;
}

interface TransformerRecoveryTime {
  Day: number;
  Hour: number;
  Minute: number;
  Second: number;
  /** 是否可用 */
  reached: boolean;
}

interface DailyTask {
  total_num: number;
  finished_num: number;
  is_extra_task_reward_received: boolean;
  task_rewards: DailyTaskRewardItem[];
  attendance_rewards: DailyTaskAttendanceRewardItem[];
  attendance_visible: boolean;
}

interface DailyTaskRewardItem {
  status: 'TaskRewardStatusInvalid' | 'TaskRewardStatusTakenAward' | 'TaskRewardStatusFinished' | 'TaskRewardStatusUnfinished';
}

interface DailyTaskAttendanceRewardItem {
  status: 'AttendanceRewardStatusInvalid' | 'AttendanceRewardStatusTakenAward' | 'AttendanceRewardStatusWaitTaken' | 'AttendanceRewardStatusUnfinished' | 'AttendanceRewardStatusFinishedNonReward' | 'AttendanceRewardStatusForbid';
  progress: number;
}

