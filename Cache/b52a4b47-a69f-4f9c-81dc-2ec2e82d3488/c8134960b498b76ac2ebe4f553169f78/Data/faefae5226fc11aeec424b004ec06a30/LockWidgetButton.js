"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoverWidgetButton = exports.RecoverState = void 0;
var __selfType = requireType("./LockWidgetButton");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SIK_1 = require("SpectaclesInteractionKit/SIK");
const Event_1 = require("SpectaclesInteractionKit/Utils/Event");
var RecoverState;
(function (RecoverState) {
    RecoverState[RecoverState["Recover"] = 0] = "Recover";
    RecoverState[RecoverState["Save"] = 1] = "Save";
})(RecoverState || (exports.RecoverState = RecoverState = {}));
let RecoverWidgetButton = class RecoverWidgetButton extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    }
    onStart() {
        this.interactable = this.sceneObject.getComponent(SIK_1.SIK.InteractionConfiguration.requireType("Interactable"));
        this.interactable.onTriggerEnd.add(() => {
            this.onRecoverEvent.invoke({ state: this.recoverState });
        });
        this.recoverState = RecoverState.Recover;
    }
    set recoverState(state) {
        this._recoverState = state;
        this.text.text = state === RecoverState.Recover ? "Recover" : "Save";
    }
    get recoverState() {
        return this._recoverState;
    }
    __initialize() {
        super.__initialize();
        this.onRecoverEvent = new Event_1.default();
        this.onRecover = this.onRecoverEvent.publicApi();
    }
};
exports.RecoverWidgetButton = RecoverWidgetButton;
exports.RecoverWidgetButton = RecoverWidgetButton = __decorate([
    component
], RecoverWidgetButton);
//# sourceMappingURL=LockWidgetButton.js.map