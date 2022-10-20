import { App, Modal } from "obsidian";
import { text } from "stream/consumers";
var Diff = require('text-diff');

export class ImproveModal extends Modal {
  private improvedText: string;
  private originalText: string;
  private replaceText: (text: string) => void;
    constructor(app: App, original: string, improve: string, replaceText: (text: string) => void) {
    super(app);
    this.improvedText = improve;
    this.originalText = original;
    this.replaceText = replaceText;
  }

  setText(text: string){
    this.replaceText(text);
    this.close();
  }

  onOpen() {
    let { contentEl, titleEl, modalEl } = this;
    modalEl.style.width = "auto";
    titleEl.setText("Choose improvement");
    var containter = contentEl.createEl('div')
    containter.className = "text-diff-container";
    var original = containter.createDiv();
    original.className = "text-diff-original";
    original.setText(this.originalText);
    original.onclick = ()=>{this.close()};
    var improved  = containter.createDiv();
    improved.className = "text-diff-improved";
    improved.onclick = ()=>{this.setText(this.improvedText)}

    const diff = new Diff();
    let textDiff = diff.main(this.originalText, this.improvedText);
    improved.insertAdjacentHTML('beforeend', diff.prettyHtml(textDiff));
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}