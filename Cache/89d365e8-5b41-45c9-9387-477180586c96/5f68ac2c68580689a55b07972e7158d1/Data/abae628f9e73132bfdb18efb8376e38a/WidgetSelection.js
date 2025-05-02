"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetSelection = void 0;
var __selfType = requireType("./WidgetSelection");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Billboard_1 = require("SpectaclesInteractionKit/Components/Interaction/Billboard/Billboard");
const Event_1 = require("../../SpectaclesInteractionKit/Utils/Event");
const SnapToWorld_1 = require("../WorldQuery/SnapToWorld");
let WidgetSelection = class WidgetSelection extends BaseScriptComponent {
    initialize(index) {
        this.snapToWorld = SnapToWorld_1.SnapToWorld.getInstance();
        this.index = index;
        this.interactableTransform = this.interactable.getTransform();
        this.interactable.onDragStart.add((eventData) => {
            this.snapToWorld.startManipulating(eventData);
            this.interactable.sceneObject.getComponent(Billboard_1.Billboard.getTypeName()).enabled = true;
        });
        // Had to cache the position in onDragUpdate as the ScreenTransform will enforce the layout position when onDragEnd is triggered
        this.interactable.onDragUpdate.add((eventData) => {
            this.snapToWorld.updateManipulating(eventData);
            this.cachedDragPosition = this.interactableTransform.getWorldPosition();
            this.cachedDragRotation = this.interactableTransform
                .getWorldRotation()
                .toEulerAngles();
        });
        this.interactable.onDragEnd.add((eventData) => {
            let transformOnNoteInWorld = this.snapToWorld.getCurrentTransform();
            if (transformOnNoteInWorld) {
                this.cachedDragPosition = transformOnNoteInWorld.getWorldPosition();
                this.cachedDragRotation = transformOnNoteInWorld
                    .getWorldRotation()
                    .toEulerAngles();
            }
            this.snapToWorld.endManipulating(eventData);
            this.interactable.sceneObject.getComponent(Billboard_1.Billboard.getTypeName()).enabled = false;
            this.interactable.sceneObject
                .getTransform()
                .setLocalRotation(quat.fromEulerAngles(0, 0, 0));
            this.onSelectedEvent.invoke({
                widgetIndex: this.index,
                position: this.cachedDragPosition,
                rotation: this.cachedDragRotation,
            });
        });
    }
    __initialize() {
        super.__initialize();
        this.onSelectedEvent = new Event_1.default();
        this.OnSelectedEvent = this.onSelectedEvent.publicApi();
    }
};
exports.WidgetSelection = WidgetSelection;
exports.WidgetSelection = WidgetSelection = __decorate([
    component
], WidgetSelection);
//# sourceMappingURL=WidgetSelection.js.map