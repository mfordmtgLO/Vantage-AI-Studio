import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Share2, 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Download, 
  Brain, 
  FileText, 
  Layers, 
  User, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Compass,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { UserMemory, GraphNode, GraphEdge } from '../types';

interface KnowledgeGraphExplorerProps {
  memories: UserMemory[];
  onSelectMemory?: (memory: UserMemory) => void;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface SimEdge {
  source: SimNode;
  target: SimNode;
  weight: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  knowledge: '#3b82f6', // blue
  instruction: '#8b5cf6', // purple
  workflow: '#10b981', // emerald
  persona: '#f59e0b', // amber
  file_extracted: '#ec4899', // pink
  url_scrape: '#06b6d4', // cyan
  conversation_insight: '#6366f1', // indigo
  tag: '#64748b' // slate
};

export const KnowledgeGraphExplorer: React.FC<KnowledgeGraphExplorerProps> = ({
  memories,
  onSelectMemory
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [draggedNode, setDraggedNode] = useState<SimNode | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);

  // Build Graph Nodes & Edges from Memories
  const { nodes, edges } = useMemo(() => {
    const rawNodes: GraphNode[] = [];
    const tagMap = new Map<string, string[]>(); // tag -> list of memoryIds

    memories.forEach(m => {
      const typeColor = CATEGORY_COLORS[m.type] || '#6366f1';
      rawNodes.push({
        id: m.id,
        title: m.title,
        type: m.type,
        category: m.category,
        tags: m.tags || [],
        val: Math.max(6, Math.min(18, (m.content?.length || 100) / 80 + (m.temporal?.accessCount || 1))),
        color: typeColor,
        createdAt: m.createdAt,
        isPinned: !!m.temporal?.isPinnedImmortal
      });

      // Index tags for co-occurrence edges
      (m.tags || []).forEach(t => {
        const cleanTag = t.toLowerCase().trim();
        if (!tagMap.has(cleanTag)) {
          tagMap.set(cleanTag, []);
        }
        tagMap.get(cleanTag)!.push(m.id);
      });
    });

    // Build edges based on shared tags & direct category relationships
    const edgeList: GraphEdge[] = [];
    const edgeKeySet = new Set<string>();

    tagMap.forEach((memIds, tag) => {
      if (memIds.length > 1) {
        for (let i = 0; i < memIds.length; i++) {
          for (let j = i + 1; j < memIds.length; j++) {
            const idA = memIds[i];
            const idB = memIds[j];
            const key = idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;
            if (!edgeKeySet.has(key)) {
              edgeKeySet.add(key);
              edgeList.push({
                source: idA,
                target: idB,
                weight: 1,
                label: tag
              });
            }
          }
        }
      }
    });

    return { nodes: rawNodes, edges: edgeList };
  }, [memories]);

  // Simulation state refs
  const simNodesRef = useRef<SimNode[]>([]);
  const simEdgesRef = useRef<SimEdge[]>([]);

  // Initialize simulation coordinates
  useEffect(() => {
    const width = 800;
    const height = 500;
    const nodeMap = new Map<string, SimNode>();

    const simNodes: SimNode[] = nodes.map((n, i) => {
      const angle = (i / Math.max(1, nodes.length)) * 2 * Math.PI;
      const radius = 120 + Math.random() * 80;
      const simNode: SimNode = {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: n.val
      };
      nodeMap.set(n.id, simNode);
      return simNode;
    });

    const simEdges: SimEdge[] = [];
    edges.forEach(e => {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (src && tgt) {
        simEdges.push({ source: src, target: tgt, weight: e.weight });
      }
    });

    simNodesRef.current = simNodes;
    simEdgesRef.current = simEdges;
  }, [nodes, edges]);

  // Force-Directed Physics & Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      const simNodes = simNodesRef.current;
      const simEdges = simEdgesRef.current;

      // 1. Apply Forces
      // Repulsion between all nodes
      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const a = simNodes[i];
          const b = simNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy + 10;
          const dist = Math.sqrt(distSq);
          const force = 400 / distSq;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (a !== draggedNode) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (b !== draggedNode) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      // Attraction along edges
      for (let i = 0; i < simEdges.length; i++) {
        const edge = simEdges[i];
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const desiredDist = 90;
        const springForce = (dist - desiredDist) * 0.015 * edge.weight;

        const fx = (dx / dist) * springForce;
        const fy = (dy / dist) * springForce;

        if (edge.source !== draggedNode) {
          edge.source.vx += fx;
          edge.source.vy += fy;
        }
        if (edge.target !== draggedNode) {
          edge.target.vx -= fx;
          edge.target.vy -= fy;
        }
      }

      // Center gravity & damping
      for (let i = 0; i < simNodes.length; i++) {
        const node = simNodes[i];
        if (node === draggedNode) continue;

        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * 0.003;
        node.vy += dy * 0.003;

        // Damping
        node.vx *= 0.88;
        node.vy *= 0.88;

        node.x += node.vx;
        node.y += node.vy;
      }

      // 2. Draw Frame
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Apply Pan & Zoom
      ctx.translate(panOffset.x + width / 2, panOffset.y + height / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-width / 2, -height / 2);

      // Draw Edges
      for (let i = 0; i < simEdges.length; i++) {
        const edge = simEdges[i];
        const isConnectedToSelected = 
          selectedNodeId === edge.source.id || selectedNodeId === edge.target.id;

        ctx.beginPath();
        ctx.moveTo(edge.source.x, edge.source.y);
        ctx.lineTo(edge.target.x, edge.target.y);
        ctx.strokeStyle = isConnectedToSelected 
          ? '#818cf8' 
          : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = isConnectedToSelected ? 2 : 1;
        ctx.stroke();
      }

      // Draw Nodes
      for (let i = 0; i < simNodes.length; i++) {
        const node = simNodes[i];
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const matchesQuery = !searchQuery || node.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || node.type === selectedType;

        const effectiveOpacity = (matchesQuery && matchesType) ? 1 : 0.2;

        ctx.save();
        ctx.globalAlpha = effectiveOpacity;

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected || isHovered ? 4 : 0), 0, Math.PI * 2);
        ctx.fillStyle = node.color || '#6366f1';
        ctx.fill();

        // Selection / Hover Ring
        if (isSelected || isHovered) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Immortal lock halo
        if (node.isPinned) {
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Label
        if (zoomLevel > 0.7 || isSelected || isHovered) {
          ctx.font = `${isSelected ? 'bold 11px' : '10px'} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(226, 232, 240, 0.9)';
          ctx.textAlign = 'center';
          ctx.fillText(
            node.title.length > 20 ? node.title.slice(0, 18) + '...' : node.title,
            node.x,
            node.y + node.radius + 13
          );
        }

        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [panOffset, zoomLevel, selectedNodeId, hoveredNode, searchQuery, selectedType, draggedNode]);

  // Convert canvas click coordinate to world space
  const screenToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    // Invert translate and scale
    const worldX = (rawX - panOffset.x - width / 2) / zoomLevel + width / 2;
    const worldY = (rawY - panOffset.y - height / 2) / zoomLevel + height / 2;

    return { x: worldX, y: worldY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const hit = simNodesRef.current.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (hit) {
      setDraggedNode(hit);
      setSelectedNodeId(hit.id);
      const matchedMemory = memories.find(m => m.id === hit.id);
      if (matchedMemory && onSelectMemory) {
        onSelectMemory(matchedMemory);
      }
    } else {
      setIsDraggingCanvas(true);
      setDragStartPos({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);

    if (draggedNode) {
      draggedNode.x = x;
      draggedNode.y = y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      return;
    }

    if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStartPos.x,
        y: e.clientY - dragStartPos.y
      });
      return;
    }

    // Check hover
    const hit = simNodesRef.current.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });
    setHoveredNode(hit || null);
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsDraggingCanvas(false);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleExportJson = () => {
    const data = {
      nodes: nodes,
      edges: edges,
      exportedAt: new Date().toISOString(),
      generator: 'Vantage AI 2nd Brain Knowledge Graph Visualizer'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vantage-2nd-brain-knowledge-graph.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `vantage-2nd-brain-graph-snapshot.png`;
    a.click();
  };

  const activeSelectedMemory = memories.find(m => m.id === selectedNodeId);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold">
              Obsidian-Style Interactive Knowledge Graph Visualizer
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time force-directed synaptic canvas mapping associative connections between memories, tags, personas, and entities.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleExportPng}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PNG</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Controls Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Canvas Container (3 cols) */}
        <div 
          ref={containerRef}
          className="lg:col-span-3 relative h-[560px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between"
        >
          {/* Top Canvas Controls Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
            {/* Search Box */}
            <div className="relative w-48 sm:w-60 pointer-events-auto">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Highlight node or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-xs border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 pointer-events-auto overflow-x-auto scrollbar-none text-[11px] font-semibold bg-slate-900/90 backdrop-blur-xs p-1 rounded-xl border border-slate-700">
              {['all', 'knowledge', 'instruction', 'workflow', 'persona'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2 py-0.5 rounded-lg capitalize transition cursor-pointer ${
                    selectedType === type
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Zoom / Pan Controls */}
            <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/90 backdrop-blur-xs p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.2))}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <canvas
            ref={canvasRef}
            width={850}
            height={560}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* Bottom Graph Legend */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300">
            <span className="font-bold uppercase text-slate-400">Legend:</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Knowledge</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Instruction</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Workflow</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Persona</span>
          </div>
        </div>

        {/* Right Inspector & Node Diagnostics (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                Node Inspector
              </span>
              <span className="text-[11px] text-slate-400">
                {nodes.length} Nodes • {edges.length} Synapses
              </span>
            </div>

            {activeSelectedMemory ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {activeSelectedMemory.type}
                    </span>
                    {activeSelectedMemory.temporal?.isPinnedImmortal && (
                      <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Immortal
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {activeSelectedMemory.title}
                  </h3>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed">
                    {activeSelectedMemory.content}
                  </p>
                </div>

                {/* Vector Tags */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Connected Synaptic Tags:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeSelectedMemory.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Graph Topology Density */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Synaptic Degree:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {edges.filter(e => e.source === activeSelectedMemory.id || e.target === activeSelectedMemory.id).length} Links
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Access Recalls:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {activeSelectedMemory.temporal?.accessCount || 1}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <Brain className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p>Click any node or drag on the canvas to inspect neural connections.</p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1 text-indigo-600 dark:text-indigo-400" />
            Nodes with shared tags automatically pull toward each other to form thematic synaptic clusters.
          </div>
        </div>
      </div>
    </div>
  );
};
