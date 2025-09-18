import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Component } from './CircuitSimulator';

interface ComponentToolboxProps {
  components: Omit<Component, 'id' | 'isConnected' | 'position'>[];
  onComponentSelect: (component: Omit<Component, 'id' | 'isConnected' | 'position'>) => void;
}

export const ComponentToolbox: React.FC<ComponentToolboxProps> = ({
  components,
  onComponentSelect,
}) => {
  const resistors = components.filter(c => c.type === 'resistor');
  const capacitors = components.filter(c => c.type === 'capacitor');

  const renderComponentItem = (component: Omit<Component, 'id' | 'isConnected' | 'position'>) => (
    <div
      key={`${component.type}-${component.value}`}
      className="p-3 border border-border rounded-lg bg-component-body hover:bg-component-active/20 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-primary"
      draggable
      data-component={JSON.stringify(component)}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(component));
        onComponentSelect(component);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {component.type === 'resistor' ? (
            <div className="w-8 h-4 bg-secondary rounded border border-circuit-copper"></div>
          ) : (
            <div className="relative">
              <div className="w-6 h-4 bg-secondary rounded border border-circuit-copper"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-0.5 bg-circuit-copper"></div>
              <div className="absolute bottom-0.5 left-0.5 w-5 h-0.5 bg-circuit-copper"></div>
            </div>
          )}
          <span className="font-mono text-sm">
            {component.value}{component.unit}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {component.type}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary">Component Toolbox</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag resistors to the top gap and capacitors to the bottom gap
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-circuit-copper mb-2">Resistors</h3>
            <div className="space-y-2">
              {resistors.map(renderComponentItem)}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-circuit-copper mb-2">Capacitors</h3>
            <div className="space-y-2">
              {capacitors.map(renderComponentItem)}
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-xs font-semibold text-foreground mb-1">Instructions:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Drag resistors to the top gap</li>
              <li>• Drag capacitors to the bottom gap</li>
              <li>• Click components to remove them</li>
              <li>• Circuit completes when both gaps are filled</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};