import type { INodeType, INodeTypeDescription, ISupplyDataFunctions } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
// @ts-ignore - @langchain/core is provided by n8n at runtime
import { BaseOutputParser } from '@langchain/core/output_parsers';

/**
 * LangChain output parser that passes through any text without parsing
 */
class AnyParser extends BaseOutputParser<string> {
	lc_namespace = ['n8n-nodes-ai-utils', 'AnyParser'];
	async parse(text: string): Promise<{ output: string }> {
		try {
			const parsedJSON = JSON.parse(text);

			if (parsedJSON && typeof parsedJSON === 'object' && typeof parsedJSON.text === 'string') {
				return { output: parsedJSON.text };
			}

			return { output: text };

		} catch {
			return { output: text };
		}

	}

	getFormatInstructions(): string {
		return 'Output any text as-is without parsing.';
	}

	getSchema() {
		return;
	}


}

export class AnyOutputParser implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Any Output Parser',
		name: 'anyOutputParser',
		icon: 'fa:code',
		group: ['transform'],
		version: 1,
		description: 'Output parser that passes through any text without parsing',
		defaults: { name: 'Any Output Parser' },
		codex: {
			categories: ['AI'],
			subcategories: { AI: ['Output Parsers'] },
		},
		inputs: [],
		outputs: [NodeConnectionTypes.AiOutputParser],
		outputNames: ['Output Parser'],
		properties: [],
	};


	async supplyData(this: ISupplyDataFunctions, itemIndex: number) {
		const parser = new AnyParser();

		return { response: parser };
	}
}

