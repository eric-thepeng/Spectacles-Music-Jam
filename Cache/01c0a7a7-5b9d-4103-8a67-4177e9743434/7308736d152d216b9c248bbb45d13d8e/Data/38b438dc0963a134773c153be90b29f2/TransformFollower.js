"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformFollower = void 0;
var __selfType = requireType("./TransformFollower");
function component(target) { target.getTypeName = function () { return __selfType; }; }
/**
 * A simple button using SpectaclesInteractionKit events to signal user intent to select a certain area and load serialized content.
 */
let TransformFollower = class TransformFollower extends BaseScriptComponent {
    onAwake() {
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }
    onUpdate() {
        if (this.target == null) {
            return;
        }
        const rotation = this.target
            .getWorldRotation()
            .multiply(this.rotationOffset);
        const position = this.target
            .getWorldPosition()
            .add(rotation.multiplyVec3(this.translationOffset));
        this.transform.setWorldTransform(mat4.compose(position, rotation, vec3.one()));
    }
    setTarget(target, translationOffset, rotationOffset) {
        this.target = target;
        this.translationOffset = translationOffset;
        this.rotationOffset = rotationOffset;
    }
    __initialize() {
        super.__initialize();
        this.transform = this.getTransform();
    }
};
exports.TransformFollower = TransformFollower;
exports.TransformFollower = TransformFollower = __decorate([
    component
], TransformFollower);
//# sourceMappingURL=TransformFollower.js.map