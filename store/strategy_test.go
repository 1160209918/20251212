package store

import (
	"encoding/json"
	"testing"
)

// TestRiskControlConfigSerialization tests that all 20 risk control parameters can be serialized and deserialized correctly
func TestRiskControlConfigSerialization(t *testing.T) {
	// Create a config with all 20 parameters set
	baseCapitalRatio := 0.02
	antiMartingaleProfitConversion := 0.9
	antiMartingaleUsageRatio := 0.3
	antiMartingalePoolLimit := 0.5
	minStopLossPct := 0.003
	maxStopLossPct := 0.05
	maxDailyTrades := 8
	totalLossCircuitBreaker := 0.15
	addPositionProfitInterval := 0.5
	addPositionRatio := 0.1
	addPositionCumulativeLimit := 2.0
	addPositionSafetyMargin := 0.005
	reducePositionRatio := 0.3

	original := RiskControlConfig{
		// Basic 8 parameters
		MaxPositions:       3,
		BTCETHMaxLeverage:  10,
		AltcoinMaxLeverage: 5,
		MinRiskRewardRatio: 3.0,
		MaxMarginUsage:     0.8,
		MaxPositionRatio:   1.5,
		MinPositionSize:    12,
		MinConfidence:      70,
		// Advanced 13 parameters (using pointers to support undefined/null)
		BaseCapitalRatio:               &baseCapitalRatio,
		AntiMartingaleProfitConversion: &antiMartingaleProfitConversion,
		AntiMartingaleUsageRatio:       &antiMartingaleUsageRatio,
		AntiMartingalePoolLimit:        &antiMartingalePoolLimit,
		MinStopLossPct:                 &minStopLossPct,
		MaxStopLossPct:                 &maxStopLossPct,
		MaxDailyTrades:                 &maxDailyTrades,
		TotalLossCircuitBreaker:        &totalLossCircuitBreaker,
		AddPositionProfitInterval:      &addPositionProfitInterval,
		AddPositionRatio:               &addPositionRatio,
		AddPositionCumulativeLimit:     &addPositionCumulativeLimit,
		AddPositionSafetyMargin:        &addPositionSafetyMargin,
		ReducePositionRatio:            &reducePositionRatio,
	}

	// Serialize to JSON
	jsonData, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("Failed to marshal config: %v", err)
	}

	t.Logf("Serialized JSON: %s", string(jsonData))

	// Deserialize back
	var deserialized RiskControlConfig
	if err := json.Unmarshal(jsonData, &deserialized); err != nil {
		t.Fatalf("Failed to unmarshal config: %v", err)
	}

	// Verify all 20 parameters are preserved
	if deserialized.MaxPositions != original.MaxPositions {
		t.Errorf("MaxPositions mismatch: got %d, want %d", deserialized.MaxPositions, original.MaxPositions)
	}
	if deserialized.BTCETHMaxLeverage != original.BTCETHMaxLeverage {
		t.Errorf("BTCETHMaxLeverage mismatch: got %d, want %d", deserialized.BTCETHMaxLeverage, original.BTCETHMaxLeverage)
	}
	if deserialized.AltcoinMaxLeverage != original.AltcoinMaxLeverage {
		t.Errorf("AltcoinMaxLeverage mismatch: got %d, want %d", deserialized.AltcoinMaxLeverage, original.AltcoinMaxLeverage)
	}
	if deserialized.MinRiskRewardRatio != original.MinRiskRewardRatio {
		t.Errorf("MinRiskRewardRatio mismatch: got %f, want %f", deserialized.MinRiskRewardRatio, original.MinRiskRewardRatio)
	}
	if deserialized.MaxMarginUsage != original.MaxMarginUsage {
		t.Errorf("MaxMarginUsage mismatch: got %f, want %f", deserialized.MaxMarginUsage, original.MaxMarginUsage)
	}
	if deserialized.MaxPositionRatio != original.MaxPositionRatio {
		t.Errorf("MaxPositionRatio mismatch: got %f, want %f", deserialized.MaxPositionRatio, original.MaxPositionRatio)
	}
	if deserialized.MinPositionSize != original.MinPositionSize {
		t.Errorf("MinPositionSize mismatch: got %f, want %f", deserialized.MinPositionSize, original.MinPositionSize)
	}
	if deserialized.MinConfidence != original.MinConfidence {
		t.Errorf("MinConfidence mismatch: got %d, want %d", deserialized.MinConfidence, original.MinConfidence)
	}

	// Verify advanced parameters (13 new ones)
	if deserialized.BaseCapitalRatio == nil || *deserialized.BaseCapitalRatio != *original.BaseCapitalRatio {
		t.Errorf("BaseCapitalRatio mismatch")
	}
	if deserialized.AntiMartingaleProfitConversion == nil || *deserialized.AntiMartingaleProfitConversion != *original.AntiMartingaleProfitConversion {
		t.Errorf("AntiMartingaleProfitConversion mismatch")
	}
	if deserialized.AntiMartingaleUsageRatio == nil || *deserialized.AntiMartingaleUsageRatio != *original.AntiMartingaleUsageRatio {
		t.Errorf("AntiMartingaleUsageRatio mismatch")
	}
	if deserialized.AntiMartingalePoolLimit == nil || *deserialized.AntiMartingalePoolLimit != *original.AntiMartingalePoolLimit {
		t.Errorf("AntiMartingalePoolLimit mismatch")
	}
	if deserialized.MinStopLossPct == nil || *deserialized.MinStopLossPct != *original.MinStopLossPct {
		t.Errorf("MinStopLossPct mismatch")
	}
	if deserialized.MaxStopLossPct == nil || *deserialized.MaxStopLossPct != *original.MaxStopLossPct {
		t.Errorf("MaxStopLossPct mismatch")
	}
	if deserialized.MaxDailyTrades == nil || *deserialized.MaxDailyTrades != *original.MaxDailyTrades {
		t.Errorf("MaxDailyTrades mismatch")
	}
	if deserialized.TotalLossCircuitBreaker == nil || *deserialized.TotalLossCircuitBreaker != *original.TotalLossCircuitBreaker {
		t.Errorf("TotalLossCircuitBreaker mismatch")
	}
	if deserialized.AddPositionProfitInterval == nil || *deserialized.AddPositionProfitInterval != *original.AddPositionProfitInterval {
		t.Errorf("AddPositionProfitInterval mismatch")
	}
	if deserialized.AddPositionRatio == nil || *deserialized.AddPositionRatio != *original.AddPositionRatio {
		t.Errorf("AddPositionRatio mismatch")
	}
	if deserialized.AddPositionCumulativeLimit == nil || *deserialized.AddPositionCumulativeLimit != *original.AddPositionCumulativeLimit {
		t.Errorf("AddPositionCumulativeLimit mismatch")
	}
	if deserialized.AddPositionSafetyMargin == nil || *deserialized.AddPositionSafetyMargin != *original.AddPositionSafetyMargin {
		t.Errorf("AddPositionSafetyMargin mismatch")
	}
	if deserialized.ReducePositionRatio == nil || *deserialized.ReducePositionRatio != *original.ReducePositionRatio {
		t.Errorf("ReducePositionRatio mismatch")
	}

	t.Log("✅ All 20 risk control parameters serialized and deserialized correctly!")
}

// TestRiskControlConfigPartialParameters tests that undefined parameters are handled correctly
func TestRiskControlConfigPartialParameters(t *testing.T) {
	// Create a config with only basic parameters (advanced parameters undefined)
	original := RiskControlConfig{
		MaxPositions:       3,
		BTCETHMaxLeverage:  10,
		AltcoinMaxLeverage: 5,
		MinRiskRewardRatio: 3.0,
		MaxMarginUsage:     0.8,
		MaxPositionRatio:   1.5,
		MinPositionSize:    12,
		MinConfidence:      70,
		// All advanced parameters are nil (undefined)
	}

	// Serialize to JSON
	jsonData, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("Failed to marshal config: %v", err)
	}

	t.Logf("Serialized JSON (partial): %s", string(jsonData))

	// Deserialize back
	var deserialized RiskControlConfig
	if err := json.Unmarshal(jsonData, &deserialized); err != nil {
		t.Fatalf("Failed to unmarshal config: %v", err)
	}

	// Verify basic parameters are preserved
	if deserialized.MaxPositions != original.MaxPositions {
		t.Errorf("MaxPositions mismatch: got %d, want %d", deserialized.MaxPositions, original.MaxPositions)
	}

	// Verify advanced parameters are nil (undefined)
	if deserialized.BaseCapitalRatio != nil {
		t.Errorf("BaseCapitalRatio should be nil, got %v", *deserialized.BaseCapitalRatio)
	}
	if deserialized.MaxDailyTrades != nil {
		t.Errorf("MaxDailyTrades should be nil, got %v", *deserialized.MaxDailyTrades)
	}

	t.Log("✅ Partial parameters (undefined values) handled correctly!")
}