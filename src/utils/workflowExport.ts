import { WorkflowStep } from '../components/LogicOrchestratorView';

export interface WorkflowExportOptions {
  includeComments?: boolean;
  useVariablePlaceholders?: boolean;
  tags?: string[];
}

export interface ExportableWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  tags?: string[];
}

/**
 * Converts workflow sequences into a structured, human-readable markdown task list
 * formatted with Markdown structure and lightweight XML & blockquote delimiters.
 * Universally parseable by any AI model (ChatGPT, DeepSeek, Claude, Llama, etc.).
 */
export function generateWorkflowMarkdown(
  workflowName: string,
  workflowDescription: string = 'Automated multi-step pipeline powered by AI and Google Workspace.',
  steps: WorkflowStep[],
  options: WorkflowExportOptions = {}
): string {
  const { includeComments = true, useVariablePlaceholders = false, tags = [] } = options;

  let md = `# MISSION SPECIFICATION: ${workflowName.toUpperCase()}\n\n`;
  md += `> **Objective**: ${workflowDescription}\n`;
  if (tags && tags.length > 0) {
    md += `> **Category Tags**: ${tags.map(t => '#' + t).join(' ')}\n`;
  }
  md += `> **Pipeline Architecture**: Sequential Multi-Step AI Task Workflow\n`;
  md += `> **Sequential Tasks**: ${steps.length} operational steps\n`;
  md += `> **Target Compatibility**: Universal AI Task Execution (ChatGPT, DeepSeek, Claude, Mistral, Llama, Autonomous Agents)\n\n`;

  md += `## OPERATIONAL INSTRUCTIONS\n`;
  md += `<instructions>\n`;
  md += `You are an autonomous AI Task Orchestrator. Your mission is to execute the following sequence of ${steps.length} interconnected tasks in exact chronological order.\n`;
  md += `- Maintain full contextual continuity: inputs, findings, and strategic takeaways from each preceding task must directly inform subsequent tasks.\n`;
  md += `- For each task block, strictly adhere to the operational directives, source inputs, and team guidance notes.\n`;
  md += `- Produce comprehensive, production-grade milestone deliverables for every step before advancing to the next.\n`;
  md += `</instructions>\n\n`;

  md += `---\n\n`;
  md += `## SEQUENTIAL TASK CHAIN\n\n`;

  steps.forEach((step, idx) => {
    const taskNumber = idx + 1;

    md += `### TASK ${taskNumber}: ${step.name}\n`;
    md += `<task index="${taskNumber}" service="${step.type}">\n`;

    if (step.type === 'scrape_url') {
      const targetUrl = useVariablePlaceholders ? '{{TARGET_URL}}' : (step.config.url || 'https://example.com/target-source');
      md += `> **Service Node**: Web Research & Ingestion (\`${step.type}\`)\n`;
      md += `> **Target Source URL**: \`${targetUrl}\`\n\n`;
      md += `#### Operational Directives:\n`;
      md += `- Ingest and extract core data points, quantitative metrics, market signals, and key qualitative statements from this source.\n`;
      md += `- Clean and structure raw content, highlighting verifiable data, quotations, and authoritative source references.\n`;
      md += `- Synthesize raw information into organized data blocks ready for downstream analytical processing.\n\n`;
    } else if (step.type === 'ai_synthesize') {
      const promptVal = useVariablePlaceholders ? '{{SYNTHESIS_PROMPT}}' : (step.config.prompt || 'Synthesize findings into strategic insights.');
      md += `> **Service Node**: Deep AI Reasoning & Synthesis (\`${step.type}\`)\n`;
      md += `> **Analytical Directive**: "${promptVal}"\n\n`;
      md += `#### Operational Directives:\n`;
      md += `- Perform rigorous multi-angle synthesis of the intelligence gathered in previous tasks.\n`;
      md += `- Identify macro trends, competitive differentiation, second-order risks, and high-leverage strategic opportunities.\n`;
      md += `- Quantify takeaways wherever possible, providing actionable frameworks and clear rationale.\n\n`;
    } else if (step.type === 'docs_create') {
      const docTitle = useVariablePlaceholders ? '{{DOC_TITLE}}' : (step.config.docTitle || `${workflowName} - Executive Brief`);
      md += `> **Service Node**: Google Docs Publication (\`${step.type}\`)\n`;
      md += `> **Document Title**: "${docTitle}"\n\n`;
      md += `#### Operational Directives:\n`;
      md += `- Format the distilled intelligence into an executive document structure.\n`;
      md += `- Include standard executive sections: (1) Executive Summary, (2) Strategic Analysis & Market Dynamics, (3) Key Metrics & Multiples, and (4) Action Plan.\n`;
      md += `- Format with clear headings, bullet points, callout boxes, and ready-to-publish typographic precision.\n\n`;
    } else if (step.type === 'gmail_draft') {
      const recipient = useVariablePlaceholders ? '{{RECIPIENT_EMAIL}}' : (step.config.recipient || 'executive-team@firm.com');
      const subject = useVariablePlaceholders ? '{{EMAIL_SUBJECT}}' : (step.config.subject || `Briefing: ${workflowName}`);
      md += `> **Service Node**: Gmail Live Communication (\`${step.type}\`)\n`;
      md += `> **Recipient**: \`${recipient}\`\n`;
      md += `> **Subject Line**: "${subject}"\n\n`;
      md += `#### Operational Directives:\n`;
      md += `- Compose an executive-grade email communicating the briefing outcomes to stakeholders.\n`;
      md += `- Keep tone direct, authoritative, and respectful of executive time with a punchy opening, 3 bulleted insights, and an unambiguous call-to-action.\n\n`;
    } else if (step.type === 'calendar_event') {
      const eventTitle = useVariablePlaceholders ? '{{CALENDAR_EVENT_TITLE}}' : (step.config.eventTitle || `${workflowName} - Strategy Sync`);
      md += `> **Service Node**: Google Calendar Scheduling (\`${step.type}\`)\n`;
      md += `> **Meeting Title**: "${eventTitle}"\n\n`;
      md += `#### Operational Directives:\n`;
      md += `- Generate a 30-minute structured review sync agenda.\n`;
      md += `- Define meeting objectives, attendee preparation requirements, and a minute-by-minute discussion outline.\n\n`;
    }

    if (includeComments && step.comments && step.comments.length > 0) {
      md += `<team_guidance>\n`;
      step.comments.forEach(c => {
        md += `- [${c.tag || 'Context'} by ${c.authorName}]: ${c.text}\n`;
      });
      md += `</team_guidance>\n\n`;
    }

    md += `#### Expected Milestone Deliverable:\n`;
    md += `Produce the complete, un-abbreviated deliverable for Task ${taskNumber} before moving to Task ${taskNumber + 1}.\n`;
    md += `</task>\n\n`;
    md += `---\n\n`;
  });

  md += `## OUTPUT SPECIFICATIONS\n`;
  md += `<output_specifications>\n`;
  md += `1. **Sequential Demarcation**: Present each milestone deliverable clearly under its corresponding Task header.\n`;
  md += `2. **Threaded Continuity**: Ensure conclusions and data points from Task 1 flow naturally into subsequent tasks.\n`;
  md += `3. **Executive Summary & Next Actions**: Conclude the final output with a synthesized executive wrap-up summarizing top takeaways and immediate decisions.\n`;
  md += `</output_specifications>\n`;

  return md;
}

/**
 * Converts multiple workflow templates into a unified, structured Markdown task specification document
 * using lightweight XML and blockquote delimiters.
 */
export function generateMultiWorkflowMarkdown(
  templates: ExportableWorkflowTemplate[],
  options: WorkflowExportOptions = {}
): string {
  if (templates.length === 1) {
    return generateWorkflowMarkdown(templates[0].name, templates[0].description, templates[0].steps, options);
  }

  const { includeComments = true, useVariablePlaceholders = false } = options;
  const totalTasks = templates.reduce((acc, t) => acc + t.steps.length, 0);

  let md = `# MULTI-WORKFLOW MISSION SPECIFICATION SUITE\n\n`;
  md += `> **Total Workflows**: ${templates.length} Orchestrated Templates\n`;
  md += `> **Total Sequential Tasks**: ${totalTasks} Operational Directives\n`;
  md += `> **Specification Format**: Structured Markdown with Lightweight XML & Blockquote Delimiters\n`;
  md += `> **Universal Compatibility**: ChatGPT, DeepSeek, Claude, Mistral, Llama, and Custom AI Agents\n\n`;

  md += `## TEMPLATE COLLECTION CATALOG\n`;
  md += `<workflow_catalog count="${templates.length}">\n`;
  templates.forEach((t, idx) => {
    md += `${idx + 1}. **${t.name}** (${t.steps.length} tasks) — ${t.description}\n`;
  });
  md += `</workflow_catalog>\n\n`;

  md += `## MASTER EXECUTION INSTRUCTIONS\n`;
  md += `<master_instructions>\n`;
  md += `You are an enterprise AI Workflow Orchestrator. This document specifies ${templates.length} distinct multi-step workflows.\n`;
  md += `Execute the requested workflow(s) in sequential order. Adhere to the operational directives, input sources, team guidance notes, and expected milestone deliverables for each task.\n`;
  md += `</master_instructions>\n\n`;

  md += `---\n\n`;

  templates.forEach((tpl, tIdx) => {
    const wNum = tIdx + 1;
    md += `## WORKFLOW ${wNum} OF ${templates.length}: ${tpl.name.toUpperCase()}\n`;
    md += `<workflow index="${wNum}" id="${tpl.id}" total_steps="${tpl.steps.length}">\n`;
    md += `> **Objective**: ${tpl.description}\n`;
    if (tpl.tags && tpl.tags.length > 0) {
      md += `> **Category Tags**: ${tpl.tags.map(t => '#' + t).join(' ')}\n`;
    }
    md += `> **Sequence Depth**: ${tpl.steps.length} interconnected operational steps\n\n`;

    tpl.steps.forEach((step, sIdx) => {
      const taskNum = sIdx + 1;
      md += `### TASK ${wNum}.${taskNum}: ${step.name}\n`;
      md += `<task index="${taskNum}" service="${step.type}">\n`;

      if (step.type === 'scrape_url') {
        const targetUrl = useVariablePlaceholders ? '{{TARGET_URL}}' : (step.config.url || 'https://example.com/target-source');
        md += `> **Service Node**: Web Research & Ingestion (\`${step.type}\`)\n`;
        md += `> **Target Source URL**: \`${targetUrl}\`\n\n`;
        md += `#### Operational Directives:\n`;
        md += `- Ingest and extract core data points, quantitative metrics, and authoritative source references.\n`;
        md += `- Clean and structure raw content into organized blocks ready for downstream analytical processing.\n\n`;
      } else if (step.type === 'ai_synthesize') {
        const promptVal = useVariablePlaceholders ? '{{SYNTHESIS_PROMPT}}' : (step.config.prompt || 'Synthesize findings into strategic insights.');
        md += `> **Service Node**: Deep AI Reasoning & Synthesis (\`${step.type}\`)\n`;
        md += `> **Analytical Directive**: "${promptVal}"\n\n`;
        md += `#### Operational Directives:\n`;
        md += `- Perform rigorous multi-angle synthesis of the intelligence gathered in previous tasks.\n`;
        md += `- Identify macro trends, competitive differentiation, and strategic frameworks.\n\n`;
      } else if (step.type === 'docs_create') {
        const docTitle = useVariablePlaceholders ? '{{DOC_TITLE}}' : (step.config.docTitle || `${tpl.name} - Executive Brief`);
        md += `> **Service Node**: Google Docs Publication (\`${step.type}\`)\n`;
        md += `> **Document Title**: "${docTitle}"\n\n`;
        md += `#### Operational Directives:\n`;
        md += `- Format the distilled intelligence into an executive document structure.\n`;
        md += `- Include clear headings, bullet points, callout boxes, and ready-to-publish typographic precision.\n\n`;
      } else if (step.type === 'gmail_draft') {
        const recipient = useVariablePlaceholders ? '{{RECIPIENT_EMAIL}}' : (step.config.recipient || 'executive-team@firm.com');
        const subject = useVariablePlaceholders ? '{{EMAIL_SUBJECT}}' : (step.config.subject || `Briefing: ${tpl.name}`);
        md += `> **Service Node**: Gmail Live Communication (\`${step.type}\`)\n`;
        md += `> **Recipient**: \`${recipient}\`\n`;
        md += `> **Subject Line**: "${subject}"\n\n`;
        md += `#### Operational Directives:\n`;
        md += `- Compose an executive-grade email communicating outcomes clearly with actionable recommendations.\n\n`;
      } else if (step.type === 'calendar_event') {
        const eventTitle = useVariablePlaceholders ? '{{CALENDAR_EVENT_TITLE}}' : (step.config.eventTitle || `${tpl.name} - Strategy Sync`);
        md += `> **Service Node**: Google Calendar Scheduling (\`${step.type}\`)\n`;
        md += `> **Meeting Title**: "${eventTitle}"\n\n`;
        md += `#### Operational Directives:\n`;
        md += `- Generate a structured review sync agenda and minute-by-minute discussion outline.\n\n`;
      }

      if (includeComments && step.comments && step.comments.length > 0) {
        md += `<team_guidance>\n`;
        step.comments.forEach(c => {
          md += `- [${c.tag || 'Context'} by ${c.authorName}]: ${c.text}\n`;
        });
        md += `</team_guidance>\n\n`;
      }

      md += `#### Expected Milestone Deliverable:\n`;
      md += `Deliver full un-abbreviated output for Task ${wNum}.${taskNum}.\n`;
      md += `</task>\n\n`;
    });

    md += `</workflow>\n\n`;
    md += `---\n\n`;
  });

  md += `## UNIFIED OUTPUT SPECIFICATIONS\n`;
  md += `<output_specifications>\n`;
  md += `1. Demarcate deliverables for each workflow and task cleanly under their respective headers.\n`;
  md += `2. Maintain analytical continuity across task transitions.\n`;
  md += `3. Include an executive wrap-up summarizing decisions and action items.\n`;
  md += `</output_specifications>\n`;

  return md;
}

/**
 * Converts multiple workflows into a unified, validated JSON collection
 */
export function generateMultiWorkflowJSON(templates: ExportableWorkflowTemplate[]): string {
  if (templates.length === 1) {
    return generateWorkflowJSON(templates[0].name, templates[0].description, templates[0].steps);
  }

  const payload = {
    schemaVersion: '1.0.0',
    exportFormat: 'vantage-workflow-collection-v1',
    exportedAt: new Date().toISOString(),
    totalWorkflows: templates.length,
    totalSteps: templates.reduce((acc, t) => acc + t.steps.length, 0),
    workflows: templates.map((tpl, idx) => ({
      sequenceIndex: idx + 1,
      id: tpl.id,
      name: tpl.name,
      description: tpl.description,
      tags: tpl.tags || [],
      totalSteps: tpl.steps.length,
      steps: tpl.steps.map((s, sIdx) => ({
        sequenceIndex: sIdx + 1,
        id: s.id,
        name: s.name,
        type: s.type,
        config: s.config,
        comments: s.comments || []
      }))
    }))
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Converts workflow into a structured, validated JSON format for universal compatibility
 * across automation tools, APIs, and custom agent systems.
 */
export function generateWorkflowJSON(
  workflowName: string,
  workflowDescription: string = 'Automated multi-step pipeline powered by AI and Google Workspace.',
  steps: WorkflowStep[],
  tags?: string[]
): string {
  const payload = {
    schemaVersion: '1.0.0',
    exportFormat: 'vantage-workflow-v1',
    exportedAt: new Date().toISOString(),
    workflow: {
      name: workflowName,
      description: workflowDescription,
      tags: tags || [],
      totalSteps: steps.length
    },
    steps: steps.map((s, idx) => ({
      sequenceIndex: idx + 1,
      id: s.id,
      name: s.name,
      type: s.type,
      config: s.config,
      comments: s.comments || []
    }))
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Triggers a browser download for text/plain or application/json content.
 */
export function downloadContentFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convenience helper to download workflow as .md
 */
export function downloadWorkflowAsMarkdown(
  workflowName: string,
  workflowDescription: string | undefined,
  steps: WorkflowStep[],
  options?: WorkflowExportOptions
): void {
  const safeName = (workflowName || 'workflow').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const md = generateWorkflowMarkdown(workflowName, workflowDescription, steps, options);
  downloadContentFile(md, `${safeName}_tasks.md`, 'text/markdown;charset=utf-8');
}

/**
 * Convenience helper to download workflow as .json
 */
export function downloadWorkflowAsJSON(
  workflowName: string,
  workflowDescription: string | undefined,
  steps: WorkflowStep[],
  tags?: string[]
): void {
  const safeName = (workflowName || 'workflow').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const json = generateWorkflowJSON(workflowName, workflowDescription, steps, tags);
  downloadContentFile(json, `${safeName}_config.json`, 'application/json;charset=utf-8');
}

/**
 * Downloads multiple workflow templates as a combined Structured Markdown (.md) task specification
 */
export function downloadMultiWorkflowAsMarkdown(
  templates: ExportableWorkflowTemplate[],
  collectionName: string = 'vantage_workflow_collection',
  options?: WorkflowExportOptions
): void {
  if (templates.length === 1) {
    const t = templates[0];
    downloadWorkflowAsMarkdown(t.name, t.description, t.steps, { ...options, tags: t.tags });
    return;
  }
  const safeName = (collectionName || 'workflow_collection').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const md = generateMultiWorkflowMarkdown(templates, options);
  downloadContentFile(md, `${safeName}_${templates.length}_templates.md`, 'text/markdown;charset=utf-8');
}

/**
 * Downloads multiple workflow templates as a combined Structured JSON (.json) configuration file
 */
export function downloadMultiWorkflowAsJSON(
  templates: ExportableWorkflowTemplate[],
  collectionName: string = 'vantage_workflow_collection'
): void {
  if (templates.length === 1) {
    const t = templates[0];
    downloadWorkflowAsJSON(t.name, t.description, t.steps, t.tags);
    return;
  }
  const safeName = (collectionName || 'workflow_collection').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const json = generateMultiWorkflowJSON(templates);
  downloadContentFile(json, `${safeName}_${templates.length}_templates.json`, 'application/json;charset=utf-8');
}
