"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialPersistence = exports.RetargetableLocationTrackingPromise = exports.AreaDeactivatedEvent = exports.AreaActivatedEvent = exports.AnchorMappingStatusEvent = exports.AnchorError = exports.AnchorEvent = exports.InitializeErrorEvent = exports.InitializedLensCloudEvent = exports.InitializedEvent = void 0;
const Event_1 = require("../Util/Event");
const debounce_1 = require("../Util/debounce");
const Tracking_1 = require("./Tracking");
const Logging_1 = require("./Logging");
const MapScanning_1 = require("./MapScanning");
const MappingTrackingSession_1 = require("./MappingTrackingSession");
const Model_1 = require("./Model");
const PersistentStorage_1 = require("./PersistentStorage");
// flow
// initialize multiplayer session (hack)
// start loading previous location + anchors
// start mapping
// wait for previous location + anchors loading to complete -> either have a previous location or don't
// if have previous location, start tracking
//   -> wait for tracking to complete
//   -> wait for mapping to complete
// else
//   -> wait for mapping to complete
//
// whenever mapping completes
//   -> don't switch tracking
//   -> instead, only update the model with the new location
//
// if have placed a new anchor
//  -> if we are waiting for an existing map to track
//    -> once tracking completes, update the model
//  -> if we have completed a new map
//    -> update the model
//  -> if we have completed a new map with no previous map
//    -> once tracking starts, update the model
//
// initialization events
class InitializedEvent {
}
exports.InitializedEvent = InitializedEvent;
class InitializedLensCloudEvent {
}
exports.InitializedLensCloudEvent = InitializedLensCloudEvent;
class InitializeErrorEvent {
}
exports.InitializeErrorEvent = InitializeErrorEvent;
class AnchorEvent {
}
exports.AnchorEvent = AnchorEvent;
class AnchorError {
}
exports.AnchorError = AnchorError;
class AnchorMappingStatusEvent {
}
exports.AnchorMappingStatusEvent = AnchorMappingStatusEvent;
class AreaActivatedEvent {
}
exports.AreaActivatedEvent = AreaActivatedEvent;
class AreaDeactivatedEvent {
}
exports.AreaDeactivatedEvent = AreaDeactivatedEvent;
class RetargetableLocationTrackingPromise {
    constructor() {
        this.waitingToTrack = [];
        this.onceLocationFound = new Promise((resolve, reject) => {
            this.waitingToTrack.push(resolve);
            if (this.trackingLocation) {
                this.flush();
            }
        });
    }
    // !!! assume 'cancelled' operations won't call this;
    // !!! should make sure this is impossible
    resolve([tracking, toLensWorldFromTrackedLocation]) {
        this.trackingLocation = [tracking, toLensWorldFromTrackedLocation];
        this.flush();
    }
    flush() {
        if (this.trackingLocation) {
            while (this.waitingToTrack.length) {
                let next = this.waitingToTrack.shift();
                next(this.trackingLocation);
            }
        }
    }
}
exports.RetargetableLocationTrackingPromise = RetargetableLocationTrackingPromise;
class SpatialPersistence {
    constructor(locationCloudStorageModule, connectedLensModule, useLocalStorage, mappingInterval, resetDelayInS, debug, incrementalMapping, enableLoggingPoseSettling) {
        this._useLocalStorage = false;
        this._mappingInterval = 20;
        this._resetDelayInS = 0.5;
        this._debug = true;
        this._incrementalMapping = false;
        this._enableLoggingPoseSettling = false;
        this.sceneObjects = {};
        this.locations = {};
        this.alreadyInitialized = false;
        this.initializingDelayInSec = 1.0;
        // sequences
        //
        //    initialize()
        //      (loading)
        //        => onLoaded
        //        => onLoaded
        //        => onLoaded
        //      (in parallel with)
        //        => initialize lens cloud
        //    => onInitialized
        //    ...
        //    => onFound
        //
        //
        //    saveAnchor()
        //    => onSaved
        //
        //
        //    deleteAnchor()
        //    => onDeleted
        //
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
        // debugging / ui
        this.onAnchorMappingStatusEvent = new Event_1.default();
        this.onAnchorMappingStatus = this.onAnchorMappingStatusEvent.publicApi();
        // Outgoing area selection events
        this.onAreaActivatedEvent = new Event_1.default();
        this.onAreaActivated = this.onAreaActivatedEvent.publicApi();
        this.onAreaDeactivatedEvent = new Event_1.default();
        this.onAreaDeactivated = this.onAreaDeactivatedEvent.publicApi();
        // wait for any location to be tracked, then we resolve
        this.locationPromiseGatherer = new RetargetableLocationTrackingPromise();
        this.onceAnyLocationFound = this.locationPromiseGatherer.onceLocationFound;
        this.logger = Logging_1.LoggerVisualization.createLogger("component");
        this.log = this.logger.log.bind(this.logger);
        this._locationCloudStorageModule = locationCloudStorageModule;
        this._connectedLensModule = connectedLensModule;
        this._useLocalStorage = useLocalStorage;
        this._mappingInterval = mappingInterval;
        this._resetDelayInS = resetDelayInS;
        this._debug = debug;
        this._incrementalMapping = incrementalMapping;
        this._enableLoggingPoseSettling = enableLoggingPoseSettling;
    }
    async createAnchor(sceneObject) {
        let persistedLocationId = getGuid();
        let anchor = LocationAsset.getProxy(persistedLocationId);
        this.sceneObjects[persistedLocationId] = sceneObject;
        this.locations[persistedLocationId] = anchor;
        sceneObject[SpatialPersistence.anchorIdStash] =
            persistedLocationId;
        let anchorEvent = new AnchorEvent();
        anchorEvent.location = anchor;
        anchorEvent.sceneObject = sceneObject;
        return anchorEvent;
    }
    async saveAnchor(sceneObject) {
        let anchorId = sceneObject[SpatialPersistence.anchorIdStash];
        this.log("Saving " + anchorId);
        let [trackedLocation, toLensWorldFromTrackedLocation] = await this
            .onceAnyLocationFound;
        let toLensWorldFromSceneObject = sceneObject
            .getTransform()
            .getWorldTransform();
        let toTrackedLocationFromLensWorld = toLensWorldFromTrackedLocation.inverse();
        let toTrackedLocationFromAnchor = toTrackedLocationFromLensWorld.mult(toLensWorldFromSceneObject);
        let serializedLocationId = await this.persistentStorage.storeLocation(trackedLocation);
        let modelEvent = await this.model.saveAnchor(anchorId, serializedLocationId, toTrackedLocationFromAnchor);
        // model was updated, now we need to save
        this.triggerSceneSave();
        // forward the event
        let location = this.locations[modelEvent.anchor];
        let savedSceneObject = this.sceneObjects[modelEvent.anchor];
        let anchorEvent = new AnchorEvent();
        anchorEvent.location = location;
        anchorEvent.sceneObject = savedSceneObject;
        return anchorEvent;
    }
    async deleteAnchor(sceneObject) {
        let anchorId = sceneObject[SpatialPersistence.anchorIdStash];
        this.log("Deleting " + anchorId);
        let modelEvent = await this.model.deleteAnchor(anchorId);
        let anchorEvent = this.createAnchorEvent(modelEvent);
        return anchorEvent;
    }
    async resetArea() {
        // can't reset if load hasn't completed
        await this.previousState.finally(async () => {
            this.log("resetting area " + this.model.currentAreaId);
            this.model.reset().then(() => {
                // !!! should be triggered by model
                // !!! missing is model notifying subscribers that state has changed due to lastTrackedLocation being cleared
                this.triggerSceneSave();
            });
        });
    }
    selectArea(areaID) {
        this.model.selectArea(areaID);
    }
    awake(sceneObject, scriptComponent) {
        this.sceneObject = sceneObject;
        this.scriptComponent = scriptComponent;
        this.trackingSceneObject = global.scene.createSceneObject("tracking");
        this.trackingSceneObject.setParent(sceneObject);
        this.mappingSceneObject = global.scene.createSceneObject("mapping");
        this.mappingSceneObject.setParent(sceneObject);
        let mappingLocatedAt = this.mappingSceneObject.createComponent("LocatedAtComponent");
        mappingLocatedAt.location = LocationAsset.getAROrigin();
        this.model = new Model_1.Model();
        // !!! persistent storage needs to be per area, not per tracked location
        // Makes sure local storage is used in LS preview
        if (global.deviceInfoSystem.isEditor()) {
            this._useLocalStorage = true;
        }
        this.persistentStorage = new PersistentStorage_1.PersistentStorage(this._useLocalStorage, this._locationCloudStorageModule);
        this.model.onAnchorLoaded.add(this.notifyAnchorLoaded.bind(this));
        this.model.onAnchorUnloaded.add(this.notifyAnchorUnloaded.bind(this));
        this.model.onAnchorDeleted.add(this.notifyAnchorDeleted.bind(this));
        this.model.onAreaActivated.add(this.notifyAreaActivated.bind(this));
        this.model.onAreaDeactivated.add(this.notifyAreaDeactivated.bind(this));
    }
    async initializeMappingAndTracking() {
        if (this.alreadyInitialized) {
            await delay(this.initializingDelayInSec);
        }
        this.alreadyInitialized = true;
        this.log("initializing mapping and tracking");
        let mapScanning = this.createMapScanning();
        // mapping control
        let trigger = new MapScanning_1.RequiredQualityOrTrackingAlready();
        trigger.quality = 1.0;
        trigger.allowCheckpoint = false;
        trigger.trackingAlready = false;
        this.requiredQualityOrTrackingAlreadyTrigger = trigger;
        mapScanning
            .checkpoint(trigger)
            .then(async (newlyMappedLocation) => {
            await this.updateModelAgainstScan(newlyMappedLocation);
            let toLensWorldFromMapping = this.mappingSceneObject
                .getTransform()
                .getWorldTransform();
            this.locationPromiseGatherer.resolve([
                newlyMappedLocation,
                toLensWorldFromMapping,
            ]);
            this.firstMapCompleted(newlyMappedLocation);
        })
            .catch((error) => {
            this.log("error during initial checkpointing: " + error);
        });
        return new MappingTrackingSession_1.MappingTrackingSession(mapScanning, this._resetDelayInS);
    }
    createMapScanning() {
        let mapScanning = new MapScanning_1.MapScanning(this._locationCloudStorageModule, this.scriptComponent);
        mapScanning.onMappingStatus.add((status) => {
            this.onAnchorMappingStatusEvent.invoke(status);
        });
        return mapScanning;
    }
    async firstMapCompleted(newlyMappedLocation) {
        // we need to wait for previous state to load or fail to load - otherwise we don't
        // know if we should wait for it to track
        this.log("startup mapping completed");
        try {
            let previousLocation = await this.previousState;
        }
        catch {
            this.track(newlyMappedLocation);
        }
        finally {
            if (this._incrementalMapping) {
                this.scheduleSubsequentMap();
            }
        }
    }
    async scheduleSubsequentMap() {
        if (this._mappingInterval > 0.0) {
            this.log("scheduling subsequent map");
            let mapScanning = await this.mappingAndTracking.withMapScanning();
            this.log("mapping session capacity used: " +
                mapScanning.mappingSession.capacityUsed);
            // "capacityUsed" is scaled relative to the "wearableMaximumSize_" parameter
            // defined in LensCore:
            // capacityUsed = std::min(rawCapacity / wearableMaximumSize_, 1.0)
            if (mapScanning.mappingSession.capacityUsed >
                mapScanning.maxAllowedCapacityUsed) {
                this.log("capacity used above threshold - stopping map saves");
                return;
            }
            let trigger = new MapScanning_1.Timeout();
            trigger.timeoutInS = this._mappingInterval;
            let newlyMappedLocation = await mapScanning.checkpoint(trigger);
            await this.updateModelAgainstScan(newlyMappedLocation);
            let toLensWorldFromMapping = this.mappingSceneObject
                .getTransform()
                .getWorldTransform();
            this.locationPromiseGatherer.resolve([
                newlyMappedLocation,
                toLensWorldFromMapping,
            ]);
            this.scheduleSubsequentMap();
        }
    }
    async updateModelAgainstScan(newlyMappedLocation) {
        this.log("updating model against scan");
        this.model.area.lastTrackedLocation =
            await this.persistentStorage.storeLocation(newlyMappedLocation);
        this.triggerSceneSave();
        // we have mapped in the the new location but will not be tracking it.
        // All anchors already in the model will need to be updated
        // this must be done via the model, not the local list of scene objects / locations
        // as they may not be in the model yet
        for (let anchorId in this.model.area.anchors) {
            // !!! area cannot be null, no checkpoint can be asked for without an activate
            // !!! ie we are safe using this.model.area - how can we make this obvious?
            let toLensWorldFromAnchor = this.sceneObjects[anchorId]
                .getTransform()
                .getWorldTransform();
            let toLensWorldFromAROrigin = this.mappingSceneObject
                .getTransform()
                .getWorldTransform();
            let toNewlyMappedLocationFromAnchor = toLensWorldFromAROrigin
                .inverse()
                .mult(toLensWorldFromAnchor);
            this.model.saveAnchor(anchorId, this.model.area.lastTrackedLocation, // !!! area cannot be null, no checkpoint can be asked for without an activate
            // !!! ie we are safe using this.model.area - how can we make this obvious?
            toNewlyMappedLocationFromAnchor);
        }
    }
    async initialize() {
        this.log("initializing");
        this.previousState = this.loadPrevious();
        try {
            await this.previousState;
        }
        catch (noPreviousStateError) {
            this.log("no previous location state - using default state" +
                noPreviousStateError);
            this.model.load(SpatialPersistence.DefaultStateAsString);
            this.model.selectArea(SpatialPersistence.DefaultAreaId);
        }
    }
    async loadPrevious() {
        try {
            let stateAsString = await this.persistentStorage.loadFromStore();
            this.model.load(stateAsString);
        }
        catch (error) {
            throw new Error("previous location failed to load");
        }
    }
    async track(location) {
        this.log("starting tracking for " +
            location.locationId +
            " " +
            location.locationType);
        return this.mappingAndTracking.replaceLocationTracking(() => {
            //// nuke the old tracking
            let locationTracking = new Tracking_1.LocationTracking(this.scriptComponent, this.trackingSceneObject, location, this._enableLoggingPoseSettling);
            return locationTracking;
        }).then((locationTracking) => {
            locationTracking.onceFound.then(async ([trackedLocation, toLensWorldFromTrackedLocation]) => {
                // early complete any quality-based scan in progress
                if (this.requiredQualityOrTrackingAlreadyTrigger) {
                    this.requiredQualityOrTrackingAlreadyTrigger.allowCheckpoint =
                        this._incrementalMapping; // only allow scan to complete if we are incrementally mapping
                    this.requiredQualityOrTrackingAlreadyTrigger.trackingAlready = true;
                }
                // we expect to track either an old location or a new location with no anchors.
                // So the only anchors that will need to be handled are new or updated anchors.
                this.locationPromiseGatherer.resolve([
                    trackedLocation,
                    toLensWorldFromTrackedLocation,
                ]);
                let newLocation = await this.persistentStorage.storeLocation(trackedLocation);
                if (this.model.area.lastTrackedLocation !== newLocation) {
                    this.model.area.lastTrackedLocation = newLocation;
                    this.triggerSceneSave();
                }
            });
        });
    }
    triggerSceneSave() {
        this.log("triggering save");
        let stateAsString = this.model.save();
        this.saveOperation = this.persistentStorage
            .saveToStore(stateAsString)
            .then(() => {
            this.log("save successful");
        })
            .catch((error) => {
            this.log("save failed: " + error);
        });
    }
    notifyAnchorLoaded(modelEvent) {
        let anchorLocation = LocationAsset.getProxy(modelEvent.anchor);
        let continueWithPersistedLocation = (persistedLocation) => {
            let sceneObject = global.scene.createSceneObject("anchor-" + anchorLocation.getProxyId());
            sceneObject.setParent(this.trackingSceneObject);
            sceneObject[SpatialPersistence.anchorIdStash] =
                anchorLocation.getProxyId();
            this.locations[modelEvent.anchor] = anchorLocation;
            this.sceneObjects[modelEvent.anchor] = sceneObject;
            let anchorEvent = new AnchorEvent();
            anchorEvent.location = anchorLocation;
            anchorEvent.sceneObject = this.sceneObjects[modelEvent.anchor];
            this.onLoadedEvent.invoke(anchorEvent);
            this.onceAnyLocationFound
                .then(([trackedLocation, toLensWorldFromTrackedLocation]) => {
                // deletion / unloading can happen
                if (!(modelEvent.anchor in this.locations)) {
                    return;
                }
                sceneObject
                    .getTransform()
                    .setLocalTransform(modelEvent.toTrackedLocationFromAnchor);
                // we are now tracking so have _found_ the anchor
                this.onFoundEvent.invoke({
                    location: this.locations[modelEvent.anchor],
                    sceneObject: sceneObject,
                });
            })
                .catch((error) => {
                this.onLoadErrorEvent.invoke({
                    message: error,
                    location: anchorLocation,
                });
            });
        };
        continueWithPersistedLocation(anchorLocation);
    }
    createAnchorEvent(modelEvent) {
        let location = this.locations[modelEvent.anchor];
        let sceneObject = this.sceneObjects[modelEvent.anchor];
        let anchorEvent = new AnchorEvent();
        anchorEvent.location = location;
        anchorEvent.sceneObject = sceneObject;
        return anchorEvent;
    }
    notifyAnchorUnloaded(modelEvent) {
        this.log("unloading anchor " + modelEvent.anchor);
        try {
            // model was not updated so no need to save
            // as far as the ui is concerned, the anchor is gone
            // forward the event
            let anchorEvent = this.createAnchorEvent(modelEvent);
            // anchor was unloaded, we no longer care about it
            this.locations[modelEvent.anchor] = undefined;
            this.sceneObjects[modelEvent.anchor] = undefined;
            this.log("invoking onUnloaded due to unloading anchor " + modelEvent.anchor);
            this.onUnloadedEvent.invoke(anchorEvent);
            this.onDeletedEvent.invoke(anchorEvent);
            return anchorEvent;
        }
        catch (error) {
            this.log("error unloading anchor: " + error + " " + error.stack);
        }
    }
    notifyAnchorDeleted(modelEvent) {
        // model was updated, now we need to save
        this.triggerSceneSave();
        // we don't notify UI at this point - anchor was unloaded, and that is forwarded as a delete
        // event to UI
    }
    notifyAreaActivated(areaEvent) {
        // At this point all prev anchors are unloaded if there was an area switch
        this.initializeMappingAndTracking()
            .then(async (mappingAndTracking) => {
            this.mappingAndTracking = mappingAndTracking;
            if (areaEvent.isNewArea) {
                this.requiredQualityOrTrackingAlreadyTrigger.allowCheckpoint = true;
            }
            else {
                let lastTrackedLocation = await this.persistentStorage.retrieveLocation(areaEvent.area.lastTrackedLocation);
                this.log("tracking area " +
                    areaEvent.areaId +
                    " with location ID: " +
                    lastTrackedLocation.locationId);
                this.track(lastTrackedLocation);
            }
            this.onceAnyLocationFound.then(() => {
                let areaActivatedEvent = {
                    areaId: areaEvent.areaId,
                };
                this.onAreaActivatedEvent.invoke(areaActivatedEvent);
            });
        })
            .finally(async () => {
            await this.onceAnyLocationFound;
            this.requiredQualityOrTrackingAlreadyTrigger.allowCheckpoint =
                this._incrementalMapping; // only allow first scan to complete if we are incrementally mapping
        });
    }
    notifyAreaDeactivated(deletedAreaEvent) {
        this.locationPromiseGatherer = new RetargetableLocationTrackingPromise();
        this.onceAnyLocationFound = this.locationPromiseGatherer.onceLocationFound;
        // Destroy current mapping-tracking session
        if (this.mappingAndTracking) {
            this.mappingAndTracking
                .destroy()
                .then(() => {
                this.mappingAndTracking = undefined;
                this.log(deletedAreaEvent.areaId +
                    " deactivated - destroyed mapping and tracking session");
            })
                .catch((error) => {
                this.log("error destroying mapping and tracking session: " + error);
                throw new Error("error destroying mapping and tracking session: " + error);
            });
        }
        let areaDeactivatedEvent = {
            areaId: deletedAreaEvent.areaId,
        };
        this.onAreaDeactivatedEvent.invoke(areaDeactivatedEvent);
    }
}
exports.SpatialPersistence = SpatialPersistence;
SpatialPersistence.anchorIdStash = "__anchorId";
SpatialPersistence.DefaultAreaId = "default";
SpatialPersistence.DefaultStateAsString = JSON.stringify({
    areas: { default: { name: "default" } },
});
async function delay(seconds) {
    return new Promise((resolve, reject) => {
        (0, debounce_1.setTimeout)(() => {
            resolve();
        }, seconds * 1000);
    });
}
const getGuid = () => {
    // return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    let uuid = "";
    let currentChar;
    for (currentChar = 0; currentChar < /* 36 minus four hyphens */ 32; currentChar += 1) {
        switch (currentChar) {
            case 8:
            case 20:
                uuid += "-";
                uuid += ((Math.random() * 16) | 0).toString(16);
                break;
            case 12:
                uuid += "-";
                uuid += "4";
                break;
            case 16:
                uuid += "-";
                uuid += ((Math.random() * 4) | 8).toString(16); // Not the difference for this position
                break;
            default:
                uuid += ((Math.random() * 16) | 0).toString(16);
        }
    }
    return uuid;
};
//# sourceMappingURL=SpatialPersistence.js.map