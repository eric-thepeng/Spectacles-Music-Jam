"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingIndicatorController = void 0;
var __selfType = requireType("./LoadingIndicator");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let LoadingIndicatorController = class LoadingIndicatorController extends BaseScriptComponent {
    onAwake() {
        this.transform = this.sceneObject.getTransform();
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }
    onUpdate() {
        const rotationQuaternion = quat.angleAxis(this.speed * getDeltaTime(), this.transform.up);
        this.transform.setWorldRotation(rotationQuaternion.multiply(this.transform.getWorldRotation()));
    }
};
exports.LoadingIndicatorController = LoadingIndicatorController;
exports.LoadingIndicatorController = LoadingIndicatorController = __decorate([
    component
], LoadingIndicatorController);
//# sourceMappingURL=LoadingIndicator.js.map