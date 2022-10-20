export interface OpenAiSettings {
	openAPIKey: string;
	summary: {
		prompt: string,
		tokens: number,
		yamlKey: string
	}
	improvePrompt: string;
}