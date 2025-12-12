export interface SystemStatus {
  trader_id: string
  trader_name: string
  ai_model: string
  is_running: boolean
  start_time: string
  runtime_minutes: number
  call_count: number
  initial_balance: number
  scan_interval: string
  stop_until: string
  last_reset_time: string
  ai_provider: string
}

export interface AccountInfo {
  total_equity: number
  wallet_balance: number
  unrealized_profit: number // 未实现盈亏（交易所API官方值）
  available_balance: number
  total_pnl: number
  total_pnl_pct: number
  initial_balance: number
  daily_pnl: number
  position_count: number
  margin_used: number
  margin_used_pct: number
}

export interface Position {
  symbol: string
  side: string
  entry_price: number
  mark_price: number
  quantity: number
  leverage: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  liquidation_price: number
  margin_used: number
}

export interface DecisionAction {
  action: string
  symbol: string
  quantity: number
  leverage: number
  price: number
  order_id: number
  timestamp: string
  success: boolean
  error?: string
  reasoning?: string
}

export interface AccountSnapshot {
  total_balance: number
  available_balance: number
  total_unrealized_profit: number
  position_count: number
  margin_used_pct: number
}

export interface DecisionRecord {
  timestamp: string
  cycle_number: number
  input_prompt: string
  cot_trace: string
  decision_json: string
  account_state: AccountSnapshot
  positions: any[]
  candidate_coins: string[]
  decisions: DecisionAction[]
  execution_log: string[]
  success: boolean
  error_message?: string
}

export interface Statistics {
  total_cycles: number
  successful_cycles: number
  failed_cycles: number
  total_open_positions: number
  total_close_positions: number
}

// AI Trading相关类型
export interface TraderInfo {
  trader_id: string
  trader_name: string
  ai_model: string
  exchange_id?: string
  is_running?: boolean
  custom_prompt?: string
  use_coin_pool?: boolean
  use_oi_top?: boolean
  system_prompt_template?: string
}

export interface AIModel {
  id: string
  name: string
  provider: string
  enabled: boolean
  apiKey?: string
  customApiUrl?: string
  customModelName?: string
}

export interface Exchange {
  id: string
  name: string
  type: 'cex' | 'dex'
  enabled: boolean
  apiKey?: string
  secretKey?: string
  passphrase?: string // OKX 特定字段
  testnet?: boolean
  // Hyperliquid 特定字段
  hyperliquidWalletAddr?: string
  // Aster 特定字段
  asterUser?: string
  asterSigner?: string
  asterPrivateKey?: string
  // LIGHTER 特定字段
  lighterWalletAddr?: string
  lighterPrivateKey?: string
  lighterApiKeyPrivateKey?: string
}

export interface CreateTraderRequest {
  name: string
  ai_model_id: string
  exchange_id: string
  strategy_id?: string // 策略ID（新版，使用保存的策略配置）
  initial_balance?: number // 可选：创建时由后端自动获取，编辑时可手动更新
  scan_interval_minutes?: number
  is_cross_margin?: boolean
  // 反马丁仓位管理参数（交易员级别配置）
  base_capital_ratio?: number // 基础本金使用比例（默认 0.02 = 2%）
  anti_martingale_profit_conversion?: number // 盈利转入反马丁池比例（默认 0.9 = 90%）
  anti_martingale_usage_ratio?: number // 反马丁池使用比例（默认 0.3 = 30%）
  anti_martingale_pool_limit?: number // 反马丁池上限占总资金比例（默认 0.5 = 50%）
  // 以下字段为向后兼容保留，新版使用策略配置
  btc_eth_leverage?: number
  altcoin_leverage?: number
  trading_symbols?: string
  custom_prompt?: string
  override_base_prompt?: boolean
  system_prompt_template?: string
  use_coin_pool?: boolean
  use_oi_top?: boolean
}

export interface UpdateModelConfigRequest {
  models: {
    [key: string]: {
      enabled: boolean
      api_key: string
      custom_api_url?: string
      custom_model_name?: string
    }
  }
}

export interface UpdateExchangeConfigRequest {
  exchanges: {
    [key: string]: {
      enabled: boolean
      api_key: string
      secret_key: string
      passphrase?: string
      testnet?: boolean
      // Hyperliquid 特定字段
      hyperliquid_wallet_addr?: string
      // Aster 特定字段
      aster_user?: string
      aster_signer?: string
      aster_private_key?: string
      // LIGHTER 特定字段
      lighter_wallet_addr?: string
      lighter_private_key?: string
      lighter_api_key_private_key?: string
    }
  }
}

// Competition related types
export interface CompetitionTraderData {
  trader_id: string
  trader_name: string
  ai_model: string
  exchange: string
  total_equity: number
  total_pnl: number
  total_pnl_pct: number
  position_count: number
  margin_used_pct: number
  is_running: boolean
}

export interface CompetitionData {
  traders: CompetitionTraderData[]
  count: number
}

// Trader Configuration Data for View Modal
export interface TraderConfigData {
  trader_id?: string
  trader_name: string
  ai_model: string
  exchange_id: string
  strategy_id?: string  // 策略ID
  strategy_name?: string  // 策略名称
  is_cross_margin: boolean
  scan_interval_minutes: number
  initial_balance: number
  is_running: boolean
  // 反马丁仓位管理参数（交易员级别配置）
  base_capital_ratio?: number // 基础本金使用比例（默认 0.02 = 2%）
  anti_martingale_profit_conversion?: number // 盈利转入反马丁池比例（默认 0.9 = 90%）
  anti_martingale_usage_ratio?: number // 反马丁池使用比例（默认 0.3 = 30%）
  anti_martingale_pool_limit?: number // 反马丁池上限占总资金比例（默认 0.5 = 50%）
  // 以下为旧版字段（向后兼容）
  btc_eth_leverage?: number
  altcoin_leverage?: number
  trading_symbols?: string
  custom_prompt?: string
  override_base_prompt?: boolean
  system_prompt_template?: string
  use_coin_pool?: boolean
  use_oi_top?: boolean
}

// Backtest types
export interface BacktestRunSummary {
  symbol_count: number;
  decision_tf: string;
  processed_bars: number;
  progress_pct: number;
  equity_last: number;
  max_drawdown_pct: number;
  liquidated: boolean;
  liquidation_note?: string;
}

export interface BacktestRunMetadata {
  run_id: string;
  label?: string;
  user_id?: string;
  last_error?: string;
  version: number;
  state: string;
  created_at: string;
  updated_at: string;
  summary: BacktestRunSummary;
}

export interface BacktestRunsResponse {
  total: number;
  items: BacktestRunMetadata[];
}

export interface BacktestStatusPayload {
  run_id: string;
  state: string;
  progress_pct: number;
  processed_bars: number;
  current_time: number;
  decision_cycle: number;
  equity: number;
  unrealized_pnl: number;
  realized_pnl: number;
  note?: string;
  last_error?: string;
  last_updated_iso: string;
}

export interface BacktestEquityPoint {
  ts: number;
  equity: number;
  available: number;
  pnl: number;
  pnl_pct: number;
  dd_pct: number;
  cycle: number;
}

export interface BacktestTradeEvent {
  ts: number;
  symbol: string;
  action: string;
  side?: string;
  qty: number;
  price: number;
  fee: number;
  slippage: number;
  order_value: number;
  realized_pnl: number;
  leverage?: number;
  cycle: number;
  position_after: number;
  liquidation: boolean;
  note?: string;
}

export interface BacktestMetrics {
  total_return_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  profit_factor: number;
  win_rate: number;
  trades: number;
  avg_win: number;
  avg_loss: number;
  best_symbol: string;
  worst_symbol: string;
  liquidated: boolean;
  symbol_stats?: Record<
    string,
    {
      total_trades: number;
      winning_trades: number;
      losing_trades: number;
      total_pnl: number;
      avg_pnl: number;
      win_rate: number;
    }
  >;
}

export interface BacktestStartConfig {
  run_id?: string;
  ai_model_id?: string;
  symbols: string[];
  timeframes: string[];
  decision_timeframe: string;
  decision_cadence_nbars: number;
  start_ts: number;
  end_ts: number;
  initial_balance: number;
  fee_bps: number;
  slippage_bps: number;
  fill_policy: string;
  prompt_variant?: string;
  prompt_template?: string;
  custom_prompt?: string;
  override_prompt?: boolean;
  cache_ai?: boolean;
  replay_only?: boolean;
  checkpoint_interval_bars?: number;
  checkpoint_interval_seconds?: number;
  replay_decision_dir?: string;
  shared_ai_cache_path?: string;
  ai?: {
    provider?: string;
    model?: string;
    key?: string;
    secret_key?: string;
    base_url?: string;
  };
  leverage?: {
    btc_eth_leverage?: number;
    altcoin_leverage?: number;
  };
}

// Strategy Studio Types
export interface Strategy {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  config: StrategyConfig;
  created_at: string;
  updated_at: string;
}

export interface PromptSectionsConfig {
  role_definition?: string;
  trading_frequency?: string;
  entry_standards?: string;
  decision_process?: string;
}

export interface StrategyConfig {
  coin_source: CoinSourceConfig;
  indicators: IndicatorConfig;
  custom_prompt?: string;
  risk_control: RiskControlConfig;
  prompt_sections?: PromptSectionsConfig;
}

export interface CoinSourceConfig {
  source_type: 'static' | 'coinpool' | 'oi_top' | 'mixed';
  static_coins?: string[];
  use_coin_pool: boolean;
  coin_pool_limit?: number;
  coin_pool_api_url?: string;  // AI500 币种池 API URL
  use_oi_top: boolean;
  oi_top_limit?: number;
  oi_top_api_url?: string;     // OI Top API URL
}

export interface IndicatorConfig {
  klines: KlineConfig;
  // Raw OHLCV kline data - required for AI analysis
  enable_raw_klines: boolean;
  // Technical indicators (optional)
  enable_ema: boolean;
  enable_macd: boolean;
  enable_rsi: boolean;
  enable_atr: boolean;
  enable_volume: boolean;
  enable_oi: boolean;
  enable_funding_rate: boolean;
  enable_supertrend?: boolean;
  enable_frvp?: boolean;
  enable_macd_hist?: boolean;
  ema_periods?: number[];
  rsi_periods?: number[];
  atr_periods?: number[];
  supertrend_period?: number;
  supertrend_multiplier?: number;
  frvp_lookback?: number;
  external_data_sources?: ExternalDataSource[];
  // 量化数据源（资金流向、持仓变化、价格变化）
  enable_quant_data?: boolean;
  quant_data_api_url?: string;
  enable_quant_oi?: boolean;
  enable_quant_netflow?: boolean;
}

export interface KlineConfig {
  primary_timeframe: string;
  primary_count: number;
  longer_timeframe?: string;
  longer_count?: number;
  enable_multi_timeframe: boolean;
  // 新增：支持选择多个时间周期
  selected_timeframes?: string[];
}

export interface ExternalDataSource {
  name: string;
  type: 'api' | 'webhook';
  url: string;
  method: string;
  headers?: Record<string, string>;
  data_path?: string;
  refresh_secs?: number;
}

export interface RiskControlConfig {
  max_positions?: number;
  btc_eth_max_leverage?: number;
  altcoin_max_leverage?: number;
  min_confidence?: number;
  // 止损参数
  min_stop_loss_pct?: number; // 最小止损距离 (默认 0.01 = 1%)
  max_stop_loss_pct?: number; // 最大止损距离 (默认 0.05 = 5%)
  // 风控熔断参数
  max_daily_trades?: number; // 每日最大开仓次数 (默认 8)
  total_loss_circuit_breaker?: number; // 全部资金亏损熔断阈值 (默认 0.15 = 15%)
  // 加仓参数
  add_position_profit_interval?: number; // 加仓浮盈触发间隔 (默认 0.5 = 50%)
  add_position_ratio?: number; // 单次加仓比例 (默认 0.1 = 10%)
  add_position_cumulative_limit?: number; // 累计加仓上限 (默认 2.0 = 200%)
  add_position_safety_margin?: number; // 加仓安全边际 (默认 0.005 = 0.5%)
  // 减仓参数
  reduce_position_ratio?: number; // 单次减仓比例 (默认 0.3 = 30%)
}
