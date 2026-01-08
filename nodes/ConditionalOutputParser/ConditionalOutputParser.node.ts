import type { INodeType, INodeTypeDescription, ISupplyDataFunctions } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
// @ts-ignore - @langchain/core is provided by n8n at runtime
import { BaseOutputParser } from '@langchain/core/output_parsers';

interface ConditionalParserOptions {
	useFirstParser: boolean;
	parserA: BaseOutputParser<unknown>;
	parserB: BaseOutputParser<unknown>;
}

/**
 * LangChain output parser that conditionally uses one of two parsers based on a boolean flag
 */
class ConditionalParser extends BaseOutputParser<unknown> {
	private useFirstParser: boolean;
	private parserA: BaseOutputParser<unknown>;
	private parserB: BaseOutputParser<unknown>;

	constructor(options: ConditionalParserOptions) {
		super();
		this.useFirstParser = options.useFirstParser;
		this.parserA = options.parserA;
		this.parserB = options.parserB;
	}

	getParser(): BaseOutputParser<unknown> {
		return this.useFirstParser ? this.parserA : this.parserB;
	}

	async parse(text: string): Promise<unknown> {
		const parser = this.getParser();
		return parser.parse(text);
	}

	getFormatInstructions(): string {
		const parser = this.getParser();
		return parser.getFormatInstructions();
	}

	getSchema() {
		const parser = this.getParser();
		// Call getSchema if it exists on the parser
		if (typeof parser.getSchema === 'function') {
			return parser.getSchema();
		}
	}

	lc_namespace = ['n8n-nodes-ai-utils', 'ConditionalParser'];
}

export class ConditionalOutputParser implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Conditional Output Parser',
		name: 'conditionalOutputParser',
		icon: 'fa:code-branch',
		group: ['transform'],
		version: 1,
		description: 'Choose between two output parsers based on a boolean flag',
		defaults: { name: 'Conditional Output Parser' },
		codex: {
			categories: ['AI'],
			subcategories: { AI: ['Output Parsers'] },
		},
		inputs: [
			{
				displayName: 'Parsers',
				maxConnections: 2,
				required: true,
				type: NodeConnectionTypes.AiOutputParser,
			},
		],
		inputNames: ['Parser When True', 'Parser When False'],
		outputs: [NodeConnectionTypes.AiOutputParser],
		outputNames: ['Output Parser'],
		properties: [
			{
				displayName: 'Use First Parser',
				name: 'useFirstParser',
				type: 'boolean',
				default: true,
				description: 'If true use the first parser (Parser When True), otherwise use the second parser (Parser When False)',
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number) {
		const useFirstParser = this.getNodeParameter('useFirstParser', itemIndex, true) as boolean;

		const [parserA, parserB] = await this.getInputConnectionData(NodeConnectionTypes.AiOutputParser, itemIndex) as BaseOutputParser<unknown>[];

		if (!parserA || !parserB) {
			throw new Error('Two parsers must be connected');
		}

		const parser = new ConditionalParser({
			useFirstParser,
			parserA,
			parserB,
		});

		return { response: parser };
	}
}

