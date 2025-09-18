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

export interface CircuitState {
  isComplete: boolean;
  components: Component[];
  connectionType: 'series' | 'parallel';
  totalResistance: number;
  totalCapacitance: number;
  current: number;
  voltage: number;
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

export const CircuitSimulator: React.FC = () => {
  const { toast } = useToast();
  const [circuitState, setCircuitState] = useState<CircuitState>({
    isComplete: false,
    components: [],
    connectionType: 'series',
    totalResistance: 0,
    totalCapacitance: 0,
    current: 0,
    voltage: 12, // 12V battery
  });

  const calculateCircuitValues = useCallback((components: Component[], connectionType: 'series' | 'parallel') => {
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

    return { totalResistance, totalCapacitance, current };
  }, [circuitState.voltage]);

  const handleComponentDrop = useCallback((componentTemplate: Omit<Component, 'id' | 'isConnected' | 'position'>, position: { x: number; y: number }) => {
    const newComponent: Component = {
      ...componentTemplate,
      id: `${componentTemplate.type}-${Date.now()}`,
      position,
      isConnected: true,
    };

    const updatedComponents = [...circuitState.components, newComponent];
    const { totalResistance, totalCapacitance, current } = calculateCircuitValues(updatedComponents, circuitState.connectionType);
    
    setCircuitState(prev => ({
      ...prev,
      components: updatedComponents,
      isComplete: updatedComponents.some(c => c.type === 'resistor' && c.isConnected) && 
                  updatedComponents.some(c => c.type === 'capacitor' && c.isConnected),
      totalResistance,
      totalCapacitance,
      current,
    }));

    toast({
      title: "Component Connected",
      description: `${componentTemplate.value}${componentTemplate.unit} ${componentTemplate.type} added to circuit`,
    });
  }, [circuitState, calculateCircuitValues, toast]);

  const handleComponentRemove = useCallback((componentId: string) => {
    const updatedComponents = circuitState.components.filter(c => c.id !== componentId);
    const { totalResistance, totalCapacitance, current } = calculateCircuitValues(updatedComponents, circuitState.connectionType);
    
    setCircuitState(prev => ({
      ...prev,
      components: updatedComponents,
      isComplete: updatedComponents.some(c => c.type === 'resistor' && c.isConnected) && 
                  updatedComponents.some(c => c.type === 'capacitor' && c.isConnected),
      totalResistance,
      totalCapacitance,
      current,
    }));

    toast({
      title: "Component Removed",
      description: "Component disconnected from circuit",
    });
  }, [circuitState.components, circuitState.connectionType, calculateCircuitValues, toast]);

  const handleConnectionTypeChange = useCallback((connectionType: 'series' | 'parallel') => {
    const { totalResistance, totalCapacitance, current } = calculateCircuitValues(circuitState.components, connectionType);
    
    setCircuitState(prev => ({
      ...prev,
      connectionType,
      totalResistance,
      totalCapacitance,
      current,
    }));
  }, [circuitState.components, calculateCircuitValues]);

  const handleReset = useCallback(() => {
    setCircuitState(prev => ({
      ...prev,
      components: [],
      isComplete: false,
      totalResistance: 0,
      totalCapacitance: 0,
      current: 0,
    }));
    
    toast({
      title: "Circuit Reset",
      description: "All components removed",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Electronic Circuit Simulator</h1>
          <p className="text-muted-foreground">
            Complete the circuit by connecting both a resistor and a capacitor to their respective gaps
          </p>
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
            <Card className="p-4 bg-card border-border">
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
              onConnectionTypeChange={handleConnectionTypeChange}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
};