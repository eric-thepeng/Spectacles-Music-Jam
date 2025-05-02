"use strict";
/**
 * ## Anchors
 * Define and track poses in world space.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnchorSession = exports.AnchorSessionOptions = void 0;
const Event_1 = require("./Util/Event");
const Anchor_1 = require("./Anchor");
const WorldAnchor_1 = require("./WorldAnchor");
const debounce_1 = require("./Util/debounce");
/**
 * Options for locating and persisting nearby anchors, past and new.
 */
class AnchorSessionOptions {
    constructor() {
        /**
         * Named scope for storing and retrieving anchors.
         * A13 - only one may be active at a time.
         */
        this.area = "default";
        /**
         * Anchor types to look for.
         * Default to at least searching for WorldAnchors.
         */
        this.scanForWorldAnchors = false;
    }
}
exports.AnchorSessionOptions = AnchorSessionOptions;
/**
 * Storage context for anchors.
 */
class AnchorSession {
    constructor(options, spatialPersistence, onClose) {
        /**
         * Notifies of anchors becoming available within area scope.
         */
        this.onAnchorNearbyEvent = new Event_1.default();
        this.onAnchorNearby = this.onAnchorNearbyEvent.publicApi();
        this.onAnchorDeletedEvent = new Event_1.default();
        this.onAnchorDeleted = this.onAnchorDeletedEvent.publicApi();
        this._notifiesOnNearbyWorldAnchors = false;
        this._anchors = new Map();
        this._anchorCount = 0;
        this._registrationUnsubscribes = [];
        this._isClosing = false;
        this.area = options.area;
        this._isClosing = false;
        this._onClose = onClose;
        this._notifiesOnNearbyWorldAnchors = options.scanForWorldAnchors;
        this._spatialPersistence = spatialPersistence;
        this._registrationUnsubscribes.push(this._spatialPersistence.onLoaded.add(this._onLoaded.bind(this)));
        this._registrationUnsubscribes.push(this._spatialPersistence.onLoadError.add(this._onLoadError.bind(this)));
        this._registrationUnsubscribes.push(this._spatialPersistence.onFound.add(this._onFound.bind(this)));
        this._registrationUnsubscribes.push(this._spatialPersistence.onLost.add(this._onLost.bind(this)));
        this._registrationUnsubscribes.push(this._spatialPersistence.onUnloaded.add(this._onUnloaded.bind(this)));
        this._registrationUnsubscribes.push(this._spatialPersistence.onDeleted.add(this._onDeleted.bind(this)));
        // finish construction and give receivers a chance to subscribe to activation events before selecting area
        (0, debounce_1.setTimeout)(() => {
            this._spatialPersistence.selectArea(this.area);
        }, 0.0);
    }
    /**
     * Stop trying to find or track anchors in the area.
     */
    async close() {
        this._isClosing == true;
        await this._onClose(this);
        this._registrationUnsubscribes.forEach((unsubscribe) => {
            unsubscribe();
        });
        this._registrationUnsubscribes = [];
    }
    /**
     * Save an anchor in storage after user modifications.
     */
    async saveAnchor(anchor) {
        this._checkIsNotClosing();
        if (!(anchor instanceof WorldAnchor_1.WorldAnchor)) {
            throw new Error("Only WorldAnchors supported");
        }
        let anchorEvent = await this._spatialPersistence.saveAnchor(anchor._sceneObject);
        return anchor;
    }
    /**
     * Delete anchor from the storage context.
     */
    async deleteAnchor(anchor) {
        this._checkIsNotClosing();
        if (!(anchor instanceof WorldAnchor_1.WorldAnchor)) {
            throw new Error("Only WorldAnchors supported");
        }
        let anchorEvent = await this._spatialPersistence.deleteAnchor(anchor._sceneObject);
        return anchor;
    }
    /**
     * Delete all anchors and reset ability to track in current area.
     */
    async reset() {
        this._checkIsNotClosing();
        await this._spatialPersistence.resetArea();
        this._anchors = new Map();
    }
    /**
     * Create a world anchor.
     *
     * @param toWorldFromAnchor - World pose of anchor. 'World' is the coordinate system of scene graph root, compatible with a child rendering camera positioned by DeviceTracking set to world.
     */
    async createWorldAnchor(toWorldFromAnchor, alignment) {
        this._checkIsNotClosing();
        let anchorSceneObject = global.scene.createSceneObject("_anchor_" + this._anchorCount++);
        anchorSceneObject.getTransform().setWorldTransform(toWorldFromAnchor);
        try {
            let anchorEvent = await this._spatialPersistence.createAnchor(anchorSceneObject);
            let anchor = new WorldAnchor_1.WorldAnchor(anchorEvent.location, anchorSceneObject, alignment);
            // having waited on this._spatialPersistence.createAnchor
            // anchor on creation is found, with nothing watching on handlers yet
            // via anchor resolved from AnchorSession.createWorldAnchor
            anchor.state = Anchor_1.State.Found;
            this._anchors.set(anchor.id, anchor);
            return anchor;
        }
        catch (error) {
            throw new Error("Failed to create anchor: " + error);
        }
    }
    // implementation details
    _checkIsNotClosing() {
        if (this._isClosing === true) {
            throw new Error("Session is closing");
        }
    }
    _onLoaded(event) {
        let anchor = new WorldAnchor_1.WorldAnchor(event.location, event.sceneObject);
        this._anchors.set(event.location.getProxyId(), anchor);
        anchor.state = Anchor_1.State.Ready;
        if (this._notifiesOnNearbyWorldAnchors) {
            this.onAnchorNearbyEvent.invoke(anchor);
        }
    }
    _onLoadError(event) {
        let anchor = new WorldAnchor_1.WorldAnchor(event.location);
        this._anchors.set(event.location.getProxyId(), anchor);
        anchor.state = Anchor_1.State.Error;
        if (this._notifiesOnNearbyWorldAnchors) {
            this.onAnchorNearbyEvent.invoke(anchor);
        }
    }
    _onUnloaded(event) {
        this._anchors.get(event.location.getProxyId()).state = Anchor_1.State.CannotTrack;
    }
    _onFound(event) {
        this._anchors.get(event.location.getProxyId()).state = Anchor_1.State.Found;
    }
    _onLost(event) {
        this._anchors.get(event.location.getProxyId()).state = Anchor_1.State.Lost;
    }
    _onDeleted(event) {
        let anchor = this._anchors.get(event.location.getProxyId());
        this.onAnchorDeletedEvent.invoke(anchor);
    }
}
exports.AnchorSession = AnchorSession;
//# sourceMappingURL=AnchorSession.js.map