import React, { useState, useCallback } from 'react';
import { CircuitCanvas } from './CircuitCanvas';
import { ComponentToolbox } from './ComponentToolbox';
import { CircuitControls } from './CircuitControls';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export interface Component {
  id: string;
  type: 'resistor' | 'capacitor';
  value: number;
  unit: 'Ω' | 'μF';
  position?: { x: number; y: number };
  isConnected: boolean;
}

export interface Level {
  id: number;
  correctResistor: number;
  correctCapacitor: number;
  title: string;
  description: string;
}

export interface CircuitState {
  isComplete: boolean;
  components: Component[];
  connectionType: 'series' | 'parallel';
  totalResistance: number;
  totalCapacitance: number;
  current: number;
  voltage: number;
  currentLevel: number;
  isCorrectCombination: boolean;
}

const availableComponents: Omit<Component, 'id' | 'isConnected' | 'position'>[] = [
  { type: 'resistor', value: 2, unit: 'Ω' },
  { type: 'resistor', value: 3, unit: 'Ω' },
  { type: 'resistor', value: 5, unit: 'Ω' },
  { type: 'resistor', value: 10, unit: 'Ω' },
  { type: 'capacitor', value: 2, unit: 'μF' },
  { type: 'capacitor', value: 3, unit: 'μF' },
  { type: 'capacitor', value: 5, unit: 'μF' },
  { type: 'capacitor', value: 10, unit: 'μF' },
];

const levels: Level[] = [
  { id: 1, correctResistor: 2, correctCapacitor: 2, title: "Basic Circuit", description: "Connect 2Ω resistor and 2μF capacitor" },
  { id: 2, correctResistor: 3, correctCapacitor: 2, title: "Voltage Drop", description: "Connect 3Ω resistor and 2μF capacitor" },
  { id: 3, correctResistor: 2, correctCapacitor: 3, title: "Capacitance Control", description: "Connect 2Ω resistor and 3μF capacitor" },
  { id: 4, correctResistor: 5, correctCapacitor: 2, title: "Higher Resistance", description: "Connect 5Ω resistor and 2μF capacitor" },
  { id: 5, correctResistor: 2, correctCapacitor: 5, title: "Energy Storage", description: "Connect 2Ω resistor and 5μF capacitor" },
  { id: 6, correctResistor: 3, correctCapacitor: 3, title: "Balanced Circuit", description: "Connect 3Ω resistor and 3μF capacitor" },
  { id: 7, correctResistor: 10, correctCapacitor: 2, title: "High Resistance", description: "Connect 10Ω resistor and 2μF capacitor" },
  { id: 8, correctResistor: 2, correctCapacitor: 10, title: "Maximum Storage", description: "Connect 2Ω resistor and 10μF capacitor" },
  { id: 9, correctResistor: 5, correctCapacitor: 3, title: "Mid-Range Circuit", description: "Connect 5Ω resistor and 3μF capacitor" },
  { id: 10, correctResistor: 3, correctCapacitor: 5, title: "Asymmetric Load", description: "Connect 3Ω resistor and 5μF capacitor" },
  { id: 11, correctResistor: 10, correctCapacitor: 3, title: "Power Efficiency", description: "Connect 10Ω resistor and 3μF capacitor" },
  { id: 12, correctResistor: 3, correctCapacitor: 10, title: "Large Capacitance", description: "Connect 3Ω resistor and 10μF capacitor" },
  { id: 13, correctResistor: 5, correctCapacitor: 5, title: "Perfect Balance", description: "Connect 5Ω resistor and 5μF capacitor" },
  { id: 14, correctResistor: 10, correctCapacitor: 5, title: "Advanced Circuit", description: "Connect 10Ω resistor and 5μF capacitor" },
  { id: 15, correctResistor: 10, correctCapacitor: 10, title: "Master Circuit", description: "Connect 10Ω resistor and 10μF capacitor" },
];

interface CircuitSimulatorProps {
  onLevelComplete?: (level: number, timeSpent: number, attempts: number) => void;
}

export const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({ onLevelComplete }) => {
  const { toast } = useToast();
  const [circuitState, setCircuitState] = useState<CircuitState>({
    isComplete: false,
    components: [],
    connectionType: 'series',
    totalResistance: 0,
    totalCapacitance: 0,
    current: 0,
    voltage: 12, // 12V battery
    currentLevel: 1,
    isCorrectCombination: false,
  });

  const [gameStats, setGameStats] = useState({
    startTime: Date.now(),
    attempts: 0,
    levelStartTime: Date.now()
  });

  const checkCorrectCombination = useCallback((components: Component[], currentLevel: number) => {
    const resistor = components.find(c => c.type === 'resistor' && c.isConnected);
    const capacitor = components.find(c => c.type === 'capacitor' && c.isConnected);
    const level = levels.find(l => l.id === currentLevel);
    
    if (!resistor || !capacitor || !level) return false;
    
    return resistor.value === level.correctResistor && capacitor.value === level.correctCapacitor;
  }, []);

  const calculateCircuitValues = useCallback((components: Component[], connectionType: 'series' | 'parallel', currentLevel: number) => {
    const resistors = components.filter(c => c.type === 'resistor' && c.isConnected);
    const capacitors = components.filter(c => c.type === 'capacitor' && c.isConnected);
    
    let totalResistance = 0;
    let totalCapacitance = 0;

    if (resistors.length > 0) {
      if (connectionType === 'series') {
        totalResistance = resistors.reduce((sum, r) => sum + r.value, 0);
      } else {
        const reciprocalSum = resistors.reduce((sum, r) => sum + (1 / r.value), 0);
        totalResistance = 1 / reciprocalSum;
      }
    }

    if (capacitors.length > 0) {
      if (connectionType === 'series') {
        const reciprocalSum = capacitors.reduce((sum, c) => sum + (1 / c.value), 0);
        totalCapacitance = 1 / reciprocalSum;
      } else {
        totalCapacitance = capacitors.reduce((sum, c) => sum + c.value, 0);
      }
    }

    const current = totalResistance > 0 ? circuitState.voltage / totalResistance : 0;
    const isCorrectCombination = checkCorrectCombination(components, currentLevel);

    return { totalResistance, totalCapacitance, current, isCorrectCombination };
  }, [circuitState.voltage, checkCorrectCombination]);

  const handleComponentDrop = useCallback((componentTemplate: Omit<Component, 'id' | 'isConnected' | 'position'>, position: { x: number; y: number }) => {
    const newComponent: Component = {
      ...componentTemplate,
      id: `${componentTemplate.type}-${Date.now()}`,
      position,
      isConnected: true,
    };

    const updatedComponents = [...circuitState.components, newComponent];
    const { totalResistance, totalCapacitance, current, isCorrectCombination } = calculateCircuitValues(updatedComponents, circuitState.connectionType, circuitState.currentLevel);
    
    const hasResistor = updatedComponents.some(c => c.type === 'resistor' && c.isConnected);
    const hasCapacitor = updatedComponents.some(c => c.type === 'capacitor' && c.isConnected);
    const isLevelComplete = hasResistor && hasCapacitor && isCorrectCombination;
    
    setCircuitState(prev => ({
      ...prev,
      components: updatedComponents,
      isComplete: isLevelComplete,
      isCorrectCombination,
      totalResistance,
      totalCapacitance,
      current,
    }));

    // Track attempts for scoring
    setGameStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));

    // Handle level completion
    if (isLevelComplete && onLevelComplete) {
      const timeSpent = Math.floor((Date.now() - gameStats.levelStartTime) / 1000);
      onLevelComplete(circuitState.currentLevel, timeSpent, gameStats.attempts + 1);
    }

    toast({
      title: "Component Connected",
      description: `${componentTemplate.value}${componentTemplate.unit} ${componentTemplate.type} added to circuit`,
    });
  }, [circuitState, calculateCircuitValues, gameStats, onLevelComplete, toast]);

  const handleComponentRemove = useCallback((componentId: string) => {
    const updatedComponents = circuitState.components.filter(c => c.id !== componentId);
    const { totalResistance, totalCapacitance, current, isCorrectCombination } = calculateCircuitValues(updatedComponents, circuitState.connectionType, circuitState.currentLevel);
    
    const hasResistor = updatedComponents.some(c => c.type === 'resistor' && c.isConnected);
    const hasCapacitor = updatedComponents.some(c => c.type === 'capacitor' && c.isConnected);
    
    setCircuitState(prev => ({
      ...prev,
      components: updatedComponents,
      isComplete: hasResistor && hasCapacitor && isCorrectCombination,
      isCorrectCombination,
      totalResistance,
      totalCapacitance,
      current,
    }));

    toast({
      title: "Component Removed",
      description: "Component disconnected from circuit",
    });
  }, [circuitState.components, circuitState.connectionType, circuitState.currentLevel, calculateCircuitValues, toast]);

  const handleConnectionTypeChange = useCallback((connectionType: 'series' | 'parallel') => {
    const { totalResistance, totalCapacitance, current, isCorrectCombination } = calculateCircuitValues(circuitState.components, connectionType, circuitState.currentLevel);
    
    const hasResistor = circuitState.components.some(c => c.type === 'resistor' && c.isConnected);
    const hasCapacitor = circuitState.components.some(c => c.type === 'capacitor' && c.isConnected);
    
    setCircuitState(prev => ({
      ...prev,
      connectionType,
      isComplete: hasResistor && hasCapacitor && isCorrectCombination,
      isCorrectCombination,
      totalResistance,
      totalCapacitance,
      current,
    }));
  }, [circuitState.components, circuitState.currentLevel, calculateCircuitValues]);

  const handleReset = useCallback(() => {
    setCircuitState(prev => ({
      ...prev,
      components: [],
      isComplete: false,
      isCorrectCombination: false,
      totalResistance: 0,
      totalCapacitance: 0,
      current: 0,
    }));
    
    toast({
      title: "Circuit Reset",
      description: "All components removed",
    });
  }, [toast]);

  const handleLevelChange = useCallback((newLevel: number) => {
    setCircuitState(prev => ({
      ...prev,
      currentLevel: newLevel,
      components: [],
      isComplete: false,
      isCorrectCombination: false,
      totalResistance: 0,
      totalCapacitance: 0,
      current: 0,
    }));
    
    // Reset game stats for new level
    setGameStats({
      startTime: Date.now(),
      attempts: 0,
      levelStartTime: Date.now()
    });
    
    toast({
      title: `Level ${newLevel}`,
      description: levels.find(l => l.id === newLevel)?.description || "",
    });
  }, [toast]);

  const handleNextLevel = useCallback(() => {
    if (circuitState.currentLevel < levels.length && circuitState.isComplete) {
      handleLevelChange(circuitState.currentLevel + 1);
    }
  }, [circuitState.currentLevel, circuitState.isComplete, handleLevelChange]);

  const currentLevelData = levels.find(l => l.id === circuitState.currentLevel);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Electronic Circuit Simulator</h1>
              <p className="text-muted-foreground">
                Level {circuitState.currentLevel} of {levels.length}: {currentLevelData?.title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="text-lg font-bold text-primary">{circuitState.currentLevel}/{levels.length}</div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-700 mb-2">Objective:</h3>
            <p className="text-gray-600">{currentLevelData?.description}</p>
            {!circuitState.isCorrectCombination && circuitState.components.length > 0 && (
              <p className="text-red-600 mt-2 text-sm">⚠️ Wrong combination! Try different components.</p>
            )}
            {circuitState.isComplete && (
              <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-md">
                <p className="text-green-700 font-semibold mb-2">✅ Level Complete!</p>
                <p className="text-green-600 text-sm mb-2">
                  Time: {Math.floor((Date.now() - gameStats.levelStartTime) / 1000)}s | Attempts: {gameStats.attempts}
                </p>
                {circuitState.currentLevel < levels.length && (
                  <button
                    onClick={handleNextLevel}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Next Level →
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Component Toolbox */}
          <div className="lg:col-span-1">
            <ComponentToolbox
              components={availableComponents}
              onComponentSelect={(component) => {
                // Component will be dropped on canvas
              }}
            />
          </div>

          {/* Main Circuit Canvas */}
          <div className="lg:col-span-2">
            <Card className="p-4 bg-white border-gray-200 shadow-md">
              <CircuitCanvas
                circuitState={circuitState}
                onComponentDrop={handleComponentDrop}
                onComponentRemove={handleComponentRemove}
              />
            </Card>
          </div>

          {/* Controls and Information */}
          <div className="lg:col-span-1">
            <CircuitControls
              circuitState={circuitState}
              levels={levels}
              onConnectionTypeChange={handleConnectionTypeChange}
              onReset={handleReset}
              onLevelChange={handleLevelChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};