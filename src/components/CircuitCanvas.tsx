import React, { useRef, useState, useCallback } from 'react';
import { Component, CircuitState } from './CircuitSimulator';

interface CircuitCanvasProps {
  circuitState: CircuitState;
  onComponentDrop: (component: Omit<Component, 'id' | 'isConnected' | 'position'>, position: { x: number; y: number }) => void;
  onComponentRemove: (componentId: string) => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuitState,
  onComponentDrop,
  onComponentRemove,
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [draggedComponent, setDraggedComponent] = useState<Omit<Component, 'id' | 'isConnected' | 'position'> | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedComponent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Check if drop is in the gap area (center of circuit)
    const gapArea = {
      x: 350,
      y: 180,
      width: 100,
      height: 40,
    };

    if (
      position.x >= gapArea.x &&
      position.x <= gapArea.x + gapArea.width &&
      position.y >= gapArea.y &&
      position.y <= gapArea.y + gapArea.height
    ) {
      onComponentDrop(draggedComponent, position);
    }

    setDraggedComponent(null);
  }, [draggedComponent, onComponentDrop]);

  // Enable drag and drop from external source
  React.useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const componentData = (e.target as HTMLElement)?.dataset?.component;
      if (componentData) {
        setDraggedComponent(JSON.parse(componentData));
      }
    };

    document.addEventListener('dragstart', handleDragStart);
    return () => document.removeEventListener('dragstart', handleDragStart);
  }, []);

  const renderBulb = () => (
    <g className={circuitState.isComplete ? 'bulb-glow' : ''}>
      <circle
        cx="150"
        cy="120"
        r="20"
        fill={circuitState.isComplete ? 'hsl(var(--bulb-on))' : 'hsl(var(--component-body))'}
        stroke="hsl(var(--circuit-copper))"
        strokeWidth="2"
        className={circuitState.isComplete ? 'component-pulse' : ''}
      />
      <text x="150" y="125" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">
        BULB
      </text>
    </g>
  );

  const renderMotor = () => (
    <g className={circuitState.isComplete ? '' : ''}>
      <rect
        x="130"
        y="250"
        width="40"
        height="30"
        fill={circuitState.isComplete ? 'hsl(var(--motor-active))' : 'hsl(var(--component-body))'}
        stroke="hsl(var(--circuit-copper))"
        strokeWidth="2"
        rx="5"
      />
      <circle
        cx="150"
        cy="265"
        r="8"
        fill="hsl(var(--circuit-copper))"
        className={circuitState.isComplete ? 'motor-spin' : ''}
      />
      <text x="150" y="295" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">
        MOTOR
      </text>
    </g>
  );

  const renderBattery = () => (
    <g>
      <rect x="50" y="180" width="30" height="40" fill="hsl(var(--component-body))" stroke="hsl(var(--circuit-copper))" strokeWidth="2" rx="3" />
      <text x="65" y="200" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8">12V</text>
      <text x="65" y="210" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8">+</text>
      <text x="35" y="210" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12">−</text>
    </g>
  );

  const renderCircuitTraces = () => (
    <g stroke="hsl(var(--circuit-trace))" strokeWidth="3" fill="none">
      {/* Battery to bulb */}
      <path
        d="M 80 200 L 130 200 L 130 120"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
      
      {/* Bulb to gap */}
      <path
        d="M 170 120 L 350 120 L 350 200"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
      
      {/* Gap area - dashed red line when incomplete */}
      <path
        d="M 350 200 L 450 200"
        stroke={circuitState.isComplete ? 'hsl(var(--circuit-trace))' : 'hsl(var(--circuit-incomplete))'}
        strokeDasharray="10,5"
        className={!circuitState.isComplete ? 'gap-pulse' : circuitState.isComplete ? 'current-flow circuit-glow' : ''}
      />
      
      {/* After gap to motor */}
      <path
        d="M 450 200 L 500 200 L 500 265 L 170 265"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
      
      {/* Motor back to battery */}
      <path
        d="M 130 265 L 30 265 L 30 200 L 50 200"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
    </g>
  );

  const renderGapIndicator = () => (
    <g>
      <rect
        x="350"
        y="180"
        width="100"
        height="40"
        fill="hsl(var(--circuit-gap) / 0.1)"
        stroke="hsl(var(--circuit-gap))"
        strokeWidth="2"
        strokeDasharray="5,5"
        rx="5"
        className="gap-pulse"
      />
      <text x="400" y="200" textAnchor="middle" fill="hsl(var(--circuit-gap))" fontSize="12" fontWeight="bold">
        DROP
      </text>
      <text x="400" y="212" textAnchor="middle" fill="hsl(var(--circuit-gap))" fontSize="12" fontWeight="bold">
        HERE
      </text>
    </g>
  );

  const renderComponents = () => (
    <g>
      {circuitState.components.map((component) => (
        <g key={component.id} transform={`translate(${component.position?.x || 0}, ${component.position?.y || 0})`}>
          {component.type === 'resistor' ? (
            <g>
              <rect
                x="-20"
                y="-8"
                width="40"
                height="16"
                fill="hsl(var(--component-active))"
                stroke="hsl(var(--circuit-copper))"
                strokeWidth="2"
                rx="2"
                className="circuit-glow"
              />
              <text x="0" y="4" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontWeight="bold">
                {component.value}Ω
              </text>
            </g>
          ) : (
            <g>
              <rect x="-15" y="-8" width="30" height="16" fill="hsl(var(--component-active))" stroke="hsl(var(--circuit-copper))" strokeWidth="2" rx="2" className="circuit-glow" />
              <rect x="-12" y="-5" width="24" height="2" fill="hsl(var(--circuit-copper))" />
              <rect x="-12" y="3" width="24" height="2" fill="hsl(var(--circuit-copper))" />
              <text x="0" y="25" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontWeight="bold">
                {component.value}μF
              </text>
            </g>
          )}
          <circle
            cx="0"
            cy="0"
            r="12"
            fill="transparent"
            className="cursor-pointer hover:fill-red-500/20"
            onClick={() => onComponentRemove(component.id)}
          />
        </g>
      ))}
    </g>
  );

  return (
    <div className="w-full h-96 bg-component-body rounded-lg border-2 border-border">
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox="0 0 600 350"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-full h-full"
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {renderCircuitTraces()}
        {renderBattery()}
        {renderBulb()}
        {renderMotor()}
        {!circuitState.isComplete && renderGapIndicator()}
        {renderComponents()}
      </svg>
    </div>
  );
};