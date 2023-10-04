"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEmulator = exports.emulatorHost = exports.CLIENT_CERT_URL = exports.FIREBASE_AUDIENCE = void 0;
exports.FIREBASE_AUDIENCE = "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";
exports.CLIENT_CERT_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
function emulatorHost() {
    return process.env.FIREBASE_AUTH_EMULATOR_HOST;
}
exports.emulatorHost = emulatorHost;
function useEmulator() {
    return !!emulatorHost();
}
exports.useEmulator = useEmulator;
//# sourceMappingURL=firebase.js.map