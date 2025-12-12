import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
  Plus,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  Settings,
  BarChart3,
  Target,
  Shield,
  Zap,
  Activity,
  Save,
  Sparkles,
  Eye,
  Play,
  FileText,
  Loader2,
  RefreshCw,
  Clock,
  Bot,
  Terminal,
  Code,
  Send,
  Download,
  Upload,
} from 'lucide-react'
import type { Strategy, StrategyConfig, AIModel } from '../types'
import { confirmToast, notify } from '../lib/notify'
import { CoinSourceEditor } from '../components/strategy/CoinSourceEditor'
import { IndicatorEditor } from '../components/strategy/IndicatorEditor'
import { RiskControlEditor } from '../components/strategy/RiskControlEditor'
import { PromptSectionsEditor } from '../components/strategy/PromptSectionsEditor'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export function StrategyStudioPage() {
  const { token } = useAuth()
  const { language } = useLanguage()

  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [editingConfig, setEditingConfig] = useState<StrategyConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // AI Models for test run
  const [aiModels, setAiModels] = useState<AIModel[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')

  // Accordion states for left panel
  const [expandedSections, setExpandedSections] = useState({
    coinSource: true,
    indicators: false,
    riskControl: false,
    promptSections: false,
    customPrompt: false,
  })

  // Right panel states
  const [activeRightTab, setActiveRightTab] = useState<'prompt' | 'test'>('prompt')
  const [promptPreview, setPromptPreview] = useState<{
    system_prompt: string
    user_prompt?: string
    prompt_variant: string
    config_summary: Record<string, unknown>
  } | null>(null)
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState('balanced')

  // AI Test Run states
  const [aiTestResult, setAiTestResult] = useState<{
    system_prompt?: string
    user_prompt?: string
    ai_response?: string
    reasoning?: string
    decisions?: unknown[]
    error?: string
    duration_ms?: number
  } | null>(null)
  const [isRunningAiTest, setIsRunningAiTest] = useState(false)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Fetch AI Models
  const fetchAiModels = useCallback(async () => {
    if (!token) return
    try {
      const response = await fetch(`${API_BASE}/api/models`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // 后端返回的是数组，不是 { models: [] }
        const allModels = Array.isArray(data) ? data : (data.models || [])
        const enabledModels = allModels.filter((m: AIModel) => m.enabled)
        setAiModels(enabledModels)
        if (enabledModels.length > 0 && !selectedModelId) {
          setSelectedModelId(enabledModels[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI models:', err)
    }
  }, [token, selectedModelId])

  // Fetch strategies
  const fetchStrategies = useCallback(async () => {
    if (!token) return
    try {
      const response = await fetch(`${API_BASE}/api/strategies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch strategies')
      const data = await response.json()

      // Debug: Log loaded strategies
      console.log('📥 Loaded strategies:', data.strategies)
      if (data.strategies?.length > 0) {
        console.log('📥 First strategy config:', JSON.stringify(data.strategies[0].config, null, 2))
      }

      setStrategies(data.strategies || [])

      // Select active or first strategy
      const active = data.strategies?.find((s: Strategy) => s.is_active)
      if (active) {
        setSelectedStrategy(active)
        setEditingConfig(active.config)
      } else if (data.strategies?.length > 0) {
        setSelectedStrategy(data.strategies[0])
        setEditingConfig(data.strategies[0].config)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchStrategies()
    fetchAiModels()
  }, [fetchStrategies, fetchAiModels])

  // Create new strategy
  const handleCreateStrategy = async () => {
    if (!token) return
    try {
      const configResponse = await fetch(
        `${API_BASE}/api/strategies/default-config?lang=${language}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const defaultConfig = await configResponse.json()

      // Ensure critical risk control parameters have default values (should be checked by default)
      const configWithDefaults = {
        ...defaultConfig,
        risk_control: {
          ...defaultConfig.risk_control,
          // Stop loss settings (2 params) - default checked
          min_stop_loss_pct: defaultConfig.risk_control?.min_stop_loss_pct ?? 0.003,
          max_stop_loss_pct: defaultConfig.risk_control?.max_stop_loss_pct ?? 0.05,
          // Circuit breaker (2 params) - default checked
          max_daily_trades: defaultConfig.risk_control?.max_daily_trades ?? 8,
          total_loss_circuit_breaker: defaultConfig.risk_control?.total_loss_circuit_breaker ?? 0.15,
          // Add position settings (4 params) - default checked
          add_position_profit_interval: defaultConfig.risk_control?.add_position_profit_interval ?? 0.5,
          add_position_ratio: defaultConfig.risk_control?.add_position_ratio ?? 0.1,
          add_position_cumulative_limit: defaultConfig.risk_control?.add_position_cumulative_limit ?? 2.0,
          add_position_safety_margin: defaultConfig.risk_control?.add_position_safety_margin ?? 0.005,
          // Reduce position settings (1 param) - default checked
          reduce_position_ratio: defaultConfig.risk_control?.reduce_position_ratio ?? 0.3,
        },
      }

      const response = await fetch(`${API_BASE}/api/strategies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: language === 'zh' ? '新策略' : 'New Strategy',
          description: '',
          config: configWithDefaults,
        }),
      })
      if (!response.ok) throw new Error('Failed to create strategy')
      const result = await response.json()
      await fetchStrategies()
      // Auto-select the newly created strategy
      if (result.id) {
        const now = new Date().toISOString()
        const newStrategy = {
          id: result.id,
          name: language === 'zh' ? '新策略' : 'New Strategy',
          description: '',
          is_active: false,
          is_default: false,
          config: configWithDefaults,
          created_at: now,
          updated_at: now,
        }
        setSelectedStrategy(newStrategy)
        setEditingConfig(configWithDefaults)
        setHasChanges(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Delete strategy
  const handleDeleteStrategy = async (id: string) => {
    if (!token) return

    const confirmed = await confirmToast(
      language === 'zh' ? '确定删除此策略？' : 'Delete this strategy?',
      {
        title: language === 'zh' ? '确认删除' : 'Confirm Delete',
        okText: language === 'zh' ? '删除' : 'Delete',
        cancelText: language === 'zh' ? '取消' : 'Cancel',
      }
    )
    if (!confirmed) return

    try {
      const response = await fetch(`${API_BASE}/api/strategies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to delete strategy')
      notify.success(language === 'zh' ? '策略已删除' : 'Strategy deleted')
      // Clear selection if deleted strategy was selected
      if (selectedStrategy?.id === id) {
        setSelectedStrategy(null)
        setEditingConfig(null)
        setHasChanges(false)
      }
      await fetchStrategies()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      notify.error(errorMsg)
    }
  }

  // Duplicate strategy
  const handleDuplicateStrategy = async (id: string) => {
    if (!token) return
    try {
      const response = await fetch(`${API_BASE}/api/strategies/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: language === 'zh' ? '策略副本' : 'Strategy Copy',
        }),
      })
      if (!response.ok) throw new Error('Failed to duplicate strategy')
      await fetchStrategies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Activate strategy
  const handleActivateStrategy = async (id: string) => {
    if (!token) return
    try {
      const response = await fetch(`${API_BASE}/api/strategies/${id}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to activate strategy')
      await fetchStrategies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Export strategy as JSON file
  const handleExportStrategy = (strategy: Strategy) => {
    const exportData = {
      name: strategy.name,
      description: strategy.description,
      config: strategy.config,
      exported_at: new Date().toISOString(),
      version: '1.0',
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `strategy_${strategy.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify.success(language === 'zh' ? '策略已导出' : 'Strategy exported')
  }

  // Import strategy from JSON file
  const handleImportStrategy = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return

    try {
      const text = await file.text()
      const importData = JSON.parse(text)

      // Validate imported data
      if (!importData.config || !importData.name) {
        throw new Error(language === 'zh' ? '无效的策略文件' : 'Invalid strategy file')
      }

      // Create new strategy with imported config
      const response = await fetch(`${API_BASE}/api/strategies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${importData.name} (${language === 'zh' ? '导入' : 'Imported'})`,
          description: importData.description || '',
          config: importData.config,
        }),
      })
      if (!response.ok) throw new Error('Failed to import strategy')

      notify.success(language === 'zh' ? '策略已导入' : 'Strategy imported')
      await fetchStrategies()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      notify.error(errorMsg)
    } finally {
      // Reset file input
      event.target.value = ''
    }
  }

  // Save strategy
  const handleSaveStrategy = async () => {
    if (!token || !selectedStrategy || !editingConfig) return
    setIsSaving(true)
    try {
      // Debug: Log the config being saved
      console.log('💾 Saving config:', JSON.stringify(editingConfig, null, 2))

      const response = await fetch(
        `${API_BASE}/api/strategies/${selectedStrategy.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: selectedStrategy.name,
            description: selectedStrategy.description,
            config: editingConfig,
          }),
        }
      )
      if (!response.ok) throw new Error('Failed to save strategy')

      // Debug: Log the response
      const savedData = await response.json()
      console.log('✅ Saved response:', savedData)

      setHasChanges(false)

      // IMPORTANT: Don't reload from server, keep the current editingConfig
      // This prevents the backend from overwriting our undefined values with defaults
      // Just update the strategies list without changing the current editing state
      setStrategies(prev => prev.map(s =>
        s.id === selectedStrategy.id
          ? { ...s, ...selectedStrategy, config: editingConfig }
          : s
      ))

      notify.success(language === 'zh' ? '策略已保存' : 'Strategy saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      notify.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSaving(false)
    }
  }

  // Update config section
  const updateConfig = <K extends keyof StrategyConfig>(
    section: K,
    value: StrategyConfig[K]
  ) => {
    if (!editingConfig) return
    setEditingConfig({
      ...editingConfig,
      [section]: value,
    })
    setHasChanges(true)
  }

  // Fetch prompt preview
  const fetchPromptPreview = async () => {
    if (!token || !editingConfig) return
    setIsLoadingPrompt(true)
    try {
      const response = await fetch(`${API_BASE}/api/strategies/preview-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          config: editingConfig,
          account_equity: 1000,
          prompt_variant: selectedVariant,
        }),
      })
      if (!response.ok) throw new Error('Failed to fetch prompt preview')
      const data = await response.json()
      setPromptPreview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoadingPrompt(false)
    }
  }

  // Run AI test with real AI model
  const runAiTest = async () => {
    if (!token || !editingConfig || !selectedModelId) return
    setIsRunningAiTest(true)
    setAiTestResult(null)
    try {
      const response = await fetch(`${API_BASE}/api/strategies/test-run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          config: editingConfig,
          prompt_variant: selectedVariant,
          ai_model_id: selectedModelId,
          run_real_ai: true,
        }),
      })
      if (!response.ok) throw new Error('Failed to run AI test')
      const data = await response.json()
      setAiTestResult(data)
    } catch (err) {
      setAiTestResult({
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsRunningAiTest(false)
    }
  }

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      strategyStudio: { zh: '策略工作室', en: 'Strategy Studio' },
      subtitle: { zh: '可视化配置和测试交易策略', en: 'Configure and test trading strategies' },
      strategies: { zh: '策略', en: 'Strategies' },
      newStrategy: { zh: '新建', en: 'New' },
      coinSource: { zh: '币种来源', en: 'Coin Source' },
      indicators: { zh: '技术指标', en: 'Indicators' },
      riskControl: { zh: '风控参数', en: 'Risk Control' },
      promptSections: { zh: 'Prompt 编辑', en: 'Prompt Editor' },
      customPrompt: { zh: '附加提示', en: 'Extra Prompt' },
      save: { zh: '保存', en: 'Save' },
      saving: { zh: '保存中...', en: 'Saving...' },
      activate: { zh: '激活', en: 'Activate' },
      active: { zh: '激活中', en: 'Active' },
      default: { zh: '默认', en: 'Default' },
      promptPreview: { zh: 'Prompt 预览', en: 'Prompt Preview' },
      aiTestRun: { zh: 'AI 测试', en: 'AI Test' },
      systemPrompt: { zh: 'System Prompt', en: 'System Prompt' },
      userPrompt: { zh: 'User Prompt', en: 'User Prompt' },
      loadPrompt: { zh: '生成 Prompt', en: 'Generate Prompt' },
      refreshPrompt: { zh: '刷新', en: 'Refresh' },
      promptVariant: { zh: '风格', en: 'Style' },
      balanced: { zh: '平衡', en: 'Balanced' },
      aggressive: { zh: '激进', en: 'Aggressive' },
      conservative: { zh: '保守', en: 'Conservative' },
      selectModel: { zh: '选择 AI 模型', en: 'Select AI Model' },
      runTest: { zh: '运行 AI 测试', en: 'Run AI Test' },
      running: { zh: '运行中...', en: 'Running...' },
      aiOutput: { zh: 'AI 输出', en: 'AI Output' },
      reasoning: { zh: '思维链', en: 'Reasoning' },
      decisions: { zh: '决策', en: 'Decisions' },
      duration: { zh: '耗时', en: 'Duration' },
      noModel: { zh: '请先配置 AI 模型', en: 'Please configure AI model first' },
      testNote: { zh: '使用真实 AI 模型测试，不执行交易', en: 'Test with real AI, no trading' },
    }
    return translations[key]?.[language] || key
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin" />
            <Zap className="w-6 h-6 text-yellow-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    )
  }

  const configSections = [
    {
      key: 'coinSource' as const,
      icon: Target,
      color: '#F0B90B',
      title: t('coinSource'),
      content: editingConfig && (
        <CoinSourceEditor
          config={editingConfig.coin_source}
          onChange={(coinSource) => updateConfig('coin_source', coinSource)}
          disabled={selectedStrategy?.is_default}
          language={language}
        />
      ),
    },
    {
      key: 'indicators' as const,
      icon: BarChart3,
      color: '#0ECB81',
      title: t('indicators'),
      content: editingConfig && (
        <IndicatorEditor
          config={editingConfig.indicators}
          onChange={(indicators) => updateConfig('indicators', indicators)}
          disabled={selectedStrategy?.is_default}
          language={language}
        />
      ),
    },
    {
      key: 'riskControl' as const,
      icon: Shield,
      color: '#F6465D',
      title: t('riskControl'),
      content: editingConfig && (
        <RiskControlEditor
          config={editingConfig.risk_control}
          onChange={(riskControl) => updateConfig('risk_control', riskControl)}
          disabled={selectedStrategy?.is_default}
          language={language}
        />
      ),
    },
    {
      key: 'promptSections' as const,
      icon: FileText,
      color: '#a855f7',
      title: t('promptSections'),
      content: editingConfig && (
        <PromptSectionsEditor
          config={editingConfig.prompt_sections}
          onChange={(promptSections) => updateConfig('prompt_sections', promptSections)}
          disabled={selectedStrategy?.is_default}
          language={language}
        />
      ),
    },
    {
      key: 'customPrompt' as const,
      icon: Settings,
      color: '#60a5fa',
      title: t('customPrompt'),
      content: editingConfig && (
        <div>
          <p className="text-xs mb-2" style={{ color: '#848E9C' }}>
            {language === 'zh' ? '附加在 System Prompt 末尾的额外提示，用于补充个性化交易风格' : 'Extra prompt appended to System Prompt for personalized trading style'}
          </p>
          <textarea
            value={editingConfig.custom_prompt || ''}
            onChange={(e) => updateConfig('custom_prompt', e.target.value)}
            disabled={selectedStrategy?.is_default}
            placeholder={language === 'zh' ? '输入自定义提示词...' : 'Enter custom prompt...'}
            className="w-full h-32 px-3 py-2 rounded-lg resize-none font-mono text-xs"
            style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col" style={{ background: '#0B0E11' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: '#2B3139' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #F0B90B 0%, #FCD535 100%)' }}>
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#EAECEF' }}>{t('strategyStudio')}</h1>
              <p className="text-xs" style={{ color: '#848E9C' }}>{t('subtitle')}</p>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }}>
              {error}
              <button onClick={() => setError(null)} className="hover:underline">×</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Three Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Strategy List */}
        <div className="w-48 flex-shrink-0 border-r overflow-y-auto" style={{ borderColor: '#2B3139' }}>
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-medium" style={{ color: '#848E9C' }}>{t('strategies')}</span>
              <div className="flex items-center gap-1">
                {/* Import button with hidden file input */}
                <label className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer" style={{ color: '#848E9C' }} title={language === 'zh' ? '导入策略' : 'Import Strategy'}>
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportStrategy}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleCreateStrategy}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  style={{ color: '#F0B90B' }}
                  title={language === 'zh' ? '新建策略' : 'New Strategy'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  onClick={() => {
                    setSelectedStrategy(strategy)
                    setEditingConfig(strategy.config)
                    setHasChanges(false)
                    setPromptPreview(null)
                    setAiTestResult(null)
                  }}
                  className={`group px-2 py-2 rounded-lg cursor-pointer transition-all ${
                    selectedStrategy?.id === strategy.id ? 'ring-1 ring-yellow-500/50' : 'hover:bg-white/5'
                  }`}
                  style={{
                    background: selectedStrategy?.id === strategy.id ? 'rgba(240, 185, 11, 0.1)' : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate" style={{ color: '#EAECEF' }}>{strategy.name}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExportStrategy(strategy) }}
                        className="p-1 rounded hover:bg-white/10"
                        title={language === 'zh' ? '导出' : 'Export'}
                      >
                        <Download className="w-3 h-3" style={{ color: '#848E9C' }} />
                      </button>
                      {!strategy.is_default && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDuplicateStrategy(strategy.id) }}
                            className="p-1 rounded hover:bg-white/10"
                            title={language === 'zh' ? '复制' : 'Duplicate'}
                          >
                            <Copy className="w-3 h-3" style={{ color: '#848E9C' }} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteStrategy(strategy.id) }}
                            className="p-1 rounded hover:bg-red-500/20"
                            title={language === 'zh' ? '删除' : 'Delete'}
                          >
                            <Trash2 className="w-3 h-3" style={{ color: '#F6465D' }} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {strategy.is_active && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'rgba(14, 203, 129, 0.15)', color: '#0ECB81' }}>
                        {t('active')}
                      </span>
                    )}
                    {strategy.is_default && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B' }}>
                        {t('default')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Config Editor */}
        <div className="flex-1 min-w-0 overflow-y-auto border-r" style={{ borderColor: '#2B3139' }}>
          {selectedStrategy && editingConfig ? (
            <div className="p-4">
              {/* Strategy Name & Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={selectedStrategy.name}
                    onChange={(e) => {
                      setSelectedStrategy({ ...selectedStrategy, name: e.target.value })
                      setHasChanges(true)
                    }}
                    disabled={selectedStrategy.is_default}
                    className="text-lg font-bold bg-transparent border-none outline-none w-full"
                    style={{ color: '#EAECEF' }}
                  />
                  {hasChanges && (
                    <span className="text-xs" style={{ color: '#F0B90B' }}>● 未保存</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!selectedStrategy.is_active && (
                    <button
                      onClick={() => handleActivateStrategy(selectedStrategy.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                      style={{ background: 'rgba(14, 203, 129, 0.1)', border: '1px solid rgba(14, 203, 129, 0.3)', color: '#0ECB81' }}
                    >
                      <Check className="w-3 h-3" />
                      {t('activate')}
                    </button>
                  )}
                  {!selectedStrategy.is_default && (
                    <button
                      onClick={handleSaveStrategy}
                      disabled={isSaving || !hasChanges}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      style={{
                        background: hasChanges ? '#F0B90B' : '#2B3139',
                        color: hasChanges ? '#0B0E11' : '#848E9C',
                      }}
                    >
                      <Save className="w-3 h-3" />
                      {isSaving ? t('saving') : t('save')}
                    </button>
                  )}
                </div>
              </div>

              {/* Config Sections */}
              <div className="space-y-2">
                {configSections.map(({ key, icon: Icon, color, title, content }) => (
                  <div
                    key={key}
                    className="rounded-lg overflow-hidden"
                    style={{ background: '#1E2329', border: '1px solid #2B3139' }}
                  >
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-sm font-medium" style={{ color: '#EAECEF' }}>{title}</span>
                      </div>
                      {expandedSections[key] ? (
                        <ChevronDown className="w-4 h-4" style={{ color: '#848E9C' }} />
                      ) : (
                        <ChevronRight className="w-4 h-4" style={{ color: '#848E9C' }} />
                      )}
                    </button>
                    {expandedSections[key] && (
                      <div className="px-3 pb-3">
                        {content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" style={{ color: '#848E9C' }} />
                <p className="text-sm" style={{ color: '#848E9C' }}>
                  {language === 'zh' ? '选择或创建策略' : 'Select or create a strategy'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Prompt Preview & AI Test */}
        <div className="w-[420px] flex-shrink-0 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b" style={{ borderColor: '#2B3139' }}>
            <button
              onClick={() => setActiveRightTab('prompt')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeRightTab === 'prompt' ? 'border-b-2' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                borderColor: activeRightTab === 'prompt' ? '#a855f7' : 'transparent',
                color: activeRightTab === 'prompt' ? '#a855f7' : '#848E9C',
              }}
            >
              <Eye className="w-4 h-4" />
              {t('promptPreview')}
            </button>
            <button
              onClick={() => setActiveRightTab('test')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeRightTab === 'test' ? 'border-b-2' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                borderColor: activeRightTab === 'test' ? '#22c55e' : 'transparent',
                color: activeRightTab === 'test' ? '#22c55e' : '#848E9C',
              }}
            >
              <Play className="w-4 h-4" />
              {t('aiTestRun')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeRightTab === 'prompt' ? (
              /* Prompt Preview Tab */
              <div className="p-3 space-y-3">
                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="px-2 py-1.5 rounded text-xs"
                    style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                  >
                    <option value="balanced">{t('balanced')}</option>
                    <option value="aggressive">{t('aggressive')}</option>
                    <option value="conservative">{t('conservative')}</option>
                  </select>
                  <button
                    onClick={fetchPromptPreview}
                    disabled={isLoadingPrompt || !editingConfig}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    style={{ background: '#a855f7', color: '#fff' }}
                  >
                    {isLoadingPrompt ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    {promptPreview ? t('refreshPrompt') : t('loadPrompt')}
                  </button>
                </div>

                {promptPreview ? (
                  <>
                    {/* Config Summary */}
                    <div className="p-2 rounded-lg" style={{ background: '#0B0E11', border: '1px solid #2B3139' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Code className="w-3 h-3" style={{ color: '#a855f7' }} />
                        <span className="text-xs font-medium" style={{ color: '#a855f7' }}>Config</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(promptPreview.config_summary || {}).map(([key, value]) => (
                          <div key={key}>
                            <div style={{ color: '#848E9C' }}>{key.replace(/_/g, ' ')}</div>
                            <div style={{ color: '#EAECEF' }}>{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3" style={{ color: '#a855f7' }} />
                          <span className="text-xs font-medium" style={{ color: '#EAECEF' }}>{t('systemPrompt')}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#2B3139', color: '#848E9C' }}>
                          {promptPreview.system_prompt.length.toLocaleString()} chars
                        </span>
                      </div>
                      <pre
                        className="p-2 rounded-lg text-[11px] font-mono overflow-auto"
                        style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF', maxHeight: '400px' }}
                      >
                        {promptPreview.system_prompt}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12" style={{ color: '#848E9C' }}>
                    <Eye className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">{language === 'zh' ? '点击生成 Prompt 预览' : 'Click to generate prompt preview'}</p>
                  </div>
                )}
              </div>
            ) : (
              /* AI Test Tab */
              <div className="p-3 space-y-3">
                {/* Controls */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" style={{ color: '#22c55e' }} />
                    <span className="text-xs font-medium" style={{ color: '#EAECEF' }}>{t('selectModel')}</span>
                  </div>
                  {aiModels.length > 0 ? (
                    <select
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                    >
                      {aiModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }}>
                      {t('noModel')}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                      className="px-2 py-1.5 rounded text-xs"
                      style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                    >
                      <option value="balanced">{t('balanced')}</option>
                      <option value="aggressive">{t('aggressive')}</option>
                      <option value="conservative">{t('conservative')}</option>
                    </select>
                    <button
                      onClick={runAiTest}
                      disabled={isRunningAiTest || !editingConfig || !selectedModelId}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      {isRunningAiTest ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('running')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t('runTest')}
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px]" style={{ color: '#848E9C' }}>{t('testNote')}</p>
                </div>

                {/* Test Results */}
                {aiTestResult ? (
                  <div className="space-y-3">
                    {aiTestResult.error ? (
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(246, 70, 93, 0.1)', border: '1px solid rgba(246, 70, 93, 0.3)' }}>
                        <p className="text-sm" style={{ color: '#F6465D' }}>{aiTestResult.error}</p>
                      </div>
                    ) : (
                      <>
                        {aiTestResult.duration_ms && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" style={{ color: '#848E9C' }} />
                            <span className="text-xs" style={{ color: '#848E9C' }}>
                              {t('duration')}: {(aiTestResult.duration_ms / 1000).toFixed(2)}s
                            </span>
                          </div>
                        )}

                        {/* User Prompt Input */}
                        {aiTestResult.user_prompt && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Terminal className="w-3 h-3" style={{ color: '#60a5fa' }} />
                              <span className="text-xs font-medium" style={{ color: '#EAECEF' }}>{t('userPrompt')} (Input)</span>
                            </div>
                            <pre
                              className="p-2 rounded-lg text-[10px] font-mono overflow-auto"
                              style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF', maxHeight: '200px' }}
                            >
                              {aiTestResult.user_prompt}
                            </pre>
                          </div>
                        )}

                        {/* AI Reasoning */}
                        {aiTestResult.reasoning && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Sparkles className="w-3 h-3" style={{ color: '#F0B90B' }} />
                              <span className="text-xs font-medium" style={{ color: '#EAECEF' }}>{t('reasoning')}</span>
                            </div>
                            <pre
                              className="p-2 rounded-lg text-[10px] font-mono overflow-auto whitespace-pre-wrap"
                              style={{ background: '#0B0E11', border: '1px solid rgba(240, 185, 11, 0.3)', color: '#EAECEF', maxHeight: '200px' }}
                            >
                              {aiTestResult.reasoning}
                            </pre>
                          </div>
                        )}

                        {/* AI Decisions */}
                        {aiTestResult.decisions && aiTestResult.decisions.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Activity className="w-3 h-3" style={{ color: '#22c55e' }} />
                              <span className="text-xs font-medium" style={{ color: '#EAECEF' }}>{t('decisions')}</span>
                            </div>
                            <pre
                              className="p-2 rounded-lg text-[10px] font-mono overflow-auto"
                              style={{ background: '#0B0E11', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#EAECEF', maxHeight: '200px' }}
                            >
                              {JSON.stringify(aiTestResult.decisions, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Raw AI Response */}
                        {aiTestResult.ai_response && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <FileText className="w-3 h-3" style={{ color: '#848E9C' }} />
                              <span className="text-xs font-medium" style={{ color: '#EAECEF' }}>{t('aiOutput')} (Raw)</span>
                            </div>
                            <pre
                              className="p-2 rounded-lg text-[10px] font-mono overflow-auto whitespace-pre-wrap"
                              style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF', maxHeight: '300px' }}
                            >
                              {aiTestResult.ai_response}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12" style={{ color: '#848E9C' }}>
                    <Play className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">{language === 'zh' ? '点击运行 AI 测试' : 'Click to run AI test'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrategyStudioPage
