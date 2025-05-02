"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentStorage = void 0;
const Logging_1 = require("./Logging");
class IStorage {
    constructor() {
        this.logger = Logging_1.LoggerVisualization.createLogger("persistence");
        this.log = this.logger.log.bind(this.logger);
    }
}
IStorage.LocationModelStateKeyName = "locationModelState";
class RemoteStorage extends IStorage {
    constructor(locationCloudStorageModule) {
        super();
        this.waitingForLocationStore = [];
        this.writeOptions = RemoteStorage.makeCloudStorageWriteOptions();
        this.readOptions = RemoteStorage.makeCloudStorageReadOptions();
        this.locationCloudStorageModule = locationCloudStorageModule;
        this.connectToLocationCloudStore();
    }
    connectToLocationCloudStore() {
        let location = LocationAsset.getProxy("global");
        let options = LocationCloudStorageOptions.create();
        options.location = location;
        options.onDiscoveredNearby.add((_, cloudStore) => {
            this.locationCloudStore = cloudStore;
            this.flushLocationStorageActions();
        });
        options.onError.add((err, message) => {
            let errorMessage = "CloudStorageModule: failed to get location store: " + err + message;
            this.errorInCloudStore = errorMessage;
            this.flushLocationStorageActions();
            this.log(errorMessage);
        });
        this.locationCloudStorageModule.getNearbyLocationStores(options);
    }
    static makeCloudStorageWriteOptions() {
        let options = CloudStorageWriteOptions.create();
        options.scope = StorageScope.User;
        return options;
    }
    flushLocationStorageActions() {
        if (this.locationCloudStore) {
            while (this.waitingForLocationStore.length) {
                let next = this.waitingForLocationStore.shift();
                next.resolve(this.locationCloudStore);
            }
        }
        else if (this.errorInCloudStore) {
            while (this.waitingForLocationStore.length) {
                let next = this.waitingForLocationStore.shift();
                next.reject(this.errorInCloudStore);
            }
        }
    }
    withLocationCloudStore() {
        return new Promise((resolve, reject) => {
            let storeState = { resolve: resolve, reject: reject };
            this.waitingForLocationStore.push(storeState);
            this.flushLocationStorageActions();
        });
    }
    saveToCloudStore(stateAsString) {
        return new Promise((resolve, reject) => {
            this.withLocationCloudStore().then((locationCloudStore) => {
                locationCloudStore.setValue(RemoteStorage.LocationModelStateKeyName, stateAsString, this.writeOptions, () => {
                    resolve();
                }, (code, description) => {
                    reject(new Error(description));
                });
            });
        });
    }
    save(stateAsString) {
        return new Promise((resolve, reject) => {
            this.saveToCloudStore(stateAsString)
                .then(() => {
                resolve();
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    static makeCloudStorageReadOptions() {
        let options = CloudStorageReadOptions.create();
        options.scope = StorageScope.User;
        return options;
    }
    loadFromCloudStore() {
        return new Promise((resolve, reject) => {
            this.withLocationCloudStore()
                .then((locationCloudStore) => {
                locationCloudStore.getValue(RemoteStorage.LocationModelStateKeyName, this.readOptions, (key, value) => {
                    let stateAsString = value;
                    if (!stateAsString) {
                        let error = "[loadFromCloudStore]: no state in cloud storage";
                        this.log(error);
                        reject(new Error(error));
                    }
                    else {
                        this.log("[loadFromCloudStore]: load successful");
                        resolve(stateAsString);
                    }
                }, (code, description) => {
                    let error = "load fail: " + code + " " + description;
                    this.log("[loadFromCloudStore] Error:" + error);
                    reject(new Error(error));
                });
            })
                .catch((error) => {
                this.log("[loadFromCloudStore] Error:" + error);
                reject(error);
            });
        });
    }
    load() {
        return new Promise((resolve, reject) => {
            this.loadFromCloudStore()
                .then((stateAsString) => {
                resolve(stateAsString);
            })
                .catch((error) => {
                this.log("[loadFromCloud] Error: " + error);
                reject(error);
            });
        });
    }
}
class LocalStorage extends IStorage {
    constructor() {
        super();
    }
    save(stateAsString) {
        return new Promise(() => {
            global.persistentStorageSystem.store.putString(LocalStorage.LocationModelStateKeyName, stateAsString);
            Promise.resolve();
        });
    }
    load() {
        this.log("[local] loading");
        return new Promise((resolve, reject) => {
            let stateAsString = global.persistentStorageSystem.store.getString(LocalStorage.LocationModelStateKeyName);
            if (stateAsString == "") {
                let errorMsg = "no local state found";
                this.log(errorMsg);
                reject(new Error(errorMsg));
            }
            else {
                this.log("local load successful");
                resolve(stateAsString);
            }
        });
    }
}
class PersistentStorage {
    constructor(useLocalStorage, locationCloudStorageModule) {
        this.logger = Logging_1.LoggerVisualization.createLogger("persistence");
        this.log = this.logger.log.bind(this.logger);
        this.useLocalStorage = useLocalStorage;
        this.locationCloudStorageModule = locationCloudStorageModule;
        if (this.useLocalStorage) {
            this.storage = new LocalStorage();
        }
        else {
            this.storage = new RemoteStorage(locationCloudStorageModule);
        }
    }
    retrieveLocation(serializedLocationId) {
        if (global.deviceInfoSystem.isEditor()) {
            return Promise.resolve(LocationAsset.getAROrigin());
        }
        return new Promise((resolve, reject) => {
            this.locationCloudStorageModule.retrieveLocation(serializedLocationId, (location) => {
                resolve(location);
            }, (error) => {
                reject(new Error("[LocationCloudStorageModule] failed to get location - " +
                    serializedLocationId +
                    " " +
                    error));
            });
        });
    }
    storeLocation(location) {
        if (global.deviceInfoSystem.isEditor()) {
            return Promise.resolve("ls-preview-location-id");
        }
        return new Promise((resolve, reject) => {
            this.locationCloudStorageModule.storeLocation(location, (serializedLocationId) => {
                resolve(serializedLocationId);
            }, (err) => {
                reject(new Error("[LocationCloudStorageModule] failed to store location - " + err));
            });
        });
    }
    // Model storage
    async saveToStore(stateAsString) {
        return new Promise((resolve, reject) => {
            this.storage
                .save(stateAsString)
                .then(() => {
                this.log("save successful");
                resolve();
            })
                .catch((error) => {
                this.log("save failed: " + error);
                reject(error);
            });
        });
    }
    async loadFromStore() {
        return new Promise((resolve, reject) => {
            this.storage
                .load()
                .then((stateAsString) => {
                this.log("load successful");
                resolve(stateAsString);
            })
                .catch((error) => {
                this.log("load failed: " + error);
                reject(error);
            });
        });
    }
}
exports.PersistentStorage = PersistentStorage;
//# sourceMappingURL=PersistentStorage.js.map