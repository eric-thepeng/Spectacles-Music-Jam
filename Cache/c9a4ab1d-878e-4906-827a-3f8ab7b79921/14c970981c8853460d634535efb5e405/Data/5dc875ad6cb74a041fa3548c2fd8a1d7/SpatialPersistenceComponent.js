"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialPersistenceComponent = exports.AreaDeactivatedEvent = exports.AreaActivatedEvent = exports.AnchorMappingStatusEvent = exports.AnchorError = exports.AnchorEvent = exports.InitializeErrorEvent = exports.InitializedEvent = void 0;
var __selfType = requireType("./SpatialPersistenceComponent");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Event_1 = require("../Util/Event");
var SpatialPersistence_1 = require("./SpatialPersistence");
Object.defineProperty(exports, "InitializedEvent", { enumerable: true, get: function () { return SpatialPersistence_1.InitializedEvent; } });
Object.defineProperty(exports, "InitializeErrorEvent", { enumerable: true, get: function () { return SpatialPersistence_1.InitializeErrorEvent; } });
Object.defineProperty(exports, "AnchorEvent", { enumerable: true, get: function () { return SpatialPersistence_1.AnchorEvent; } });
Object.defineProperty(exports, "AnchorError", { enumerable: true, get: function () { return SpatialPersistence_1.AnchorError; } });
Object.defineProperty(exports, "AnchorMappingStatusEvent", { enumerable: true, get: function () { return SpatialPersistence_1.AnchorMappingStatusEvent; } });
Object.defineProperty(exports, "AreaActivatedEvent", { enumerable: true, get: function () { return SpatialPersistence_1.AreaActivatedEvent; } });
Object.defineProperty(exports, "AreaDeactivatedEvent", { enumerable: true, get: function () { return SpatialPersistence_1.AreaDeactivatedEvent; } });
const SpatialPersistence_2 = require("./SpatialPersistence");
let SpatialPersistenceComponent = class SpatialPersistenceComponent extends BaseScriptComponent {
    onAwake() {
        this.spatialPersistence = new SpatialPersistence_2.SpatialPersistence(this.locationCloudStorageModule, this.connectedLensModule, this.useLocalStorage, this.mappingInterval, this.resetDelayInS, this.debug, this.incrementalMapping, this.enableLoggingPoseSettling);
        // forward events from implementation
        this.spatialPersistence.onLoaded.add((event) => {
            this.onLoadedEvent.invoke(event);
        });
        this.spatialPersistence.onLoadError.add((event) => {
            this.onLoadErrorEvent.invoke(event);
        });
        this.spatialPersistence.onUnloaded.add((event) => {
            this.onUnloadedEvent.invoke(event);
        });
        this.spatialPersistence.onFound.add((event) => {
            this.onFoundEvent.invoke(event);
        });
        this.spatialPersistence.onLost.add((event) => {
            this.onLostEvent.invoke(event);
        });
        this.spatialPersistence.onDeleted.add((event) => {
            this.onDeletedEvent.invoke(event);
        });
        this.spatialPersistence.onDeleteError.add((event) => {
            this.onDeleteErrorEvent.invoke(event);
        });
        this.spatialPersistence.onAnchorMappingStatus.add((event) => {
            this.onAnchorMappingStatusEvent.invoke(event);
        });
        this.spatialPersistence.onAreaActivated.add((event) => {
            this.onAreaActivatedEvent.invoke(event);
        });
        this.spatialPersistence.onAreaDeactivated.add((event) => {
            this.onAreaDeactivatedEvent.invoke(event);
        });
        this.spatialPersistence.awake(this.sceneObject, this);
    }
    createAnchor(sceneObject) {
        return this.spatialPersistence.createAnchor(sceneObject);
    }
    saveAnchor(sceneObject) {
        return this.spatialPersistence.saveAnchor(sceneObject);
    }
    deleteAnchor(sceneObject) {
        return this.spatialPersistence.deleteAnchor(sceneObject);
    }
    resetArea() {
        return this.spatialPersistence.resetArea();
    }
    selectArea(areaID) {
        this.spatialPersistence.selectArea(areaID);
    }
    initialize() {
        this.spatialPersistence.initialize().then(() => {
            this.onInitializedEvent.invoke(new SpatialPersistence_2.InitializedEvent());
        });
    }
    __initialize() {
        super.__initialize();
        this.onInitializedEvent = new Event_1.default();
        this.onInitialized = this.onInitializedEvent.publicApi();
        this.onInitializeErrorEvent = new Event_1.default();
        this.onInitializeError = this.onInitializeErrorEvent.publicApi();
        this.onLoadedEvent = new Event_1.default();
        this.onLoaded = this.onLoadedEvent.publicApi();
        this.onLoadErrorEvent = new Event_1.default();
        this.onLoadError = this.onLoadErrorEvent.publicApi();
        this.onUnloadedEvent = new Event_1.default();
        this.onUnloaded = this.onUnloadedEvent.publicApi();
        this.onFoundEvent = new Event_1.default();
        this.onFound = this.onFoundEvent.publicApi();
        this.onLostEvent = new Event_1.default();
        this.onLost = this.onLostEvent.publicApi();
        this.onDeletedEvent = new Event_1.default();
        this.onDeleted = this.onDeletedEvent.publicApi();
        this.onDeleteErrorEvent = new Event_1.default();
        this.onDeleteError = this.onDeleteErrorEvent.publicApi();
        this.onAnchorMappingStatusEvent = new Event_1.default();
        this.onAnchorMappingStatus = this.onAnchorMappingStatusEvent.publicApi();
        this.onAreaActivatedEvent = new Event_1.default();
        this.onAreaActivated = this.onAreaActivatedEvent.publicApi();
        this.onAreaDeactivatedEvent = new Event_1.default();
        this.onAreaDeactivated = this.onAreaDeactivatedEvent.publicApi();
    }
};
exports.SpatialPersistenceComponent = SpatialPersistenceComponent;
exports.SpatialPersistenceComponent = SpatialPersistenceComponent = __decorate([
    component
], SpatialPersistenceComponent);
//# sourceMappingURL=SpatialPersistenceComponent.js.map