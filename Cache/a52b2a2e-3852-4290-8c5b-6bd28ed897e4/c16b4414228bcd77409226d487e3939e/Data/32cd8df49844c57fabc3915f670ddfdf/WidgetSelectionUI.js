"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetSelectionUI = void 0;
var __selfType = requireType("./WidgetSelectionUI");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const WidgetSelection_1 = require("./WidgetSelection");
const Event_1 = require("../../SpectaclesInteractionKit/Utils/Event");
let WidgetSelectionUI = class WidgetSelectionUI extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }
    onStart() {
        const xStart = 0;
        for (let i = 0; i < this.widgetSelections.length; i++) {
            const widgetSelection = this.widgetSelections[i].instantiate(this.widgetSelectionParent);
            const screenTransform = widgetSelection.getComponent("Component.ScreenTransform");
            screenTransform.offsets.setCenter(new vec2(xStart + this.itemsOffset * i, 0));
            const widget = widgetSelection.getComponent(WidgetSelection_1.WidgetSelection.getTypeName());
            widget.initialize(i);
            widget.OnSelectedEvent.add((event) => this.onSelectionTriggered(event));
            widgetSelection.enabled = true;
        }
    }
    onSelectionTriggered(event) {
        this.onAddEvent.invoke(event);
    }
    __initialize() {
        super.__initialize();
        this.onAddEvent = new Event_1.default();
        this.onAdd = this.onAddEvent.publicApi();
    }
};
exports.WidgetSelectionUI = WidgetSelectionUI;
exports.WidgetSelectionUI = WidgetSelectionUI = __decorate([
    component
], WidgetSelectionUI);
//# sourceMappingURL=WidgetSelectionUI.js.map