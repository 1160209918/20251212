import { Shield, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import type { RiskControlConfig } from '../../types'

interface RiskControlEditorProps {
  config: RiskControlConfig
  onChange: (config: RiskControlConfig) => void
  disabled?: boolean
  language: string
}

export function RiskControlEditor({
  config,
  onChange,
  disabled,
  language,
}: RiskControlEditorProps) {
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      positionLimits: { zh: '仓位限制', en: 'Position Limits' },
      maxPositions: { zh: '最大持仓数量', en: 'Max Positions' },
      maxPositionsDesc: { zh: '同时持有的最大币种数量', en: 'Maximum coins held simultaneously' },
      btcEthLeverage: { zh: 'BTC/ETH 最大杠杆', en: 'BTC/ETH Max Leverage' },
      altcoinLeverage: { zh: '山寨币最大杠杆', en: 'Altcoin Max Leverage' },
      riskParameters: { zh: '风险参数', en: 'Risk Parameters' },
      minRiskReward: { zh: '最小风险回报比', en: 'Min Risk/Reward Ratio' },
      minRiskRewardDesc: { zh: '开仓要求的最低盈亏比', en: 'Minimum profit ratio for opening' },
      maxMarginUsage: { zh: '最大保证金使用率', en: 'Max Margin Usage' },
      maxMarginUsageDesc: { zh: '保证金使用率上限', en: 'Maximum margin utilization' },
      maxPositionRatio: { zh: '单币最大仓位比', en: 'Max Position Ratio' },
      maxPositionRatioDesc: { zh: '相对账户净值的倍数', en: 'Multiple of account equity' },
      entryRequirements: { zh: '开仓要求', en: 'Entry Requirements' },
      minPositionSize: { zh: '最小开仓金额', en: 'Min Position Size' },
      minPositionSizeDesc: { zh: 'USDT 最小名义价值', en: 'Minimum notional value in USDT' },
      minConfidence: { zh: '最小信心度', en: 'Min Confidence' },
      minConfidenceDesc: { zh: 'AI 开仓信心度阈值', en: 'AI confidence threshold for entry' },
      // 反马丁仓位管理
      antiMartingale: { zh: '反马丁仓位管理', en: 'Anti-Martingale Position Management' },
      baseCapitalRatio: { zh: '基础本金使用比例', en: 'Base Capital Ratio' },
      baseCapitalRatioDesc: { zh: '每笔开仓使用基础本金的比例', en: 'Base capital ratio per trade' },
      profitConversion: { zh: '盈利转化率', en: 'Profit Conversion' },
      profitConversionDesc: { zh: '盈利转入反马丁池的比例', en: 'Profit conversion to anti-martingale pool' },
      antiMartingaleUsage: { zh: '反马丁池使用比例', en: 'Pool Usage Ratio' },
      antiMartingaleUsageDesc: { zh: '每笔开仓使用反马丁池的比例', en: 'Anti-martingale pool usage per trade' },
      poolLimit: { zh: '反马丁池上限', en: 'Pool Limit' },
      poolLimitDesc: { zh: '反马丁池占总资金的最大比例', en: 'Maximum pool size as % of total capital' },
      // 止损参数
      stopLossSettings: { zh: '止损设置', en: 'Stop Loss Settings' },
      minStopLoss: { zh: '最小止损距离', en: 'Min Stop Loss' },
      minStopLossDesc: { zh: '允许的最小止损距离', en: 'Minimum allowed stop loss distance' },
      maxStopLoss: { zh: '最大止损距离', en: 'Max Stop Loss' },
      maxStopLossDesc: { zh: '允许的最大止损距离', en: 'Maximum allowed stop loss distance' },
      // 风控熔断
      circuitBreaker: { zh: '风控熔断', en: 'Circuit Breaker' },
      maxDailyTrades: { zh: '每日最大开仓次数', en: 'Max Daily Trades' },
      maxDailyTradesDesc: { zh: '每日允许的最大新开仓次数', en: 'Maximum new positions per day' },
      totalLossBreaker: { zh: '全部资金亏损熔断', en: 'Total Loss Breaker' },
      totalLossBreakerDesc: { zh: '触发熔断的总亏损阈值', en: 'Total loss threshold for circuit breaker' },
      // 加仓参数
      addPositionSettings: { zh: '加仓设置', en: 'Add Position Settings' },
      profitInterval: { zh: '浮盈触发间隔', en: 'Profit Interval' },
      profitIntervalDesc: { zh: '每次加仓的浮盈间隔', en: 'Profit interval for adding positions' },
      addRatio: { zh: '单次加仓比例', en: 'Add Ratio' },
      addRatioDesc: { zh: '相对初始仓位的加仓比例', en: 'Add position ratio vs initial position' },
      cumulativeLimit: { zh: '累计加仓上限', en: 'Cumulative Limit' },
      cumulativeLimitDesc: { zh: '累计加仓的最大倍数', en: 'Maximum cumulative add position multiple' },
      safetyMargin: { zh: '加仓安全边际', en: 'Safety Margin' },
      safetyMarginDesc: { zh: '加仓后新均价距止损的最小距离', en: 'Minimum distance from stop loss after adding' },
      // 减仓参数
      reducePositionSettings: { zh: '减仓设置', en: 'Reduce Position Settings' },
      reduceRatio: { zh: '单次减仓比例', en: 'Reduce Ratio' },
      reduceRatioDesc: { zh: '相对当前仓位的减仓比例', en: 'Reduce position ratio vs current position' },
    }
    return translations[key]?.[language] || key
  }

  const updateField = <K extends keyof RiskControlConfig>(
    key: K,
    value: RiskControlConfig[K]
  ) => {
    if (!disabled) {
      onChange({ ...config, [key]: value })
    }
  }

  return (
    <div className="space-y-6">
      {/* Position Limits */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" style={{ color: '#F0B90B' }} />
          <h3 className="font-medium" style={{ color: '#EAECEF' }}>
            {t('positionLimits')}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('maxPositions')}
              </label>
              <input
                type="checkbox"
                checked={config.max_positions !== undefined}
                onChange={(e) =>
                  updateField('max_positions', e.target.checked ? 3 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('maxPositionsDesc')}
            </p>
            <input
              type="number"
              value={config.max_positions ?? ''}
              onChange={(e) =>
                updateField('max_positions', parseInt(e.target.value) || 3)
              }
              disabled={disabled || config.max_positions === undefined}
              min={1}
              max={10}
              className="w-full px-3 py-2 rounded"
              style={{
                background: '#1E2329',
                border: '1px solid #2B3139',
                color: '#EAECEF',
                opacity: config.max_positions === undefined ? 0.5 : 1,
              }}
            />
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('btcEthLeverage')}
              </label>
              <input
                type="checkbox"
                checked={config.btc_eth_max_leverage !== undefined}
                onChange={(e) =>
                  updateField('btc_eth_max_leverage', e.target.checked ? 10 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={config.btc_eth_max_leverage ?? 10}
                onChange={(e) =>
                  updateField('btc_eth_max_leverage', parseInt(e.target.value))
                }
                disabled={disabled || config.btc_eth_max_leverage === undefined}
                min={1}
                max={50}
                className="flex-1 accent-yellow-500"
                style={{ opacity: config.btc_eth_max_leverage === undefined ? 0.5 : 1 }}
              />
              <span
                className="w-12 text-center font-mono"
                style={{ color: '#F0B90B', opacity: config.btc_eth_max_leverage === undefined ? 0.5 : 1 }}
              >
                {config.btc_eth_max_leverage ?? 10}x
              </span>
            </div>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('altcoinLeverage')}
              </label>
              <input
                type="checkbox"
                checked={config.altcoin_max_leverage !== undefined}
                onChange={(e) =>
                  updateField('altcoin_max_leverage', e.target.checked ? 5 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={config.altcoin_max_leverage ?? 5}
                onChange={(e) =>
                  updateField('altcoin_max_leverage', parseInt(e.target.value))
                }
                disabled={disabled || config.altcoin_max_leverage === undefined}
                min={1}
                max={50}
                className="flex-1 accent-yellow-500"
                style={{ opacity: config.altcoin_max_leverage === undefined ? 0.5 : 1 }}
              />
              <span
                className="w-12 text-center font-mono"
                style={{ color: '#F0B90B', opacity: config.altcoin_max_leverage === undefined ? 0.5 : 1 }}
              >
                {config.altcoin_max_leverage ?? 5}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Requirements */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" style={{ color: '#0ECB81' }} />
          <h3 className="font-medium" style={{ color: '#EAECEF' }}>
            {t('entryRequirements')}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('minConfidence')}
              </label>
              <input
                type="checkbox"
                checked={config.min_confidence !== undefined}
                onChange={(e) =>
                  updateField('min_confidence', e.target.checked ? 70 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('minConfidenceDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={config.min_confidence ?? 70}
                onChange={(e) =>
                  updateField('min_confidence', parseInt(e.target.value))
                }
                disabled={disabled || config.min_confidence === undefined}
                min={50}
                max={100}
                className="flex-1 accent-green-500"
                style={{ opacity: config.min_confidence === undefined ? 0.5 : 1 }}
              />
              <span className="w-12 text-center font-mono" style={{ color: '#0ECB81', opacity: config.min_confidence === undefined ? 0.5 : 1 }}>
                {config.min_confidence ?? 70}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Loss Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5" style={{ color: '#F6465D' }} />
          <h3 className="font-medium" style={{ color: '#EAECEF' }}>
            {t('stopLossSettings')}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('minStopLoss')}
              </label>
              <input
                type="checkbox"
                checked={config.min_stop_loss_pct !== undefined}
                onChange={(e) =>
                  updateField('min_stop_loss_pct', e.target.checked ? 0.003 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('minStopLossDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={(config.min_stop_loss_pct ?? 0.003) * 1000}
                onChange={(e) =>
                  updateField('min_stop_loss_pct', parseInt(e.target.value) / 1000)
                }
                disabled={disabled || config.min_stop_loss_pct === undefined}
                min={1}
                max={50}
                step={1}
                className="flex-1 accent-red-500"
                style={{ opacity: config.min_stop_loss_pct === undefined ? 0.5 : 1 }}
              />
              <span className="w-12 text-center font-mono" style={{ color: '#F6465D', opacity: config.min_stop_loss_pct === undefined ? 0.5 : 1 }}>
                {((config.min_stop_loss_pct ?? 0.003) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('maxStopLoss')}
              </label>
              <input
                type="checkbox"
                checked={config.max_stop_loss_pct !== undefined}
                onChange={(e) =>
                  updateField('max_stop_loss_pct', e.target.checked ? 0.05 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('maxStopLossDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={(config.max_stop_loss_pct ?? 0.05) * 100}
                onChange={(e) =>
                  updateField('max_stop_loss_pct', parseInt(e.target.value) / 100)
                }
                disabled={disabled || config.max_stop_loss_pct === undefined}
                min={2}
                max={10}
                step={0.1}
                className="flex-1 accent-red-500"
                style={{ opacity: config.max_stop_loss_pct === undefined ? 0.5 : 1 }}
              />
              <span className="w-12 text-center font-mono" style={{ color: '#F6465D', opacity: config.max_stop_loss_pct === undefined ? 0.5 : 1 }}>
                {((config.max_stop_loss_pct ?? 0.05) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Circuit Breaker */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5" style={{ color: '#F6465D' }} />
          <h3 className="font-medium" style={{ color: '#EAECEF' }}>
            {t('circuitBreaker')}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('maxDailyTrades')}
              </label>
              <input
                type="checkbox"
                checked={config.max_daily_trades !== undefined}
                onChange={(e) =>
                  updateField('max_daily_trades', e.target.checked ? 8 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('maxDailyTradesDesc')}
            </p>
            <input
              type="number"
              value={config.max_daily_trades ?? ''}
              onChange={(e) =>
                updateField('max_daily_trades', parseInt(e.target.value) || 8)
              }
              disabled={disabled || config.max_daily_trades === undefined}
              min={1}
              max={20}
              className="w-full px-3 py-2 rounded"
              style={{
                background: '#1E2329',
                border: '1px solid #2B3139',
                color: '#EAECEF',
                opacity: config.max_daily_trades === undefined ? 0.5 : 1,
              }}
            />
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('totalLossBreaker')}
              </label>
              <input
                type="checkbox"
                checked={config.total_loss_circuit_breaker !== undefined}
                onChange={(e) =>
                  updateField('total_loss_circuit_breaker', e.target.checked ? 0.15 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('totalLossBreakerDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={(config.total_loss_circuit_breaker ?? 0.15) * 100}
                onChange={(e) =>
                  updateField('total_loss_circuit_breaker', parseInt(e.target.value) / 100)
                }
                disabled={disabled || config.total_loss_circuit_breaker === undefined}
                min={5}
                max={30}
                className="flex-1 accent-red-500"
                style={{ opacity: config.total_loss_circuit_breaker === undefined ? 0.5 : 1 }}
              />
              <span className="w-12 text-center font-mono" style={{ color: '#F6465D', opacity: config.total_loss_circuit_breaker === undefined ? 0.5 : 1 }}>
                {Math.round((config.total_loss_circuit_breaker ?? 0.15) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Position Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" style={{ color: '#0ECB81' }} />
          <h3 className="font-medium" style={{ color: '#EAECEF' }}>
            {t('addPositionSettings')}
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('profitInterval')}
              </label>
              <input
                type="checkbox"
                checked={config.add_position_profit_interval !== undefined}
                onChange={(e) =>
                  updateField('add_position_profit_interval', e.target.checked ? 0.5 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('profitIntervalDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={(config.add_position_profit_interval ?? 0.5) * 100}
                onChange={(e) =>
                  updateField('add_position_profit_interval', parseInt(e.target.value) / 100)
                }
                disabled={disabled || config.add_position_profit_interval === undefined}
                min={20}
                max={100}
                step={5}
                className="flex-1 accent-green-500"
                style={{ opacity: config.add_position_profit_interval === undefined ? 0.5 : 1 }}
              />
              <span className="w-12 text-center font-mono" style={{ color: '#0ECB81', opacity: config.add_position_profit_interval === undefined ? 0.5 : 1 }}>
                {Math.round((config.add_position_profit_interval ?? 0.5) * 100)}%
              </span>
            </div>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('addRatio')}
              </label>
              <input
                type="checkbox"
                checked={config.add_position_ratio !== undefined}
                onChange={(e) =>
                  updateField('add_position_ratio', e.target.checked ? 0.1 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('addRatioDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={(config.add_position_ratio ?? 0.1) * 100}
                onChange={(e) =>
                  updateField('add_position_ratio', parseInt(e.target.value) / 100)
                }
                disabled={disabled || config.add_position_ratio === undefined}
                min={5}
                max={30}
                className="flex-1 accent-green-500"
                style={{ opacity: config.add_position_ratio === undefined ? 0.5 : 1 }}
              />
              <span className="w-12 text-center font-mono" style={{ color: '#0ECB81', opacity: config.add_position_ratio === undefined ? 0.5 : 1 }}>
                {Math.round((config.add_position_ratio ?? 0.1) * 100)}%
              </span>
            </div>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('cumulativeLimit')}
              </label>
              <input
                type="checkbox"
                checked={config.add_position_cumulative_limit !== undefined}
                onChange={(e) =>
                  updateField('add_position_cumulative_limit', e.target.checked ? 2.0 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('cumulativeLimitDesc')}
            </p>
            <div className="flex items-center">
              <input
                type="number"
                value={config.add_position_cumulative_limit ?? ''}
                onChange={(e) =>
                  updateField('add_position_cumulative_limit', parseFloat(e.target.value) || 2.0)
                }
                disabled={disabled || config.add_position_cumulative_limit === undefined}
                min={1}
                max={5}
                step={0.5}
                className="w-20 px-3 py-2 rounded"
                style={{
                  background: '#1E2329',
                  border: '1px solid #2B3139',
                  color: '#EAECEF',
                  opacity: config.add_position_cumulative_limit === undefined ? 0.5 : 1,
                }}
              />
              <span className="ml-2" style={{ color: '#848E9C', opacity: config.add_position_cumulative_limit === undefined ? 0.5 : 1 }}>
                x
              </span>
            </div>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('safetyMargin')}
              </label>
              <input
                type="checkbox"
                checked={config.add_position_safety_margin !== undefined}
                onChange={(e) =>
                  updateField('add_position_safety_margin', e.target.checked ? 0.005 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('safetyMarginDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={(config.add_position_safety_margin ?? 0.005) * 1000}
                onChange={(e) =>
                  updateField('add_position_safety_margin', parseInt(e.target.value) / 1000)
                }
                disabled={disabled || config.add_position_safety_margin === undefined}
                min={2}
                max={20}
                step={1}
                className="flex-1 accent-green-500"
                style={{ opacity: config.add_position_safety_margin === undefined ? 0.5 : 1 }}
              />
              <span className="w-12 text-center font-mono" style={{ color: '#0ECB81', opacity: config.add_position_safety_margin === undefined ? 0.5 : 1 }}>
                {((config.add_position_safety_margin ?? 0.005) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reduce Position Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5" style={{ color: '#F0B90B' }} />
          <h3 className="font-medium" style={{ color: '#EAECEF' }}>
            {t('reducePositionSettings')}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm" style={{ color: '#EAECEF' }}>
                {t('reduceRatio')}
              </label>
              <input
                type="checkbox"
                checked={config.reduce_position_ratio !== undefined}
                onChange={(e) =>
                  updateField('reduce_position_ratio', e.target.checked ? 0.3 : undefined)
                }
                disabled={disabled}
                className="w-4 h-4 accent-green-500"
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
              {t('reduceRatioDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={(config.reduce_position_ratio ?? 0.3) * 100}
                onChange={(e) =>
                  updateField('reduce_position_ratio', parseInt(e.target.value) / 100)
                }
                disabled={disabled || config.reduce_position_ratio === undefined}
                min={10}
                max={50}
                className="flex-1 accent-yellow-500"
                style={{ opacity: config.reduce_position_ratio === undefined ? 0.5 : 1 }}
              />
              <span className="w-12 text-center font-mono" style={{ color: '#F0B90B', opacity: config.reduce_position_ratio === undefined ? 0.5 : 1 }}>
                {Math.round((config.reduce_position_ratio ?? 0.3) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
