"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceNote = void 0;
var __selfType = requireType("./VoiceNote");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const VoiceMLTranscribeSingleton_1 = require("./VoiceMLTranscribeSingleton");
const Widget_1 = require("../Widget");
const Event_1 = require("../../SpectaclesInteractionKit/Utils/Event");
let VoiceNote = class VoiceNote extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.transcriber = VoiceMLTranscribeSingleton_1.VoiceMLTranscribeSingleton.getInstance();
            this.meshMaterial = this.noteMesh.mainMaterial.clone();
            this.noteMesh.mainMaterial = this.meshMaterial;
            this.recordToggle.onStateChanged.add(this.toggleIsRecording.bind(this));
            this.widget = this.sceneObject.getComponent(Widget_1.Widget.getTypeName());
            this.deleteButton.onButtonPinched.add(() => {
                this.widget.delete();
            });
            this.noteInteractable.onHoverUpdate.add(() => {
                this.lastHoveredTime = getTime();
            });
        });
        this.createEvent("UpdateEvent").bind(() => {
            if (getTime() - this.timeToShowButtonsAfterHover < this.lastHoveredTime) {
                this.recordToggle.getSceneObject().enabled = true;
                this.deleteButton.getSceneObject().enabled = true;
            }
            else {
                this.recordToggle.getSceneObject().enabled = false;
                this.deleteButton.getSceneObject().enabled = false;
            }
        });
    }
    toggleIsRecording(isRecording) {
        this.onPreRecordToggleChangeState.invoke(isRecording);
        if (isRecording) {
            this.transcriber.startListening(this.textField);
            this.unsubscribeOnonTranscriptionFinalized =
                this.transcriber.onTranscriptionFinalized.add(this.handleTranscriptionFinalized.bind(this));
        }
        else {
            this.transcriber.stopListening();
            this.transcriber.onTranscriptionFinalized.remove(this.unsubscribeOnonTranscriptionFinalized);
        }
        const passCount = this.meshMaterial.getPassCount();
        if (passCount >= 2) {
            this.meshMaterial.getPass(1).strength = isRecording ? 1.0 : 0.0;
        }
    }
    handleTranscriptionFinalized() {
        this.widget.updateContent();
    }
    /**
     * Set the recording state of the voice note
     * @param isRecording - the recording state
     */
    toggleRecordButton(isRecording) {
        if (this.recordToggle.isToggledOn === isRecording) {
            return;
        }
        this.recordToggle.toggle();
    }
    __initialize() {
        super.__initialize();
        this.lastHoveredTime = -1;
        this.timeToShowButtonsAfterHover = 2;
        this.onPreRecordToggleChangeState = new Event_1.default();
        this.OnPreRecordToggleChangeState = this.onPreRecordToggleChangeState.publicApi();
    }
};
exports.VoiceNote = VoiceNote;
exports.VoiceNote = VoiceNote = __decorate([
    component
], VoiceNote);
//# sourceMappingURL=VoiceNote.js.map