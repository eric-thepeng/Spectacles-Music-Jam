"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerTS = void 0;
var __selfType = requireType("./ControllerTS");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Instantiator_1 = require("SpectaclesSyncKit/Components/Instantiator");
const SessionController_1 = require("SpectaclesSyncKit/Core/SessionController");
const StorageProperty_1 = require("SpectaclesSyncKit/Core/StorageProperty");
const SyncEntity_1 = require("SpectaclesSyncKit/Core/SyncEntity");
let ControllerTS = class ControllerTS extends BaseScriptComponent {
    finishTurn() {
        // Increment the turns property    
        if (this.showLogs) {
            print("Turn finished");
        }
        const turnsCount = this.turnsProp.currentValue + 1;
        this.turnsProp.setPendingValue(turnsCount);
    }
    onReady() {
        if (this.showLogs) {
            print("Sync entity is ready");
        }
        const playerCount = SessionController_1.SessionController.getInstance().getUsers().length;
        // Assign pieces to users
        // The first player is X, the second is O, everyone else is a spectator
        if (playerCount === 1) {
            this.player = "X";
        }
        else if (playerCount === 2) {
            this.player = "O";
        }
        else {
            this.player = "";
        }
        // If O is assigned, send event to start the game
        if (this.player === "O") {
            this.syncEntity.sendEvent("start");
        }
    }
    setTurn(newCount, oldCount) {
        // No player has completed a turn yet, don't do anything
        if (newCount === 0)
            return;
        // The maximum number of turns have been played, the game is over
        if (newCount === this.MAX_TURNS) {
            this.isGameOver = true;
            if (this.showLogs) {
                print("Game is over!");
            }
            return;
        }
        // Check whose turn it is and spawn their piece
        if (newCount % 2 === 0 && this.player === "X") {
            this.spawn(this.xPrefab);
        }
        else if (newCount % 2 === 1 && this.player === "O") {
            this.spawn(this.oPrefab);
        }
    }
    spawn(prefab) {
        if (this.showLogs) {
            print("Spawning " + prefab.name);
        }
        if (this.instantiator.isReady()) {
            // Spawn piece using the Sync Framework instantiator, set local start position
            const options = new Instantiator_1.InstantiationOptions();
            options.localPosition = new vec3(0, -25, 0);
            this.instantiator.instantiate(prefab, options);
        }
    }
    start() {
        if (this.showLogs) {
            print("Start");
        }
        // Player X spawns first piece to start the game
        if (this.player === "X") {
            this.spawn(this.xPrefab);
        }
    }
    onAwake() {
        // Create new sync entity for this script
        this.syncEntity = new SyncEntity_1.SyncEntity(this);
        // Add networked event to start the game
        this.syncEntity.onEventReceived.add("start", () => this.start());
        // Use storage property to keep track of turns, used to figure out whose turn it is
        this.syncEntity.addStorageProperty(this.turnsProp);
        this.turnsProp.onAnyChange.add((newVal, oldVal) => this.setTurn(newVal, oldVal));
        // Set up the sync entity notify on ready callback
        // Note: Only update the sync entity once it is ready
        this.syncEntity.notifyOnReady(() => this.onReady());
    }
    __initialize() {
        super.__initialize();
        this.MAX_TURNS = 9;
        this.isGameOver = false;
        this.player = "";
        this.turnsProp = StorageProperty_1.StorageProperty.manualInt("turnsCount", 0);
    }
};
exports.ControllerTS = ControllerTS;
exports.ControllerTS = ControllerTS = __decorate([
    component
], ControllerTS);
//# sourceMappingURL=ControllerTS.js.map