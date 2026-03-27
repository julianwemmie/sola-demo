import Anthropic from '@anthropic-ai/sdk';

let _anthropic: Anthropic | null = null;
function getClient() {
  if (!_anthropic) _anthropic = new Anthropic();
  return _anthropic;
}

interface ConfigField {
  label: string;
  value: string;
}

interface NodeSummary {
  id: string;
  label: string;
  description: string;
  config: ConfigField[];
}

interface NodeModification {
  operation: 'add' | 'modify' | 'remove';
  afterNodeId?: string;
  nodeId?: string;
  label?: string;
  description?: string;
  icon?: string;
  config?: ConfigField[];
}

interface ProcessingResult {
  transcript: string;
  modifications: NodeModification[];
  summary: string;
}

const SYSTEM_PROMPT = `You are an AI assistant for Sola, a process automation platform. You analyze voice transcripts from screen recordings where users demonstrate new steps they want added to an existing workflow.

The current workflow is a **contract parsing pipeline** with steps like: Upload Contract → Parse Document → Extract Fields → Validate Data → Format Output → Upload to System.

Your job is to interpret what the user demonstrated/described in their recording and propose structured modifications to the workflow. Think step by step about:
1. What new steps the user wants to add
2. Where in the pipeline they should go (after which existing node)
3. Whether any existing steps need to be modified (e.g., adding new fields to extract)
4. Whether any steps should be removed

Available Lucide icon names for new nodes: FileUp, ScanText, ListChecks, ShieldCheck, Braces, CloudUpload, Search, Globe, Database, Filter, GitCompare, FileCheck, Mail, Bell, Calculator, Link, Eye, RefreshCw, Zap, CircleDot

Return your response as valid JSON matching the required schema.`;

const TOOL_SCHEMA = {
  name: 'propose_workflow_changes',
  description: 'Propose modifications to the workflow based on the recording transcript',
  input_schema: {
    type: 'object' as const,
    properties: {
      modifications: {
        type: 'array',
        description: 'List of changes to apply to the workflow',
        items: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              enum: ['add', 'modify', 'remove'],
              description: 'The type of change',
            },
            afterNodeId: {
              type: 'string',
              description: 'For "add": the ID of the node to insert after',
            },
            nodeId: {
              type: 'string',
              description: 'For "modify" and "remove": the ID of the target node',
            },
            label: {
              type: 'string',
              description: 'For "add" and "modify": the step label',
            },
            description: {
              type: 'string',
              description: 'For "add" and "modify": short description of what this step does',
            },
            icon: {
              type: 'string',
              description: 'For "add": Lucide icon name',
            },
            config: {
              type: 'array',
              description: 'For "add" and "modify": configuration fields',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  value: { type: 'string' },
                },
                required: ['label', 'value'],
              },
            },
          },
          required: ['operation'],
        },
      },
      summary: {
        type: 'string',
        description: 'A one-sentence summary of the proposed changes',
      },
    },
    required: ['modifications', 'summary'],
  },
};

export async function proposeChanges(
  transcript: string,
  currentNodes: NodeSummary[],
): Promise<ProcessingResult> {
  const nodesDescription = currentNodes.length > 0
    ? currentNodes.map((n) => `- ${n.id}: "${n.label}" (${n.description})`).join('\n')
    : `- upload-contract: "Upload Contract" (PDF input)
- parse-document: "Parse Document" (OCR / extraction)
- extract-fields: "Extract Fields" (Party names, dates, values)
- validate-data: "Validate Data" (Check required fields)
- format-output: "Format Output" (Structure for downstream)
- upload-to-system: "Upload to System" (API call)`;

  const userMessage = `Here is the transcript from the user's screen recording:

"${transcript}"

Current workflow nodes (in order):
${nodesDescription}

Based on what the user described/demonstrated, propose the workflow modifications.`;

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [TOOL_SCHEMA],
    tool_choice: { type: 'tool', name: 'propose_workflow_changes' },
    messages: [{ role: 'user', content: userMessage }],
  });

  // Extract the tool use result
  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool use response');
  }

  const input = toolUse.input as { modifications: NodeModification[]; summary: string };

  return {
    transcript,
    modifications: input.modifications,
    summary: input.summary,
  };
}
