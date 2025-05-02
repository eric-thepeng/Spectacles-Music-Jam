"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapToWorldInit = void 0;
var __selfType = requireType("./SnapToWorldInit");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SnapToWorld_1 = require("./SnapToWorld");
let SnapToWorldInit = class SnapToWorldInit extends BaseScriptComponent {
    onAwake() {
        this.snapToWorld = SnapToWorld_1.SnapToWorld.getInstance();
        this.snapToWorld.init(this.voiceMLModule, this.previewInWorld);
        this.createEvent("OnStartEvent").bind(() => {
            this.snappingToggle.onStateChanged.add((isOn) => this.handleToggleStateChanged(isOn));
        });
        this.createEvent("UpdateEvent").bind(() => {
            this.snapToWorld.tick();
        });
    }
    handleToggleStateChanged(isToggledOn) {
        this.snapToWorld.isOn = isToggledOn;
    }
};
exports.SnapToWorldInit = SnapToWorldInit;
exports.SnapToWorldInit = SnapToWorldInit = __decorate([
    component
], SnapToWorldInit);
//# sourceMappingURL=SnapToWorldInit.js.map