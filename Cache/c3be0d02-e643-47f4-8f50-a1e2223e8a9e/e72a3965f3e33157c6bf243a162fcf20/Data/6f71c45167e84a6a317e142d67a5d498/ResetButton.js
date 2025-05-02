"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetButton = void 0;
var __selfType = requireType("./ResetButton");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SIK_1 = require("SpectaclesInteractionKit/SIK");
const Event_1 = require("SpectaclesInteractionKit/Utils/Event");
/**
 * A simple button using SpectaclesInteractionKit events to signal user intent to reset the entire area to an empty state.
 */
let ResetButton = class ResetButton extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    }
    onStart() {
        this.interactable = this.sceneObject.getComponent(SIK_1.SIK.InteractionConfiguration.requireType("Interactable"));
        this.interactable.onTriggerEnd.add((event) => {
            this.onResetEvent.invoke();
        });
    }
    __initialize() {
        super.__initialize();
        this.onResetEvent = new Event_1.default();
        this.onReset = this.onResetEvent.publicApi();
    }
};
exports.ResetButton = ResetButton;
exports.ResetButton = ResetButton = __decorate([
    component
], ResetButton);
//# sourceMappingURL=ResetButton.js.map