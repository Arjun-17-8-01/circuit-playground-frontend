import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Zap, ZapOff } from 'lucide-react';
import { CircuitState } from './CircuitSimulator';

interface CircuitControlsProps {
  circuitState: CircuitState;
  onConnectionTypeChange: (type: 'series' | 'parallel') => void;
  onReset: () => void;
}

export const CircuitControls: React.FC<CircuitControlsProps> = ({
  circuitState,
  onConnectionTypeChange,
  onReset,
}) => {
  return (
    <div className="space-y-4">
      {/* Circuit Status */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {circuitState.isComplete ? (
              <Zap className="w-5 h-5 text-circuit-complete" />
            ) : (
              <ZapOff className="w-5 h-5 text-circuit-incomplete" />
            )}
            Circuit Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge 
            variant={circuitState.isComplete ? "default" : "destructive"}
            className={circuitState.isComplete ? "bg-circuit-complete" : "bg-circuit-incomplete"}
          >
            {circuitState.isComplete ? "COMPLETE" : "INCOMPLETE"}
          </Badge>
          
          {circuitState.isComplete && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Voltage:</span>
                <span className="font-mono text-primary">{circuitState.voltage}V</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current:</span>
                <span className="font-mono text-primary">{circuitState.current.toFixed(2)}A</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Type Controls */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Connection Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={circuitState.connectionType === 'series' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onConnectionTypeChange('series')}
              className="text-xs"
            >
              Series
            </Button>
            <Button
              variant={circuitState.connectionType === 'parallel' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onConnectionTypeChange('parallel')}
              className="text-xs"
            >
              Parallel
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {circuitState.connectionType === 'series' 
              ? "Components share the same current"
              : "Components share the same voltage"
            }
          </div>
        </CardContent>
      </Card>

      {/* Circuit Calculations */}
      {circuitState.components.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Calculations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {circuitState.totalResistance > 0 && (
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Resistance:</span>
                  <span className="font-mono text-secondary">{circuitState.totalResistance.toFixed(2)}Ω</span>
                </div>
              </div>
            )}
            
            {circuitState.totalCapacitance > 0 && (
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Capacitance:</span>
                  <span className="font-mono text-secondary">{circuitState.totalCapacitance.toFixed(2)}μF</span>
                </div>
              </div>
            )}

            <Separator />
            
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">
                <strong>{circuitState.connectionType === 'series' ? 'Series' : 'Parallel'} Rules:</strong>
              </p>
              {circuitState.connectionType === 'series' ? (
                <div>
                  <p>R_total = R₁ + R₂ + ...</p>
                  <p>1/C_total = 1/C₁ + 1/C₂ + ...</p>
                </div>
              ) : (
                <div>
                  <p>1/R_total = 1/R₁ + 1/R₂ + ...</p>
                  <p>C_total = C₁ + C₂ + ...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Components */}
      {circuitState.components.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Connected Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {circuitState.components.map((component) => (
                <div key={component.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono">
                    {component.value}{component.unit}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {component.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReset}
        className="w-full"
        disabled={circuitState.components.length === 0}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset Circuit
      </Button>
    </div>
  );
};