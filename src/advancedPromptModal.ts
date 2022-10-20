import { App, Modal, Setting, SliderComponent } from "obsidian";
import { OpenAICommands } from "./OpenAICommands";

export class PromptModal extends Modal {
  private prompt: string;
  private openAi: OpenAICommands;

  private replaceText: (text: string) => void;
    constructor(app: App, prompt: string, replaceText: (text: string) => void, openAi: OpenAICommands) {
    super(app);
    this.prompt = prompt;
    this.replaceText = replaceText;
    this.openAi = openAi;
  }

  setText(text: string){
    this.replaceText(text);
    this.close();
  }
  
  async onOpen() {
    let { contentEl, titleEl, modalEl } = this;
    titleEl.setText("Prompt Settings");

		var tokens = new Setting(contentEl)
			.setName('Max Tokens')
			.setDesc('The maximum number of [tokens](/tokenizer) to generate in the completion.  The token count of your prompt plus `max_tokens` cannot exceed the model\'s context length. 4096')
			.addSlider(slider => slider
        .setValue(this.openAi.completionConfig.max_tokens || 256)
        .setLimits(50, 4096, 25)
				.onChange(async (value) => {
          this.openAi.updateCompletionConfig("max_tokens", value)
          inputNumber.value = value.toString();
				}));
        var number = tokens.settingEl.createDiv();
        var inputNumber = number.createEl('input');
        inputNumber.setAttribute("type", "number");
        inputNumber.value = (this.openAi.completionConfig.max_tokens || 265 ).toString()
        inputNumber.className ="slider-input";
        inputNumber.onchange = (e)=> {
          if(tokens.components[0]){
            var slider = tokens.components[0] as SliderComponent;
            slider.setValue(+inputNumber.value)
          }
        }
        
        var temperature = new Setting(contentEl)
        .setName('Temperature')
        .setDesc('What [sampling temperature] to use. Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 (argmax sampling) for ones with a well-defined answer.  We generally recommend altering this or `top_p` but not both')
        .addSlider(slider => slider
          .setValue(this.openAi.completionConfig.temperature || 0.8)
          .setLimits(0, 1, 0.1)
          .onChange(async (value) => {
            this.openAi.updateCompletionConfig("temperature", value)
            inputNumberToTemperature.value = value.toString();
          }));
          var numberToTemperature = temperature.settingEl.createDiv();
          var inputNumberToTemperature = numberToTemperature.createEl('input');
          inputNumberToTemperature.setAttribute("type", "number");
          inputNumberToTemperature.value = (this.openAi.completionConfig.temperature || 0.8 ).toString()
          inputNumberToTemperature.className ="slider-input";
          inputNumberToTemperature.onchange = (e)=> {
            if(temperature.components[0]){
              var slider = temperature.components[0] as SliderComponent;
              slider.setValue(+inputNumberToTemperature.value)
            }
          }
          
          new Setting(contentEl).addButton((btn)=>{
            btn.setButtonText("Submit")
            btn.onClick(async (e)=>{
              btn.setButtonText("Requesting...")
              btn.disabled = true;
              const text = await this.openAi.prompt(this.prompt).then(response => {
                return response.data.choices[0].text;
              })
              this.close();
              this.replaceText(text as string);
            })
          })
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}