"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleMenuButton = void 0;
var __selfType = requireType("./ToggleMenuButton");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SIK_1 = require("../../SpectaclesInteractionKit/SIK");
const TransformFollower_1 = require("./TransformFollower");
/**
 * A simple button using SpectaclesInteractionKit events to signal user intent to select a certain area and load serialized content.
 */
let ToggleMenuButton = class ToggleMenuButton extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    }
    onStart() {
        this.onStateChanged = this.toggleButton.onStateChanged;
        this.toggleButton.onStateChanged.add(this.handleStateChanged.bind(this));
        this.visuals = [
            this.sceneObject.getChild(0).getComponent("Component.RenderMeshVisual"),
            this.sceneObject.getChild(1).getComponent("Component.RenderMeshVisual"),
        ];
        this.interactable.onHoverEnter.add(() => {
            this.visuals[0].mainMaterial.mainPass.hovered = 1;
            this.visuals[1].mainMaterial.mainPass.hovered = 1;
        });
        this.interactable.onHoverExit.add(() => {
            this.visuals[0].mainMaterial.mainPass.hovered = 0;
            this.visuals[1].mainMaterial.mainPass.hovered = 0;
        });
        this.transformFollower = this.sceneObject.getComponent(TransformFollower_1.TransformFollower.getTypeName());
    }
    handleStateChanged(isToggledOn) {
        if (this.targetMenu == null) {
            return;
        }
        this.targetMenu.enabled = isToggledOn;
    }
    setTargetMenu(targetMenu) {
        this.targetMenu = targetMenu;
    }
    setFollowTarget(followTarget, translationOffset, rotationOffset) {
        this.transformFollower.setTarget(followTarget, translationOffset, rotationOffset);
    }
    __initialize() {
        super.__initialize();
        this.toggleButton = this.sceneObject.getComponent(SIK_1.SIK.InteractionConfiguration.requireType("ToggleButton"));
        this.interactable = this.sceneObject.getComponent(SIK_1.SIK.InteractionConfiguration.requireType("Interactable"));
    }
};
exports.ToggleMenuButton = ToggleMenuButton;
exports.ToggleMenuButton = ToggleMenuButton = __decorate([
    component
], ToggleMenuButton);
//# sourceMappingURL=ToggleMenuButton.js.map