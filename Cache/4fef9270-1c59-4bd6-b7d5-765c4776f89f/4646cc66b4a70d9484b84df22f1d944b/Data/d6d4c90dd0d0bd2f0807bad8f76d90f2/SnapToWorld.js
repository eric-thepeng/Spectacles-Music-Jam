"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapToWorld = void 0;
const Singleton_1 = require("../../SpectaclesInteractionKit/Decorators/Singleton");
// A variable for 'up' (but not exactly up) We can't have it be exactly up because when
// we do a cross to get our angles and our raycast result points straiught up we cross two
// vectors that are the same and it won't give us a sane result
const NOT_QUITE_UP = new vec3(0.0000001, 0.9999999, 0.0000001).normalize();
const EPSILON = 0.01;
let SnapToWorld = class SnapToWorld {
    constructor() {
        this.didInitialise = false;
        this.hitTestSessionRunning = false;
        this.timeOfLastHit = -1000;
        this.lastHitResult = null;
        this.isManipulating = false;
        this._isOn = false;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    init(worldQueryModule, previewInWorld) {
        if (this.didInitialise) {
            print("SnapToWorld. Tried to initialize twice");
            return;
        }
        this.worldQueryModule = worldQueryModule;
        this.previewInWorld = previewInWorld;
        // Init WorldQuery
        const sessionOptions = HitTestSessionOptions.create();
        sessionOptions.filter = true;
        this.hitTestSession =
            this.worldQueryModule.createHitTestSessionWithOptions(sessionOptions);
        this.hitTestSession.stop();
        this.didInitialise = true;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    startManipulating(dragEventData) {
        this.isManipulating = true;
        this.cachedDragEventData = dragEventData;
        if (!this._isOn) {
            return;
        }
        this.startSnappingSession();
        this.updateWorldRaycast(dragEventData);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    updateManipulating(dragEventData) {
        this.cachedDragEventData = dragEventData;
        this.previewInWorld
            .getTransform()
            .setWorldScale(dragEventData.target.transform.getWorldScale()); // TEMP
        this.updateWorldRaycast(dragEventData);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    endManipulating(dragEventData) {
        this.isManipulating = false;
        if (!this._isOn) {
            return;
        }
        this.endSnappingSession();
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    tick() {
        if (this._isOn) {
            this.updateRaycastResultHandling();
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    updateRaycastResultHandling() {
        if (this.haveValidHitResult()) {
            const hitPosition = this.lastHitResult.position;
            const hitNormal = this.lastHitResult.normal;
            let previewTransform = this.previewInWorld.getTransform();
            let rot = quat.lookAt(hitNormal, NOT_QUITE_UP);
            previewTransform.setWorldPosition(hitPosition);
            previewTransform.setWorldRotation(rot);
            this.previewInWorld.enabled = true;
            // TEMP
            //global.debugRenderSystem.drawSolidSphere( hitPosition, 1, new vec4(0, 1, 0, 1) )
            //global.debugRenderSystem.drawLine( hitPosition, hitPosition.add(hitNormal.uniformScale(20)), new vec4(0, 1, 0, 1) )
        }
        else {
            this.previewInWorld.enabled = false;
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    haveValidHitResult() {
        const MAX_TIME = 4 / 60;
        var currTime = getTime();
        return (currTime - this.timeOfLastHit < MAX_TIME &&
            this.hitTestSessionRunning &&
            this.lastHitResult);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    updateWorldRaycast(dragEventData) {
        const DIST_IN_FRONT_OF_HAND = 20; // Move in front of the hand a bit as it sometimes results in a raycast hit
        const DIST_BEHIND_TO_CHECK = 30;
        let targetPos = dragEventData.target.transform.getWorldPosition();
        let rayToWorldStart = dragEventData.interactor.startPoint.add(dragEventData.interactor.direction.uniformScale(DIST_IN_FRONT_OF_HAND));
        const raycastDistance = rayToWorldStart.distance(targetPos) + DIST_BEHIND_TO_CHECK;
        let rayToWorldEnd = rayToWorldStart.add(dragEventData.interactor.direction.uniformScale(raycastDistance));
        if (this.hitTestSessionRunning) {
            const hitTest = this.hitTestSession.hitTest(rayToWorldStart, rayToWorldEnd, (hitResult) => {
                if (hitResult === null) {
                    //this.hitTestSession.reset() // TEST: reset the filter if we miss
                    return; // Bail!
                }
                else {
                    this.timeOfLastHit = getTime();
                    this.lastHitResult = hitResult;
                }
            });
        }
        // TEMP
        //global.debugRenderSystem.drawSphere( rayToWorldStart, 1, new vec4(0, 0, 1, 1) )
        //global.debugRenderSystem.drawSphere( rayToWorldEnd, 1, new vec4(0, 1, 0, 1) )
        //global.debugRenderSystem.drawLine( rayToWorldStart, rayToWorldEnd, new vec4(0, 1, 0, 1) )
        //global.debugRenderSystem.drawSphere( dragEventData.interactor.startPoint, 1, new vec4(1, 0, 0, 1) )
        //global.debugRenderSystem.drawSphere( dragEventData.interactor.endPoint, 15, new vec4(0, 1, 0, 1) )
        //global.debugRenderSystem.drawSphere( targetPos, 5, new vec4(1, 0, 1, 1) )
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    getCurrentTransform() {
        // TEMP
        if (this.haveValidHitResult()) {
            return this.previewInWorld.getTransform();
        }
        return null;
    }
    set isOn(onState) {
        if (this._isOn === onState) {
            return;
        }
        print("isOn " + onState);
        if (this.isManipulating) {
            if (onState === true) {
                this.startSnappingSession();
                this.updateWorldRaycast(this.cachedDragEventData);
            }
            else if (onState === false) {
                this.endSnappingSession();
            }
        }
        this._isOn = onState;
    }
    startSnappingSession() {
        print("startSnappingSession");
        this.hitTestSession.start();
        this.hitTestSessionRunning = true;
    }
    endSnappingSession() {
        print("endSnappingSession");
        this.hitTestSession.stop();
        this.hitTestSession.reset();
        this.hitTestSessionRunning = false;
        this.previewInWorld.enabled = false;
    }
};
exports.SnapToWorld = SnapToWorld;
exports.SnapToWorld = SnapToWorld = __decorate([
    Singleton_1.Singleton
], SnapToWorld);
//# sourceMappingURL=SnapToWorld.js.map