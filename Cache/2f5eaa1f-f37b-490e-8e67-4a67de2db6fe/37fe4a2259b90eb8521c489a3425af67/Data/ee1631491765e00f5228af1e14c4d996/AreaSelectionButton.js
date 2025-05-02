"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaSelectionButton = void 0;
var __selfType = requireType("./AreaSelectionButton");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SIK_1 = require("SpectaclesInteractionKit/SIK");
const Event_1 = require("SpectaclesInteractionKit/Utils/Event");
/**
 * A simple button using SpectaclesInteractionKit events to signal user intent to select a certain area and load serialized content.
 */
let AreaSelectionButton = class AreaSelectionButton extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    }
    onStart() {
        this.interactable = this.sceneObject.getComponent(SIK_1.SIK.InteractionConfiguration.requireType("Interactable"));
        this.interactable.onTriggerEnd.add((event) => {
            this.onSelectEvent.invoke();
        });
    }
    /**
     * Set the name of the associated area for this button.
     */
    set text(text) {
        this.textComponent.text = text;
    }
    /**
     * Get the name of the associated area for this button.
     */
    get text() {
        return this.textComponent.text;
    }
    __initialize() {
        super.__initialize();
        this.onSelectEvent = new Event_1.default();
        this.onSelect = this.onSelectEvent.publicApi();
    }
};
exports.AreaSelectionButton = AreaSelectionButton;
exports.AreaSelectionButton = AreaSelectionButton = __decorate([
    component
], AreaSelectionButton);
//# sourceMappingURL=AreaSelectionButton.js.map