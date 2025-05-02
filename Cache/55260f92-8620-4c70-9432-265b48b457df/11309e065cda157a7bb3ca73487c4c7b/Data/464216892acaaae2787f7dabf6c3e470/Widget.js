"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Widget = void 0;
var __selfType = requireType("./Widget");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Event_1 = require("../SpectaclesInteractionKit/Utils/Event");
const SnapToWorld_1 = require("./WorldQuery/SnapToWorld");
const Interactable_1 = require("SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable");
const mathUtils_1 = require("SpectaclesInteractionKit/Utils/mathUtils");
const animate_1 = require("SpectaclesInteractionKit/Utils/animate");
const Billboard_1 = require("SpectaclesInteractionKit/Components/Interaction/Billboard/Billboard");
let Widget = class Widget extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    }
    onStart() {
        this.snapToWorld = SnapToWorld_1.SnapToWorld.getInstance();
        this.interactable = this.sceneObject.getComponent(Interactable_1.Interactable.getTypeName());
        this.billboard = this.sceneObject.getComponent(Billboard_1.Billboard.getTypeName());
        this.interactable.onDragStart.add((eventData) => {
            if (eventData.propagationPhase === "Target") {
                this.snapToWorld.startManipulating(eventData);
                this.billboard.enabled = true;
            }
        });
        this.interactable.onDragUpdate.add((eventData) => {
            if (eventData.propagationPhase === "Target") {
                this.snapToWorld.updateManipulating(eventData);
            }
        });
        this.interactable.onDragEnd.add((eventData) => {
            if (eventData.propagationPhase === "Target") {
                //print("Note Drag End")
                // TEMP
                let transformOnNoteInWorld = this.snapToWorld.getCurrentTransform();
                if (transformOnNoteInWorld) {
                    //print( "Note We have a Transform in Note on End ****" + transformOnNoteInWorld.getWorldPosition() + " " + transformOnNoteInWorld.getWorldRotation() + " " + transformOnNoteInWorld.getWorldScale() )
                    // TEMP
                    const ANIMATION_LENGTH = 0.45;
                    this.interpolateStartTime = getTime();
                    this.interpolateEndTime =
                        this.interpolateStartTime + ANIMATION_LENGTH;
                    this.interpolatePosStart = this.getSceneObject()
                        .getTransform()
                        .getWorldPosition();
                    this.interpolatePosEnd = transformOnNoteInWorld.getWorldPosition();
                    this.interpolateRotStart = this.getSceneObject()
                        .getTransform()
                        .getWorldRotation();
                    this.interpolateRotEnd = transformOnNoteInWorld.getWorldRotation();
                    this.doInterpolate = true;
                }
                else {
                    //print("Note this.snapToWorld.getCurrentTransform() was null")
                }
                this.snapToWorld.endManipulating(eventData);
                this.billboard.enabled = false;
            }
        });
        this.createEvent("UpdateEvent").bind(() => {
            if (this.doInterpolate) {
                let frac = (0, mathUtils_1.mapValue)(getTime(), this.interpolateStartTime, this.interpolateEndTime, 0, 1);
                if (frac >= 1.0) {
                    this.doInterpolate = false;
                    // Serialize after the animation is finished.
                    this.updateContent();
                }
                frac = (0, mathUtils_1.clamp)(frac, 0, 1);
                frac = this.easingFunction(frac);
                let p = vec3.lerp(this.interpolatePosStart, this.interpolatePosEnd, frac);
                let rot = quat.slerp(this.interpolateRotStart, this.interpolateRotEnd, frac);
                this.getSceneObject().getTransform().setWorldPosition(p);
                this.getSceneObject().getTransform().setWorldRotation(rot);
            }
        });
    }
    set text(text) {
        this._text = text;
        this.textComponent.text = text;
    }
    get text() {
        return this.textComponent.text;
    }
    set prefabIndex(prefabIndex) {
        this._prefabIndex = prefabIndex;
    }
    get prefabIndex() {
        return this._prefabIndex;
    }
    set widgetIndex(widgetIndex) {
        this._widgetIndex = widgetIndex;
    }
    get widgetIndex() {
        return this._widgetIndex;
    }
    get transform() {
        return this.getTransform();
    }
    updateContent() {
        this.onUpdateContentEvent.invoke();
    }
    delete() {
        this.onDeleteEvent.invoke(this._widgetIndex);
    }
    __initialize() {
        super.__initialize();
        this.doInterpolate = false;
        this.interpolateStartTime = 0;
        this.interpolateEndTime = 0;
        this.interpolateRotStart = quat.quatIdentity();
        this.interpolateRotEnd = quat.quatIdentity();
        this.interpolatePosStart = vec3.zero();
        this.interpolatePosEnd = vec3.zero();
        this.easingFunction = animate_1.easingFunctions["ease-out-quart"];
        this.onDeleteEvent = new Event_1.default();
        this.onDelete = this.onDeleteEvent.publicApi();
        this.onUpdateContentEvent = new Event_1.default();
        this.onUpdateContent = this.onUpdateContentEvent.publicApi();
    }
};
exports.Widget = Widget;
exports.Widget = Widget = __decorate([
    component
], Widget);
//# sourceMappingURL=Widget.js.map