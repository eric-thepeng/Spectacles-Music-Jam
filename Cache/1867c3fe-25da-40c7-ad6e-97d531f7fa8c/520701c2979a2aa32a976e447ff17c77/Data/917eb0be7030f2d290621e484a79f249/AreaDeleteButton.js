"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaDeleteButton = void 0;
var __selfType = requireType("./AreaDeleteButton");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const InteractableOutlineFeedback_1 = require("SpectaclesInteractionKit/Components/Helpers/InteractableOutlineFeedback");
const SIK_1 = require("SpectaclesInteractionKit/SIK");
const Event_1 = require("SpectaclesInteractionKit/Utils/Event");
/**
 * A simple button using SpectaclesInteractionKit events to signal user intent to delete a certain area.
 */
let AreaDeleteButton = class AreaDeleteButton extends BaseScriptComponent {
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
     * Initializes the delete button with a mesh for its confirming state and the area selection button associated with it
     * @param confirmButtonMesh - Button mesh for its confirming state
     * @param targetAreaButton - The area selection button of the same area
     */
    initialize(confirmButtonMesh, targetAreaButton) {
        this.confirmButtonMesh = confirmButtonMesh;
        const outlineFeedback = this.sceneObject.getComponent(InteractableOutlineFeedback_1.InteractableOutlineFeedback.getTypeName());
        outlineFeedback.meshVisuals.push(targetAreaButton);
        this.isInitialized = true;
    }
    /**
     * Set the delete button to its confirming state, where the area deletion will be executed once the button is triggered again
     */
    setIsConfirming() {
        if (!this.isInitialized) {
            throw new Error("AreaDeleteButton.initialize() haven't been called");
        }
        this.textComponent.text = "Confirm";
        this.buttonMesh.mesh = this.confirmButtonMesh;
        this.buttonMesh.getTransform().setLocalScale(new vec3(0.6, 1, 1));
    }
    __initialize() {
        super.__initialize();
        this.isInitialized = false;
        this.onSelectEvent = new Event_1.default();
        this.onSelect = this.onSelectEvent.publicApi();
    }
};
exports.AreaDeleteButton = AreaDeleteButton;
exports.AreaDeleteButton = AreaDeleteButton = __decorate([
    component
], AreaDeleteButton);
//# sourceMappingURL=AreaDeleteButton.js.map