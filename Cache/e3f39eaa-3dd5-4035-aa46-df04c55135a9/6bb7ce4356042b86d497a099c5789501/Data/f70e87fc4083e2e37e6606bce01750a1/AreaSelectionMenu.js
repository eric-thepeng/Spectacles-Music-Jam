"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaSelectionMenu = exports.NEW_AREA_NAME = void 0;
var __selfType = requireType("./AreaSelectionMenu");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Event_1 = require("SpectaclesInteractionKit/Utils/Event");
const AreaSelectionButton_1 = require("./AreaSelectionButton");
const ContainerFrame_1 = require("SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame");
const AreaDeleteButton_1 = require("./AreaDeleteButton");
exports.NEW_AREA_NAME = "New Area";
/**
 * A simple menu to create several AreaSelectionButtons to allow user to choose between several areas (or create a new area).
 */
let AreaSelectionMenu = class AreaSelectionMenu extends BaseScriptComponent {
    onAwake() {
        this.areaSelectionButtonPrefab = requireAsset("Prefabs/AreaSelectionButtonPrefab");
        this.areaDeleteButtonPrefab = requireAsset("Prefabs/AreaDeleteButtonPrefab");
        this.capsuleButtonMesh = requireAsset("SpectaclesInteractionKit/Assets/Meshes/ButtonCapsuleMesh");
        if (this.capsuleButtonMesh == null) {
            throw new Error("capsuleButtonMesh not found at SpectaclesInteractionKit/Assets/Meshes/ButtonCapsuleMesh");
        }
    }
    /**
     * Generates AreaSelectionButtons to represent all serialized areas to allow user to load into a certain area,
     * which will also instantiate previously serialized widgets through AreaManager's callback logic for onAreaSelectEvent.
     * @param areaNames - the names of all serialized areas available to load
     */
    promptAreaSelection(areaNames) {
        const height = 3 * (areaNames.length - 1) + 6 + 6 + 4;
        this.container.innerSize = new vec2(this.container.innerSize.x, height);
        this.selectionEnabled = true;
        areaNames.push(exports.NEW_AREA_NAME);
        let yOffset = height / 2 - 2;
        for (const areaName of areaNames) {
            const prefab = this.areaSelectionButtonPrefab.instantiate(this.sceneObject);
            const areaSelectionButton = prefab.getComponent(AreaSelectionButton_1.AreaSelectionButton.getTypeName());
            if (areaName === exports.NEW_AREA_NAME) {
                yOffset -= 3;
            }
            areaSelectionButton
                .getTransform()
                .setLocalPosition(new vec3(0, yOffset, 0));
            yOffset -= 3;
            areaSelectionButton.text = areaName;
            areaSelectionButton.onSelect.add(() => {
                this.selectionEnabled = false;
                // Add an extra AreaSelectionButton for new areas.
                // TODO: Add text input to area creation.
                if (areaName === exports.NEW_AREA_NAME) {
                    this.onAreaSelectEvent.invoke({
                        areaName: this.findNextAreaName(areaNames),
                        isNew: true,
                    });
                }
                else {
                    this.onAreaSelectEvent.invoke({ areaName: areaName, isNew: false });
                }
            });
            const material = prefab
                .getChild(0)
                .getComponent("RenderMeshVisual")
                .mainMaterial.clone();
            if (areaName === exports.NEW_AREA_NAME) {
                // TODO: Finalize color.
                material.mainPass.baseColor = new vec4(158 / 255, 142 / 255, 0 / 255, 1);
            }
            else {
                const deleteButtonObject = this.areaDeleteButtonPrefab.instantiate(this.sceneObject);
                deleteButtonObject
                    .getTransform()
                    .setLocalPosition(new vec3(-7, yOffset + 3, 0));
                const deleteButton = deleteButtonObject.getComponent(AreaDeleteButton_1.AreaDeleteButton.getTypeName());
                deleteButton.initialize(this.capsuleButtonMesh, areaSelectionButton.buttonMesh);
                let isConfirmed = false;
                deleteButton.onSelect.add(() => {
                    if (isConfirmed) {
                        this.onAreaDeleteEvent.invoke({
                            areaName: areaName,
                            isConfirmed: isConfirmed,
                        });
                    }
                    else {
                        this.onAreaDeleteEvent.invoke({
                            areaName: areaName,
                            isConfirmed: isConfirmed,
                        });
                        isConfirmed = true;
                        deleteButton.setIsConfirming();
                    }
                });
            }
            prefab.getChild(0).getComponent("RenderMeshVisual").mainMaterial =
                material;
        }
        // Add an extra AreaSelectionButton to clear all previously serialized areas, then re-prompt for area selection.
        const prefab = this.areaSelectionButtonPrefab.instantiate(this.sceneObject);
        const clearAllDataButton = prefab.getComponent(AreaSelectionButton_1.AreaSelectionButton.getTypeName());
        clearAllDataButton.text = "Clear All Data";
        clearAllDataButton.onSelect.add(() => {
            if (clearAllDataButton.text === "Clear All Data") {
                // TODO: Add text to the central text notification.
                this.onAreaClearEvent.invoke({ isConfirmed: false });
                clearAllDataButton.text = "Confirm";
            }
            else {
                this.onAreaClearEvent.invoke({ isConfirmed: true });
            }
        });
        yOffset -= 3;
        clearAllDataButton.getTransform().setLocalPosition(new vec3(0, yOffset, 0));
        const material = prefab
            .getChild(0)
            .getComponent("RenderMeshVisual")
            .mainMaterial.clone();
        material.mainPass.baseColor = new vec4(168 / 255, 34 / 255, 34 / 255, 1);
        prefab.getChild(0).getComponent("RenderMeshVisual").mainMaterial = material;
    }
    close() {
        this.selectionEnabled = false;
    }
    set selectionEnabled(enabled) {
        if (enabled) {
            this.clearAreaSelectionButtons();
        }
        this.container.sceneObject.enabled = enabled;
        // this.sceneObject.enabled = enabled;
    }
    clearAreaSelectionButtons() {
        const children = this.sceneObject.children;
        for (const child of children) {
            child.destroy();
        }
    }
    findNextAreaName(areaNames) {
        let i = 1;
        let areaName = `Area ${i}`;
        while (areaNames.includes(areaName)) {
            i++;
            areaName = `Area ${i}`;
        }
        return areaName;
    }
    __initialize() {
        super.__initialize();
        this.onAreaSelectEvent = new Event_1.default();
        this.onAreaSelect = this.onAreaSelectEvent.publicApi();
        this.onAreaDeleteEvent = new Event_1.default();
        this.onAreaDelete = this.onAreaDeleteEvent.publicApi();
        this.onAreaClearEvent = new Event_1.default();
        this.onAreaClear = this.onAreaClearEvent.publicApi();
        this.container = this.sceneObject
            .getParent()
            .getParent()
            .getComponent(ContainerFrame_1.ContainerFrame.getTypeName());
    }
};
exports.AreaSelectionMenu = AreaSelectionMenu;
exports.AreaSelectionMenu = AreaSelectionMenu = __decorate([
    component
], AreaSelectionMenu);
//# sourceMappingURL=AreaSelectionMenu.js.map