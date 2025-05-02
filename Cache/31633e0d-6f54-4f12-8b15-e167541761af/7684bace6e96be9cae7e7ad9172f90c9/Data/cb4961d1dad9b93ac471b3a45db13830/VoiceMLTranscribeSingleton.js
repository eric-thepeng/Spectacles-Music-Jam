"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceMLTranscribeSingleton = void 0;
const Event_1 = require("../../SpectaclesInteractionKit/Utils/Event");
const Singleton_1 = require("../../SpectaclesInteractionKit/Decorators/Singleton");
let VoiceMLTranscribeSingleton = class VoiceMLTranscribeSingleton {
    constructor() {
        this.listening = false;
        this.didInitialise = false;
        this.targetTextField = null;
        this.voiceMLOptions = VoiceML.ListeningOptions.create();
        this.onTranscriptionFinalizedEvent = new Event_1.default();
        this.onTranscriptionFinalized = this.onTranscriptionFinalizedEvent.publicApi();
    }
    init(module) {
        if (this.didInitialise) {
            print("VoiceMLTranscribeSingleton. Tried to initialize twice");
            return;
        }
        this.voiceMLModule = module;
        this.voiceMLModule.onListeningUpdate.add((evt) => {
            if (evt.transcription.trim() == "") {
                return;
            }
            if (!isNull(this.targetTextField)) {
                this.targetTextField.text = evt.transcription;
            }
            else {
                return;
            }
            if (evt.isFinalTranscription) {
                this.onTranscriptionFinalizedEvent.invoke();
            }
            print("Transcription: " + evt.transcription);
            print("Is final Transcription: " + evt.isFinalTranscription);
        });
        this.didInitialise = true;
    }
    startListening(newTargetTextField) {
        if (!this.didInitialise) {
            print("VoiceMLTranscribeSingleton. Tried to listen before initializing");
            return;
        }
        this.targetTextField = newTargetTextField;
        this.voiceMLModule.startListening(this.voiceMLOptions);
        this.listening = true;
    }
    stopListening() {
        this.voiceMLModule.stopListening();
        this.listening = false;
    }
};
exports.VoiceMLTranscribeSingleton = VoiceMLTranscribeSingleton;
exports.VoiceMLTranscribeSingleton = VoiceMLTranscribeSingleton = __decorate([
    Singleton_1.Singleton
], VoiceMLTranscribeSingleton);
//# sourceMappingURL=VoiceMLTranscribeSingleton.js.map