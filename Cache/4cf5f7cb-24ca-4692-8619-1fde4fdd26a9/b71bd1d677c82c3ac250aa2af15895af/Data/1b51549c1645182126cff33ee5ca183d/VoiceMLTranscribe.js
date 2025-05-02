"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceMLTranscribe = void 0;
var __selfType = requireType("./VoiceMLTranscribe");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let VoiceMLTranscribe = class VoiceMLTranscribe extends BaseScriptComponent {
    onAwake() {
        this.voiceMLModule.onListeningEnabled.add(() => { });
        this.voiceMLModule.onListeningUpdate.add((evt) => {
            if (evt.transcription.trim() == '') {
                return;
            }
            if (this.targetTextField) {
                this.targetTextField.text = evt.transcription;
            }
            print('Transcription: ' + evt.transcription);
            print('Is final Transcription: ' + evt.isFinalTranscription);
        });
        this.voiceMLModule.onListeningError.add((evt) => {
            //print(`VoiceMLModule.onListeningError: ${evt.error}, ${evt.description}`)
        });
    }
    startListening(newTargetTextField) {
        this.targetTextField = newTargetTextField;
        this.voiceMLModule.startListening(this.voiceMLOptions);
        this.listening = true;
    }
    stopListening() {
        this.voiceMLModule.stopListening();
        this.listening = false;
    }
    /*
setListening(listening: boolean): void {
    //assert(this.initialized)
    if (this.listening === listening) return
    this.listening = listening

    if (listening) {
        print("VoiceMLModule.startListening")
        this.voiceMLModule.startListening(this.voiceMLOptions)
    } else {
        print("VoiceMLModule.stopListening")
        this.voiceMLModule.stopListening()
    }
}

get isInitialized(): boolean {
    return this.initialized
}*/
    get isListening() {
        return this.listening;
    }
    __initialize() {
        super.__initialize();
        this.voiceMLOptions = VoiceML.ListeningOptions.create();
        this.listening = false;
        this.targetTextField = null;
    }
};
exports.VoiceMLTranscribe = VoiceMLTranscribe;
exports.VoiceMLTranscribe = VoiceMLTranscribe = __decorate([
    component
], VoiceMLTranscribe);
//# sourceMappingURL=VoiceMLTranscribe.js.map