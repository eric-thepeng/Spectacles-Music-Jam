"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Piece = void 0;
var __selfType = requireType("./PieceTS");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SyncEntity_1 = require("SpectaclesSyncKit/Core/SyncEntity");
let Piece = class Piece extends BaseScriptComponent {
    finishTurn() {
        if (!this.isTurnFinished) {
            // Piece was moved, tell controller that my turn is complete   
            this.controller.finishTurn();
            this.isTurnFinished = true;
            if (this.showLogs) {
                print(this.sceneObj.name + " moved, turn finished");
            }
        }
    }
    onReady() {
        if (this.showLogs) {
            print("Sync entity is ready");
        }
        if (this.syncEntity.networkRoot.locallyCreated) {
            // Piece belongs to me, I can move it
            this.manipulatable.setCanTranslate(true);
            this.manipulatable.onManipulationEnd.add(() => this.finishTurn());
        }
        else {
            // Piece belongs to other player, I can't move it
            this.manipulatable.setCanTranslate(false);
        }
    }
    onAwake() {
        // Check if TS version of Controller is enabled
        if (!this.controller.getSceneObject().enabled)
            return;
        this.sceneObj = this.getSceneObject();
        // Get sync entity for SyncTransform script
        this.syncEntity = SyncEntity_1.SyncEntity.getSyncEntityOnSceneObject(this.sceneObj);
        // Check sync entity is ready before using it
        this.syncEntity.notifyOnReady(() => this.onReady());
    }
    __initialize() {
        super.__initialize();
        this.isTurnFinished = false;
    }
};
exports.Piece = Piece;
exports.Piece = Piece = __decorate([
    component
], Piece);
//# sourceMappingURL=PieceTS.js.map