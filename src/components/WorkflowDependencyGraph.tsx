import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  FileText,
  Mail,
  Calendar,
  Globe,
  CheckCircle2,
  Share2,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'scrape_url' | 'ai_synthesize' | 'docs_create' | 'gmail_draft' | 'calendar_event';
  config: {
    url?: string;
    prompt?: string;
    recipient?: string;
    subject?: string;
    docTitle?: string;
    eventTitle?: string;
  };
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

interface WorkflowDependencyGraphProps {
  currentWorkflowName: string;
  currentSteps: WorkflowStep[];
  savedTemplates: WorkflowTemplate[];
  onLoadWorkflow: (template: WorkflowTemplate) => void;
  onRunWorkflow?: () => void;
}

// Graph Node definition
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  nodeType: 'workflow' | 'resource_ai' | 'resource_docs' | 'resource_gmail' | 'resource_calendar' | 'resource_web';
  category: 'workflow' | 'resource';
  isCurrent?: boolean;
  stepCount?: number;
  description?: string;
  details?: {
    resourceType?: string;
    connectedWorkflowsCount?: number;
    steps?: WorkflowStep[];
    configValue?: string;
  };
  radius: number;
}

// Graph Link definition
export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  relationType: 'produces' | 'consumes' | 'triggers' | 'shares';
  label: string;
}

export const WorkflowDependencyGraph: React.FC<WorkflowDependencyGraphProps> = ({
  currentWorkflowName,
  currentSteps,
  savedTemplates,
  onLoadWorkflow,
  onRunWorkflow,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'workflows' | 'resources' | 'shared_only'>('all');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Zoom reference
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  // Build the complete ecosystem dataset of Workflows, Shared Resources, and Inter-dependencies
  const { nodes, links } = useMemo(() => {
    const rawNodes: GraphNode[] = [];
    const rawLinks: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();
    const linkKeys = new Set<string>();

    const addLink = (sourceId: string, targetId: string, relationType: GraphLink['relationType'], label: string) => {
      const key = `${sourceId}->${targetId}:${relationType}`;
      if (!linkKeys.has(key)) {
        linkKeys.add(key);
        rawLinks.push({
          id: key,
          source: sourceId,
          target: targetId,
          relationType,
          label
        });
      }
    };

    // Shared Resource Nodes (Singletons representing key Workspace services & data sinks)
    const sharedResources: Array<{
      id: string;
      name: string;
      nodeType: GraphNode['nodeType'];
      description: string;
      resourceType: string;
    }> = [
      {
        id: 'res_gemini_brain',
        name: 'Gemini DeepThink & Knowledge Base',
        nodeType: 'resource_ai',
        description: 'Core server-side reasoning engine providing synthesis, extraction, and strategic intelligence across workflows.',
        resourceType: 'AI Inference Engine'
      },
      {
        id: 'res_google_docs_hub',
        name: 'Google Drive & Docs Repository',
        nodeType: 'resource_docs',
        description: 'Collaborative cloud documents repository storing executive briefings, market research, and audit reports.',
        resourceType: 'Workspace Cloud Docs'
      },
      {
        id: 'res_gmail_dispatch',
        name: 'Gmail Dispatch & Inbound Feeds',
        nodeType: 'resource_gmail',
        description: 'Corporate email gateway handling draft creation, investor notifications, and stakeholder announcements.',
        resourceType: 'Google Workspace Mail'
      },
      {
        id: 'res_calendar_events',
        name: 'Google Calendar Master Schedule',
        nodeType: 'resource_calendar',
        description: 'Central company calendar coordinating strategy review sessions, milestone deadlines, and follow-ups.',
        resourceType: 'Workspace Schedule'
      },
      {
        id: 'res_web_intel',
        name: 'Live Web Scraping & Ingestion Hub',
        nodeType: 'resource_web',
        description: 'Automated web intelligence scraper harvesting news, competitor portals, and public data streams.',
        resourceType: 'Data Extraction'
      }
    ];

    // Add shared resources
    sharedResources.forEach(res => {
      const node: GraphNode = {
        id: res.id,
        name: res.name,
        nodeType: res.nodeType,
        category: 'resource',
        description: res.description,
        radius: 30,
        details: {
          resourceType: res.resourceType,
          connectedWorkflowsCount: 0
        }
      };
      rawNodes.push(node);
      nodeMap.set(node.id, node);
    });

    // 1. Current Active Workflow Node
    const currentWfId = 'wf_current_active';
    const currentWfNode: GraphNode = {
      id: currentWfId,
      name: currentWorkflowName || 'Current Active Canvas Workflow',
      nodeType: 'workflow',
      category: 'workflow',
      isCurrent: true,
      stepCount: currentSteps.length,
      description: `Active workflow canvas with ${currentSteps.length} sequential execution steps.`,
      radius: 36,
      details: {
        steps: currentSteps,
        connectedWorkflowsCount: 0
      }
    };
    rawNodes.push(currentWfNode);
    nodeMap.set(currentWfId, currentWfNode);

    // Connect Current Workflow to its resources
    currentSteps.forEach(step => {
      if (step.type === 'scrape_url') {
        addLink(currentWfId, 'res_web_intel', 'consumes', 'Scrapes Web');
      } else if (step.type === 'ai_synthesize') {
        addLink(currentWfId, 'res_gemini_brain', 'consumes', 'Gemini Prompts');
      } else if (step.type === 'docs_create') {
        addLink(currentWfId, 'res_google_docs_hub', 'produces', 'Writes Doc');
      } else if (step.type === 'gmail_draft') {
        addLink(currentWfId, 'res_gmail_dispatch', 'produces', 'Drafts Email');
      } else if (step.type === 'calendar_event') {
        addLink(currentWfId, 'res_calendar_events', 'produces', 'Books Event');
      }
    });

    // 2. Saved Templates and Standard Workflow pipelines
    savedTemplates.forEach((tpl) => {
      const wfId = `wf_${tpl.id}`;
      const wfNode: GraphNode = {
        id: wfId,
        name: tpl.name,
        nodeType: 'workflow',
        category: 'workflow',
        isCurrent: false,
        stepCount: tpl.steps.length,
        description: tpl.description || 'Configured multi-step workflow pipeline.',
        radius: 32,
        details: {
          steps: tpl.steps,
          connectedWorkflowsCount: 0
        }
      };
      rawNodes.push(wfNode);
      nodeMap.set(wfId, wfNode);

      // Connect to shared resources based on step types
      tpl.steps.forEach(step => {
        if (step.type === 'scrape_url') {
          addLink(wfId, 'res_web_intel', 'consumes', 'Scrapes Web');
        } else if (step.type === 'ai_synthesize') {
          addLink(wfId, 'res_gemini_brain', 'consumes', 'Gemini Prompts');
        } else if (step.type === 'docs_create') {
          addLink(wfId, 'res_google_docs_hub', 'produces', 'Publishes Doc');
        } else if (step.type === 'gmail_draft') {
          addLink(wfId, 'res_gmail_dispatch', 'produces', 'Drafts Email');
        } else if (step.type === 'calendar_event') {
          addLink(wfId, 'res_calendar_events', 'produces', 'Books Event');
        }
      });
    });

    // 3. Synthesize Cross-Workflow Inter-Dependencies
    // If Workflow A produces a Doc or Draft that Workflow B utilizes or follows up on:
    if (savedTemplates.length >= 2) {
      // E.g., template_1 produces Executive Brief in Docs, template_2 reviews strategic insights in Calendar
      const t1 = rawNodes.find(n => n.id.includes('template_1'));
      const t2 = rawNodes.find(n => n.id.includes('template_2'));
      if (t1 && t2) {
        addLink(t1.id, t2.id, 'triggers', 'Hands off Analysis');
      }
    }

    // Active workflow cross-link with template_1 or template_2 if related
    const hasCurrentDocs = currentSteps.some(s => s.type === 'docs_create');
    const hasCurrentCal = currentSteps.some(s => s.type === 'calendar_event');
    const firstTemplate = savedTemplates[0];
    if (firstTemplate && hasCurrentDocs) {
      addLink(`wf_${firstTemplate.id}`, currentWfId, 'shares', 'Shared Context');
    }
    if (savedTemplates[1] && hasCurrentCal) {
      addLink(currentWfId, `wf_${savedTemplates[1].id}`, 'triggers', 'Follow-up Sync');
    }

    // Compute connectivity counts
    rawLinks.forEach(link => {
      const sId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const tId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      const sNode = nodeMap.get(sId);
      const tNode = nodeMap.get(tId);
      if (sNode && sNode.details) sNode.details.connectedWorkflowsCount = (sNode.details.connectedWorkflowsCount || 0) + 1;
      if (tNode && tNode.details) tNode.details.connectedWorkflowsCount = (tNode.details.connectedWorkflowsCount || 0) + 1;
    });

    return { nodes: rawNodes, links: rawLinks };
  }, [currentWorkflowName, currentSteps, savedTemplates]);

  // Filter nodes based on user filters & search
  const filteredData = useMemo(() => {
    let activeNodes = [...nodes];

    if (filterType === 'workflows') {
      activeNodes = activeNodes.filter(n => n.category === 'workflow');
    } else if (filterType === 'resources') {
      activeNodes = activeNodes.filter(n => n.category === 'resource');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      activeNodes = activeNodes.filter(n =>
        n.name.toLowerCase().includes(q) ||
        (n.description && n.description.toLowerCase().includes(q))
      );
    }

    const activeNodeIds = new Set(activeNodes.map(n => n.id));
    const activeLinks = links.filter(link => {
      const sId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const tId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      return activeNodeIds.has(sId) && activeNodeIds.has(tId);
    });

    return { nodes: activeNodes, links: activeLinks };
  }, [nodes, links, filterType, searchQuery]);

  // Selected Node Details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  // Direct neighbors of selected node for highlight
  const selectedNeighbors = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const neighborSet = new Set<string>([selectedNodeId]);
    links.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      if (sId === selectedNodeId) neighborSet.add(tId);
      if (tId === selectedNodeId) neighborSet.add(sId);
    });
    return neighborSet;
  }, [selectedNodeId, links]);

  // Helper color map
  const getNodeColor = (node: GraphNode) => {
    if (node.isCurrent) return '#2563eb'; // Blue-600
    switch (node.nodeType) {
      case 'workflow':
        return '#4f46e5'; // Indigo-600
      case 'resource_ai':
        return '#9333ea'; // Purple-600
      case 'resource_docs':
        return '#d97706'; // Amber-600
      case 'resource_gmail':
        return '#059669'; // Emerald-600
      case 'resource_calendar':
        return '#4338ca'; // Indigo-700
      case 'resource_web':
        return '#0284c7'; // Sky-600
      default:
        return '#64748b'; // Slate-500
    }
  };

  // Pure SVG vector paths matching Lucide icons for D3 Canvas
  const getNodeVectorPaths = (nodeType: GraphNode['nodeType']) => {
    switch (nodeType) {
      case 'workflow':
        return '<path d="m2 7 10-5 10 5-10 5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" />';
      case 'resource_ai':
        return '<path d="M12 3l1.912 4.686L18.6 9.6l-4.688 1.914L12 16.2l-1.912-4.686L5.4 9.6l4.688-1.914L12 3z" /><path d="M19 3v4" /><path d="M21 5h-4" />';
      case 'resource_docs':
        return '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" />';
      case 'resource_gmail':
        return '<rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />';
      case 'resource_calendar':
        return '<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />';
      case 'resource_web':
      default:
        return '<circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />';
    }
  };

  // React icon renderer for UI panels and legends
  const renderNodeIcon = (type: GraphNode['nodeType'] | WorkflowStep['type'], className = 'w-4 h-4') => {
    switch (type) {
      case 'workflow':
        return <Layers className={className} />;
      case 'resource_ai':
      case 'ai_synthesize':
        return <Sparkles className={className} />;
      case 'resource_docs':
      case 'docs_create':
        return <FileText className={className} />;
      case 'resource_gmail':
      case 'gmail_draft':
        return <Mail className={className} />;
      case 'resource_calendar':
      case 'calendar_event':
        return <Calendar className={className} />;
      case 'resource_web':
      case 'scrape_url':
      default:
        return <Globe className={className} />;
    }
  };

  // Render D3 Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 540;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean previous render

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Definitions for arrow heads and drop shadows
    const defs = svg.append('defs');

    // Arrow markers
    ['produces', 'consumes', 'triggers', 'shares'].forEach(type => {
      const color = type === 'produces' ? '#10b981' : type === 'triggers' ? '#3b82f6' : type === 'consumes' ? '#8b5cf6' : '#94a3b8';
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 26) // Distance from target center
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Container Group with Zoom
    const g = svg.append('g').attr('class', 'graph-canvas-group');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Simulation Data Clone to avoid mutating React state directly
    const simNodes: GraphNode[] = filteredData.nodes.map(d => ({ ...d }));
    const simLinks: GraphLink[] = filteredData.links.map(d => ({
      ...d,
      source: typeof d.source === 'object' ? (d.source as GraphNode).id : d.source,
      target: typeof d.target === 'object' ? (d.target as GraphNode).id : d.target
    }));

    const simulation = d3.forceSimulation<GraphNode>(simNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(simLinks)
        .id((d) => d.id)
        .distance((d) => (d.relationType === 'triggers' ? 150 : 130))
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(d => d.radius + 18));

    simulationRef.current = simulation;

    // Render Links
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup.selectAll<SVGLineElement, GraphLink>('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        switch (d.relationType) {
          case 'produces': return '#10b981';
          case 'triggers': return '#3b82f6';
          case 'consumes': return '#a855f7';
          default: return '#94a3b8';
        }
      })
      .attr('stroke-width', (d) => (d.relationType === 'triggers' ? 2.5 : 1.8))
      .attr('stroke-dasharray', (d) => (d.relationType === 'triggers' ? '4,3' : null))
      .attr('stroke-opacity', 0.65)
      .attr('marker-end', (d) => `url(#arrow-${d.relationType})`);

    // Render Link Labels
    let linkLabel: d3.Selection<SVGTextElement, GraphLink, SVGGElement, unknown> | null = null;
    if (showLabels) {
      const labelGroup = g.append('g').attr('class', 'link-labels');
      linkLabel = labelGroup.selectAll<SVGTextElement, GraphLink>('text')
        .data(simLinks)
        .enter()
        .append('text')
        .attr('class', 'text-[9px] select-none fill-slate-500 dark:fill-slate-400 font-medium')
        .attr('text-anchor', 'middle')
        .attr('dy', -4)
        .text(d => d.label);
    }

    // Render Nodes Group
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll<SVGGElement, GraphNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node Outer Pulse Ring for Current Active Workflow
    node.filter(d => !!d.isCurrent)
      .append('circle')
      .attr('r', d => d.radius + 6)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3')
      .attr('class', 'animate-spin')
      .style('transform-origin', 'center');

    // Node Circle
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .attr('class', 'transition-all duration-150 filter drop-shadow-sm')
      .on('click', (_event, d) => {
        setSelectedNodeId(prev => prev === d.id ? null : d.id);
      });

    // Node Center Icon (crisp vector SVG matching Lucide icon set)
    const iconContainer = node.append('g')
      .attr('pointer-events', 'none')
      .attr('transform', d => {
        const size = d.radius >= 28 ? 18 : 15;
        return `translate(-${size / 2}, -${size / 2})`;
      });

    iconContainer.each(function(d) {
      const g = d3.select(this);
      const size = d.radius >= 28 ? 18 : 15;
      const paths = getNodeVectorPaths(d.nodeType);
      
      const iconSvg = g.append('svg')
        .attr('width', size)
        .attr('height', size)
        .attr('viewBox', '0 0 24 24')
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '2')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
        
      iconSvg.html(paths);
    });

    // Node Text Label (Title below node)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => d.radius + 15)
      .attr('class', 'text-[11px] font-bold fill-slate-800 dark:fill-slate-200 select-none pointer-events-none')
      .text(d => {
        if (d.name.length > 22) {
          return d.name.slice(0, 20) + '…';
        }
        return d.name;
      });

    // Node Sub-label (category / step count)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => d.radius + 27)
      .attr('class', 'text-[9px] font-medium fill-slate-500 dark:fill-slate-400 select-none pointer-events-none')
      .text(d => {
        if (d.isCurrent) return 'Active Canvas';
        if (d.category === 'workflow') return `${d.stepCount || 0} Steps`;
        return d.details?.resourceType || 'Resource';
      });

    // Simulation Tick handler
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      if (linkLabel) {
        linkLabel
          .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
          .attr('y', (d: any) => (d.source.y + d.target.y) / 2);
      }

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredData, showLabels]);

  // Update visual opacity / highlighting when a node is selected
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (!selectedNodeId) {
      svg.selectAll('.node-item').style('opacity', 1);
      svg.selectAll('line').style('opacity', 0.65).attr('stroke-width', (d: any) => (d.relationType === 'triggers' ? 2.5 : 1.8));
      return;
    }

    svg.selectAll<SVGGElement, GraphNode>('.node-item')
      .style('opacity', d => (selectedNeighbors.has(d.id) ? 1 : 0.2));

    svg.selectAll<SVGLineElement, GraphLink>('line')
      .style('opacity', (d: any) => {
        const sId = typeof d.source === 'string' ? d.source : d.source.id;
        const tId = typeof d.target === 'string' ? d.target : d.target.id;
        return (sId === selectedNodeId || tId === selectedNodeId) ? 1 : 0.15;
      })
      .attr('stroke-width', (d: any) => {
        const sId = typeof d.source === 'string' ? d.source : d.source.id;
        const tId = typeof d.target === 'string' ? d.target : d.target.id;
        return (sId === selectedNodeId || tId === selectedNodeId) ? 3 : 1;
      });
  }, [selectedNodeId, selectedNeighbors]);

  // Zoom Controls
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.25);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.8);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(350).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleReheatSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalWorkflows = nodes.filter(n => n.category === 'workflow').length;
    const totalResources = nodes.filter(n => n.category === 'resource').length;
    const totalDependencies = links.length;
    const interWorkflowTriggers = links.filter(l => l.relationType === 'triggers').length;

    return {
      totalWorkflows,
      totalResources,
      totalDependencies,
      interWorkflowTriggers
    };
  }, [nodes, links]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="workflow-dependency-graph-view">
      {/* Top Header & Metrics Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <Network className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Automation Dependency Ecosystem
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 rounded-full">
              D3 Force Simulation
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive topological mapping of workflow pipelines, shared Google Workspace resources, AI models, and handoff triggers.
          </p>
        </div>

        {/* High-level Ecosystem KPI badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">Workflows</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{metrics.totalWorkflows}</span>
          </div>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">Shared Sinks</span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{metrics.totalResources}</span>
          </div>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">Active Links</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{metrics.totalDependencies}</span>
          </div>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">Handoffs</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{metrics.interWorkflowTriggers}</span>
          </div>
        </div>
      </div>

      {/* Graph Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="graph-search-input"
              type="text"
              placeholder="Search workflows or resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setFilterType('workflows')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'workflows'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Workflows Only
            </button>
            <button
              onClick={() => setFilterType('resources')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'resources'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Resources Only
            </button>
          </div>

          {/* Toggle Labels */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Link Labels</span>
          </label>
        </div>

        {/* Zoom & Canvas Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="graph-zoom-in-btn"
            onClick={handleZoomIn}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="graph-zoom-out-btn"
            onClick={handleZoomOut}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="graph-reset-view-btn"
            onClick={handleResetZoom}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Reset Pan & Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            id="graph-reheat-simulation-btn"
            onClick={handleReheatSimulation}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Re-balance Graph Layout"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* D3 Graph Stage */}
        <div
          ref={containerRef}
          id="d3-graph-container"
          className="lg:col-span-2 relative bg-slate-50/60 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner h-[540px]"
        >
          {/* Background grid dots */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          />

          {/* Quick Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] space-y-2 shadow-xs pointer-events-none">
            <span className="font-bold text-slate-700 dark:text-slate-300 block tracking-tight">Ecosystem Services & Nodes:</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Layers className="w-2.5 h-2.5" />
                </span>
                <span>Active Workflow</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Layers className="w-2.5 h-2.5" />
                </span>
                <span>Saved Pipeline</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
                <span>Gemini AI</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-2.5 h-2.5" />
                </span>
                <span>Google Docs</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Mail className="w-2.5 h-2.5" />
                </span>
                <span>Gmail Dispatch</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-indigo-700 text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-2.5 h-2.5" />
                </span>
                <span>Google Calendar</span>
              </span>
              <span className="flex items-center gap-1.5 col-span-2">
                <span className="w-4 h-4 rounded-md bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <Globe className="w-2.5 h-2.5" />
                </span>
                <span>Live Web Scraper</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 min-h-[540px] flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: getNodeColor(selectedNode) }}
                    >
                      {renderNodeIcon(selectedNode.nodeType, 'w-5 h-5')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {selectedNode.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
                        {selectedNode.category}: {selectedNode.nodeType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedNode.description}
                </p>

                {/* Workflow specific details */}
                {selectedNode.category === 'workflow' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Sequential Steps:</span>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded font-mono text-[10px]">
                        {selectedNode.details?.steps?.length || selectedNode.stepCount || 0} steps
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(selectedNode.details?.steps || []).map((step, idx) => (
                        <div
                          key={step.id || idx}
                          className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                              {renderNodeIcon(step.type, 'w-3 h-3')}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 truncate font-medium">
                              {idx + 1}. {step.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 shrink-0">
                            {step.type}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions for non-current workflow */}
                    {!selectedNode.isCurrent && (
                      <div className="pt-2 space-y-2">
                        <button
                          id="load-inspected-workflow-btn"
                          onClick={() => {
                            const found = savedTemplates.find(t => `wf_${t.id}` === selectedNode.id);
                            if (found) {
                              onLoadWorkflow(found);
                            }
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Load into Studio Canvas</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Resource specific details */}
                {selectedNode.category === 'resource' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-purple-900 dark:text-purple-200">
                        <span>Connected Pipelines</span>
                        <span className="font-mono">{selectedNeighbors.size - 1} Workflows</span>
                      </div>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">
                        This workspace resource acts as a shared synchronization point for data flow across pipelines.
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Interacting Workflows:</span>
                      <div className="space-y-1 pt-1">
                        {Array.from(selectedNeighbors)
                          .filter(id => id !== selectedNode.id)
                          .map(neighborId => {
                            const neighbor = nodes.find(n => n.id === neighborId);
                            if (!neighbor) return null;
                            return (
                              <div
                                key={neighbor.id}
                                className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-[11px]"
                              >
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {neighbor.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded font-semibold">
                                  {neighbor.isCurrent ? 'Active Canvas' : 'Template'}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400 dark:text-slate-500 my-auto">
                <Network className="w-10 h-10 opacity-30 stroke-1" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Interactive Node Inspector
                  </h4>
                  <p className="text-[11px] leading-relaxed max-w-xs">
                    Click any node in the D3 graph to view its detailed step configurations, connected Google Workspace resources, and cross-workflow handoffs.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Panel Status */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Google Workspace Synchronized
              </span>
              <span>Drag nodes to explore</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
