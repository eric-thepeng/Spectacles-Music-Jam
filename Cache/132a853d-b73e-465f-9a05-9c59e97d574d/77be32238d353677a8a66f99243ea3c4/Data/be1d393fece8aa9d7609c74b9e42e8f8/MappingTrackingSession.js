"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingTrackingSession = void 0;
const debounce_1 = require("../Util/debounce");
const Logging_1 = require("./Logging");
// a MappingTrackingSession is guaranteed to have at least one MapScanning or LocationTracking
// and never more than one of each
//
// This is needed to maintain the underlying VOS tracking session
class MappingTrackingSession {
    constructor(mapScanning, waitForReleaseInS) {
        this.waitingForMapScanning = [];
        this.waitingForLocationTracking = [];
        this.logger = Logging_1.LoggerVisualization.createLogger("mappingtracking");
        this.log = (message) => this.logger.log(message);
        this.mapScanning = mapScanning;
        this.waitForReleaseInS = waitForReleaseInS;
    }
    destroy() {
        return new Promise((resolve, reject) => {
            if (this.mapScanning) {
                this.mapScanning.destroy();
            }
            if (this.locationTracking) {
                this.locationTracking.destroy();
            }
            this.mapScanning = null;
            this.locationTracking = null;
            (0, debounce_1.setTimeout)(() => {
                resolve();
            }, this.waitForReleaseInS * 1000);
        });
    }
    flushMapScanningActions() {
        if (this.mapScanning) {
            while (this.waitingForMapScanning.length) {
                let next = this.waitingForMapScanning.shift();
                next(this.mapScanning);
            }
        }
    }
    flushLocationTrackingActions() {
        if (this.locationTracking) {
            while (this.waitingForLocationTracking.length) {
                let next = this.waitingForLocationTracking.shift();
                next(this.locationTracking);
            }
        }
    }
    withMapScanning() {
        return new Promise((resolve, reject) => {
            this.waitingForMapScanning.push(resolve);
            this.flushMapScanningActions();
        });
    }
    withLocationTracking() {
        return new Promise((resolve, reject) => {
            this.waitingForLocationTracking.push(resolve);
            this.flushLocationTrackingActions();
        });
    }
    replaceMapScanning(mapScanningReplacer) {
        // we can only replace the mapping session if we have a LocatedAtComponent
        return this.withLocationTracking().then((locationTracking) => {
            return new Promise((resolve, reject) => {
                if (this.mapScanning) {
                    this.log("replacing mapScanning");
                    this.mapScanning.destroy();
                    this.mapScanning = null;
                    (0, debounce_1.setTimeout)(() => {
                        this.mapScanning = mapScanningReplacer();
                        this.waitingForMapScanning.push(resolve);
                        this.flushMapScanningActions();
                    }, this.waitForReleaseInS * 1000);
                }
                else {
                    this.log("initializing mapScanning");
                    this.mapScanning = mapScanningReplacer();
                    this.waitingForMapScanning.push(resolve);
                    this.flushMapScanningActions();
                }
            });
        });
    }
    replaceLocationTracking(locationTrackingReplacer) {
        // we can only replace the LocationTracking if we have a MappingSession
        return this.withMapScanning().then((mapScanning) => {
            return new Promise((resolve, reject) => {
                if (this.locationTracking) {
                    this.log("replacing tracking");
                    this.locationTracking.destroy();
                    this.locationTracking = null;
                    (0, debounce_1.setTimeout)(() => {
                        this.locationTracking = locationTrackingReplacer();
                        this.waitingForLocationTracking.push(resolve);
                        this.flushLocationTrackingActions();
                    }, this.waitForReleaseInS * 1000);
                }
                else {
                    this.log("initializing tracking");
                    this.locationTracking = locationTrackingReplacer();
                    this.waitingForLocationTracking.push(resolve);
                    this.flushLocationTrackingActions();
                }
            });
        });
    }
}
exports.MappingTrackingSession = MappingTrackingSession;
//# sourceMappingURL=MappingTrackingSession.js.map