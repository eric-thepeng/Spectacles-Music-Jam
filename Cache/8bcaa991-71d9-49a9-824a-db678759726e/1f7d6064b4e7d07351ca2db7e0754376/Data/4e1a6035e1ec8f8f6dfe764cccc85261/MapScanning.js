"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapScanning = exports.RequiredQualityOrTrackingAlready = exports.Timeout = void 0;
const debounce_1 = require("../Util/debounce");
const Event_1 = require("../Util/Event");
const Logging_1 = require("./Logging");
// LensStudio Mock for MappingSession
class MockMappingSession {
    constructor() {
        this.canCheckpoint = true;
        this.quality = 1.0;
        this.capacityUsed = 0.07; // a value lower than 'maxAllowedCapacityUsed'
    }
    checkpoint() { }
    cancel() { }
    isOfType() { }
    isSame() { }
    getTypeName() { }
}
class Timeout {
}
exports.Timeout = Timeout;
class RequiredQualityOrTrackingAlready {
}
exports.RequiredQualityOrTrackingAlready = RequiredQualityOrTrackingAlready;
// -- MAPPING SESSION
class MapScanning {
    constructor(locationCloudStorageModule, script) {
        this.onMappingStatusEvent = new Event_1.default();
        this.onMappingStatus = this.onMappingStatusEvent.publicApi();
        this.maxAllowedCapacityUsed = 0.1; // finetuned to reduce the map download lag to <1s
        this.capacityHysteresisFactor = 1.3;
        this.activelyMapping = false;
        this.logger = Logging_1.LoggerVisualization.createLogger("mapper");
        this.log = (message) => this.logger.log(message);
        this.locationCloudStorageModule = locationCloudStorageModule;
        this.updateEvent = script.createEvent("UpdateEvent");
        this.updateEvent.bind(this.notifyUpdate.bind(this));
        var mappingOptions = LocatedAtComponent.createMappingOptions();
        mappingOptions.locationCloudStorageModule = this.locationCloudStorageModule;
        mappingOptions.location = LocationAsset.getAROrigin();
        if (global.deviceInfoSystem.isEditor()) {
            this.mappingSession = new MockMappingSession();
        }
        else {
            this.mappingSession = LocatedAtComponent.createMappingSession(mappingOptions);
        }
        this.log("Scanning start");
        this.activelyMapping = true;
    }
    async checkpoint(completionCriterion) {
        this.log("checkpoint trigger requested");
        let checkpointed = new Promise((resolve, reject) => {
            if (global.deviceInfoSystem.isEditor()) {
                resolve(LocationAsset.getAROrigin());
            }
            else {
                let onCheckpointedRegistration = this.mappingSession.onMapped.add((location) => {
                    this.log("checkpoint completed");
                    this.mappingSession.onMapped.remove(onCheckpointedRegistration);
                    resolve(location);
                });
            }
        });
        if (completionCriterion instanceof Timeout) {
            await this.triggerCheckpointWithTimeout(completionCriterion);
        }
        else {
            await this.triggerCheckpointWithRequiredQuality(completionCriterion);
        }
        return checkpointed;
    }
    destroy() {
        this.log("destroying");
        this.activelyMapping = false;
        this.mappingSession = null;
        (0, debounce_1.clearTimeout)(this.cancelCheckpoint);
    }
    notifyUpdate() {
        if (this.activelyMapping) {
            let capacityUsed = this.mappingSession.capacityUsed;
            let quality = this.mappingSession.quality;
            this.onMappingStatusEvent.invoke({
                capacityUsed: capacityUsed,
                quality: quality,
            });
        }
    }
    async triggerCheckpointWithTimeout(timeout) {
        return new Promise((resolve, reject) => {
            var canCheckpoint = this.mappingSession.canCheckpoint;
            this.log("timeout - canCheckpoint:" + canCheckpoint.toString());
            this.cancelCheckpoint = (0, debounce_1.setTimeout)(() => {
                this.log("timeout - triggering checkpoint");
                this.activelyMapping = false;
                this.mappingSession.checkpoint();
                resolve();
            }, timeout.timeoutInS * 1000);
        });
    }
    async triggerCheckpointWithRequiredQuality(requiredQuality) {
        return new Promise((resolve, reject) => {
            var canCheckpoint = this.mappingSession.canCheckpoint;
            this.log("quality - canCheckpoint:" + canCheckpoint.toString());
            let subscription = this.onMappingStatus.add((status) => {
                // NOTE: Map sizes tend to slightly go down when saved which makes
                // this check sensitive to the map size threshold. To prevent
                // additional lag when saving maps that are almost at the size
                // threshold, we add a hysteresis factor.
                if (((status.quality >= requiredQuality.quality &&
                    this.activelyMapping) ||
                    requiredQuality.trackingAlready) &&
                    requiredQuality.allowCheckpoint &&
                    status.capacityUsed * this.capacityHysteresisFactor <
                        this.maxAllowedCapacityUsed) {
                    this.log("quality - triggering checkpoint - trackingAlready: " +
                        requiredQuality.trackingAlready.toString());
                    this.onMappingStatusEvent.remove(subscription);
                    this.activelyMapping = false;
                    this.mappingSession.checkpoint();
                    resolve();
                }
            });
        });
    }
}
exports.MapScanning = MapScanning;
//# sourceMappingURL=MapScanning.js.map