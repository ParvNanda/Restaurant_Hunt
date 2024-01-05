"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var arcgis_rest_request_1 = require("@esri/arcgis-rest-request");
var arcgis_rest_geocoding_1 = require("@esri/arcgis-rest-geocoding");
var cors = require('cors');
var xmlConverter = require('xml2js');
var fileReader = require('fs').readFileSync('assets.json');
var express = require('express');
var bodyParser = require('body-parser');
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Line = /** @class */ (function () {
    function Line(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    return Line;
}());
;
function onLine(l1, p) {
    if (p.x <= Math.max(l1.p1.x, l1.p2.x)
        && p.x >= Math.min(l1.p1.x, l1.p2.x)
        && (p.y <= Math.max(l1.p1.y, l1.p2.y)
            && p.y >= Math.min(l1.p1.y, l1.p2.y)))
        return true;
    return false;
}
function direction(a, b, c) {
    var val = (b.y - a.y) * (c.x - b.x)
        - (b.x - a.x) * (c.y - b.y);
    if (val == 0)
        return 0;
    else if (val < 0)
        return 2;
    return 1;
}
function isIntersect(l1, l2) {
    var dir1 = direction(l1.p1, l1.p2, l2.p1);
    var dir2 = direction(l1.p1, l1.p2, l2.p2);
    var dir3 = direction(l2.p1, l2.p2, l1.p1);
    var dir4 = direction(l2.p1, l2.p2, l1.p2);
    if (dir1 != dir2 && dir3 != dir4)
        return true;
    if (dir1 == 0 && onLine(l1, l2.p1))
        return true;
    if (dir2 == 0 && onLine(l1, l2.p2))
        return true;
    if (dir3 == 0 && onLine(l2, l1.p1))
        return true;
    if (dir4 == 0 && onLine(l2, l1.p2))
        return true;
    return false;
}
function checkInside(poly, n, p) {
    if (n < 3)
        return false;
    var tmp = new Point(9999, p.y);
    var exline = new Line(p, tmp);
    var count = 0;
    var i = 0;
    do {
        var side = new Line(poly[i], poly[(i + 1) % n]);
        if (isIntersect(side, exline)) {
            if (direction(side.p1, p, side.p2) == 0)
                return onLine(side, p);
            count++;
        }
        i = (i + 1) % n;
    } while (i != 0);
    return count & 1;
}
var apiKey = "AAPK5fa135bc7dc044b3a455e85a54742d35KObsBK2s--yBjiu1ZQIrC4l8GZet5jJDjrRnsT-y2munrHrf7RYtkEliZ_RDoYvh";
var authentication = arcgis_rest_request_1.ApiKeyManager.fromKey(apiKey);
var app = express();
var port = 3000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
fileReader = (JSON.parse(fileReader));
app.get('/getOutletId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userAddress, geoRes, isInside, pmArray, outletName, i, _i, _a, coord, pCord, newPoint;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userAddress = req.query.userAddress;
                console.log(userAddress);
                return [4 /*yield*/, (0, arcgis_rest_geocoding_1.geocode)({
                        address: userAddress,
                        authentication: authentication
                    })];
            case 1:
                geoRes = _b.sent();
                isInside = false;
                pmArray = [];
                outletName = "not found";
                for (i = 1; i < fileReader.kml.Document.Placemark.length; i += 2) {
                    for (_i = 0, _a = fileReader.kml.Document.Placemark[i].Polygon.outerBoundaryIs.LinearRing.coordinates; _i < _a.length; _i++) {
                        coord = _a[_i];
                        pCord = coord.split(',');
                        newPoint = new Point(pCord[0], pCord[1]);
                        pmArray.push(newPoint);
                    }
                    isInside = checkInside(pmArray, pmArray.length, new Point(geoRes.candidates[0].location.x, geoRes.candidates[0].location.y));
                    console.log(geoRes.candidates[0].location.x, geoRes.candidates[0].location.y);
                    if (isInside == 1) {
                        outletName = fileReader.kml.Document.Placemark[i].name;
                        break;
                    }
                }
                console.log(outletName);
                res.send(outletName);
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("[server]: Server is running at http://localhost:".concat(port));
});
