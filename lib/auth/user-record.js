"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRecord = exports.UserInfo = exports.UserMetadata = exports.MultiFactorSettings = exports.PhoneMultiFactorInfo = exports.MultiFactorInfo = void 0;
const utils_1 = require("./utils");
const validator_1 = require("./validator");
const jose_1 = require("jose");
const error_1 = require("./error");
const B64_REDACTED = jose_1.base64url.encode("REDACTED");
function parseDate(time) {
    try {
        const date = new Date(parseInt(time, 10));
        if (!isNaN(date.getTime())) {
            return date.toUTCString();
        }
    }
    catch (e) { }
    return null;
}
var MultiFactorId;
(function (MultiFactorId) {
    MultiFactorId["Phone"] = "phone";
})(MultiFactorId || (MultiFactorId = {}));
class MultiFactorInfo {
    static initMultiFactorInfo(response) {
        let multiFactorInfo = null;
        try {
            multiFactorInfo = new PhoneMultiFactorInfo(response);
        }
        catch (e) { }
        return multiFactorInfo;
    }
    constructor(response) {
        this.initFromServerResponse(response);
    }
    toJSON() {
        return {
            uid: this.uid,
            displayName: this.displayName,
            factorId: this.factorId,
            enrollmentTime: this.enrollmentTime,
        };
    }
    initFromServerResponse(response) {
        const factorId = response && this.getFactorId(response);
        if (!factorId || !response || !response.mfaEnrollmentId) {
            throw new error_1.AuthError(error_1.AuthErrorCode.INTERNAL_ERROR, "INTERNAL ASSERT FAILED: Invalid multi-factor info response");
        }
        (0, utils_1.addReadonlyGetter)(this, "uid", response.mfaEnrollmentId);
        (0, utils_1.addReadonlyGetter)(this, "factorId", factorId);
        (0, utils_1.addReadonlyGetter)(this, "displayName", response.displayName);
        if (response.enrolledAt) {
            (0, utils_1.addReadonlyGetter)(this, "enrollmentTime", new Date(response.enrolledAt).toUTCString());
        }
        else {
            (0, utils_1.addReadonlyGetter)(this, "enrollmentTime", null);
        }
    }
}
exports.MultiFactorInfo = MultiFactorInfo;
class PhoneMultiFactorInfo extends MultiFactorInfo {
    constructor(response) {
        super(response);
        (0, utils_1.addReadonlyGetter)(this, "phoneNumber", response.phoneInfo);
    }
    toJSON() {
        return Object.assign(super.toJSON(), {
            phoneNumber: this.phoneNumber,
        });
    }
    getFactorId(response) {
        return response && response.phoneInfo ? MultiFactorId.Phone : null;
    }
}
exports.PhoneMultiFactorInfo = PhoneMultiFactorInfo;
class MultiFactorSettings {
    constructor(response) {
        const parsedEnrolledFactors = [];
        if (!(0, validator_1.isNonNullObject)(response)) {
            throw new error_1.AuthError(error_1.AuthErrorCode.INTERNAL_ERROR, "INTERNAL ASSERT FAILED: Invalid multi-factor response");
        }
        else if (response.mfaInfo) {
            response.mfaInfo.forEach((factorResponse) => {
                const multiFactorInfo = MultiFactorInfo.initMultiFactorInfo(factorResponse);
                if (multiFactorInfo) {
                    parsedEnrolledFactors.push(multiFactorInfo);
                }
            });
        }
        (0, utils_1.addReadonlyGetter)(this, "enrolledFactors", Object.freeze(parsedEnrolledFactors));
    }
    toJSON() {
        return {
            enrolledFactors: this.enrolledFactors.map((info) => info.toJSON()),
        };
    }
}
exports.MultiFactorSettings = MultiFactorSettings;
class UserMetadata {
    constructor(response) {
        (0, utils_1.addReadonlyGetter)(this, "creationTime", parseDate(response.createdAt));
        (0, utils_1.addReadonlyGetter)(this, "lastSignInTime", parseDate(response.lastLoginAt));
        const lastRefreshAt = response.lastRefreshAt
            ? new Date(response.lastRefreshAt).toUTCString()
            : null;
        (0, utils_1.addReadonlyGetter)(this, "lastRefreshTime", lastRefreshAt);
    }
    toJSON() {
        return {
            lastSignInTime: this.lastSignInTime,
            creationTime: this.creationTime,
            lastRefreshTime: this.lastRefreshTime,
        };
    }
}
exports.UserMetadata = UserMetadata;
class UserInfo {
    constructor(response) {
        if (!response.rawId || !response.providerId) {
            throw new error_1.AuthError(error_1.AuthErrorCode.INTERNAL_ERROR, "INTERNAL ASSERT FAILED: Invalid user info response");
        }
        (0, utils_1.addReadonlyGetter)(this, "uid", response.rawId);
        (0, utils_1.addReadonlyGetter)(this, "displayName", response.displayName);
        (0, utils_1.addReadonlyGetter)(this, "email", response.email);
        (0, utils_1.addReadonlyGetter)(this, "photoURL", response.photoUrl);
        (0, utils_1.addReadonlyGetter)(this, "providerId", response.providerId);
        (0, utils_1.addReadonlyGetter)(this, "phoneNumber", response.phoneNumber);
    }
    toJSON() {
        return {
            uid: this.uid,
            displayName: this.displayName,
            email: this.email,
            photoURL: this.photoURL,
            providerId: this.providerId,
            phoneNumber: this.phoneNumber,
        };
    }
}
exports.UserInfo = UserInfo;
class UserRecord {
    constructor(response) {
        if (!response.localId) {
            throw new error_1.AuthError(error_1.AuthErrorCode.INTERNAL_ERROR, "INTERNAL ASSERT FAILED: Invalid user response");
        }
        (0, utils_1.addReadonlyGetter)(this, "uid", response.localId);
        (0, utils_1.addReadonlyGetter)(this, "email", response.email);
        (0, utils_1.addReadonlyGetter)(this, "emailVerified", !!response.emailVerified);
        (0, utils_1.addReadonlyGetter)(this, "displayName", response.displayName);
        (0, utils_1.addReadonlyGetter)(this, "photoURL", response.photoUrl);
        (0, utils_1.addReadonlyGetter)(this, "phoneNumber", response.phoneNumber);
        (0, utils_1.addReadonlyGetter)(this, "disabled", response.disabled || false);
        (0, utils_1.addReadonlyGetter)(this, "metadata", new UserMetadata(response));
        const providerData = [];
        for (const entry of response.providerUserInfo || []) {
            providerData.push(new UserInfo(entry));
        }
        (0, utils_1.addReadonlyGetter)(this, "providerData", providerData);
        if (response.passwordHash === B64_REDACTED) {
            (0, utils_1.addReadonlyGetter)(this, "passwordHash", undefined);
        }
        else {
            (0, utils_1.addReadonlyGetter)(this, "passwordHash", response.passwordHash);
        }
        (0, utils_1.addReadonlyGetter)(this, "passwordSalt", response.salt);
        if (response.customAttributes) {
            (0, utils_1.addReadonlyGetter)(this, "customClaims", JSON.parse(response.customAttributes));
        }
        let validAfterTime = null;
        if (typeof response.validSince !== "undefined") {
            validAfterTime = parseDate(parseInt(response.validSince, 10) * 1000);
        }
        (0, utils_1.addReadonlyGetter)(this, "tokensValidAfterTime", validAfterTime || undefined);
        (0, utils_1.addReadonlyGetter)(this, "tenantId", response.tenantId);
        const multiFactor = new MultiFactorSettings(response);
        if (multiFactor.enrolledFactors.length > 0) {
            (0, utils_1.addReadonlyGetter)(this, "multiFactor", multiFactor);
        }
    }
    toJSON() {
        const json = {
            uid: this.uid,
            email: this.email,
            emailVerified: this.emailVerified,
            displayName: this.displayName,
            photoURL: this.photoURL,
            phoneNumber: this.phoneNumber,
            disabled: this.disabled,
            metadata: this.metadata.toJSON(),
            passwordHash: this.passwordHash,
            passwordSalt: this.passwordSalt,
            customClaims: (0, utils_1.deepCopy)(this.customClaims),
            tokensValidAfterTime: this.tokensValidAfterTime,
            tenantId: this.tenantId,
        };
        if (this.multiFactor) {
            json.multiFactor = this.multiFactor.toJSON();
        }
        json.providerData = [];
        for (const entry of this.providerData) {
            json.providerData.push(entry.toJSON());
        }
        return json;
    }
}
exports.UserRecord = UserRecord;
//# sourceMappingURL=user-record.js.map