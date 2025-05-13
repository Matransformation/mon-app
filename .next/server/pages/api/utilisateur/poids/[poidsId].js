"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/utilisateur/poids/[poidsId]";
exports.ids = ["pages/api/utilisateur/poids/[poidsId]"];
exports.modules = {

/***/ "(api-node)/./lib/prisma.js":
/*!***********************!*\
  !*** ./lib/prisma.js ***!
  \***********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("// lib/prisma.js\n\nconst { PrismaClient } = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\nlet prisma;\nif (false) {} else {\n    if (!global.prisma) {\n        global.prisma = new PrismaClient();\n    }\n    prisma = global.prisma;\n}\nmodule.exports = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaS1ub2RlKS8uL2xpYi9wcmlzbWEuanMiLCJtYXBwaW5ncyI6IkFBQUEsZ0JBQWdCOztBQUNoQixNQUFNLEVBQUVBLFlBQVksRUFBRSxHQUFHQyxtQkFBT0EsQ0FBQyxzQ0FBZ0I7QUFFakQsSUFBSUM7QUFFSixJQUFJQyxLQUFxQyxFQUFFLEVBRTFDLE1BQU07SUFDTCxJQUFJLENBQUNDLE9BQU9GLE1BQU0sRUFBRTtRQUNsQkUsT0FBT0YsTUFBTSxHQUFHLElBQUlGO0lBQ3RCO0lBQ0FFLFNBQVNFLE9BQU9GLE1BQU07QUFDeEI7QUFFQUcsT0FBT0MsT0FBTyxHQUFHSiIsInNvdXJjZXMiOlsiL1VzZXJzL3dvbG1lcnJvbWFpbi9EZXNrdG9wL21hdHJhbnNmb3JtYXRpb24tc3RhcnRlci9saWIvcHJpc21hLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGxpYi9wcmlzbWEuanNcbmNvbnN0IHsgUHJpc21hQ2xpZW50IH0gPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7XG5cbmxldCBwcmlzbWE7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpO1xufSBlbHNlIHtcbiAgaWYgKCFnbG9iYWwucHJpc21hKSB7XG4gICAgZ2xvYmFsLnByaXNtYSA9IG5ldyBQcmlzbWFDbGllbnQoKTtcbiAgfVxuICBwcmlzbWEgPSBnbG9iYWwucHJpc21hO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByaXNtYTtcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJyZXF1aXJlIiwicHJpc21hIiwicHJvY2VzcyIsImdsb2JhbCIsIm1vZHVsZSIsImV4cG9ydHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api-node)/./lib/prisma.js\n");

/***/ }),

/***/ "(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Futilisateur%2Fpoids%2F%5BpoidsId%5D&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Futilisateur%2Fpoids%2F%5BpoidsId%5D.js&middlewareConfigBase64=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Futilisateur%2Fpoids%2F%5BpoidsId%5D&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Futilisateur%2Fpoids%2F%5BpoidsId%5D.js&middlewareConfigBase64=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/pages-api/module.compiled */ \"(api-node)/./node_modules/next/dist/server/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(api-node)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api-node)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _pages_api_utilisateur_poids_poidsId_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/api/utilisateur/poids/[poidsId].js */ \"(api-node)/./pages/api/utilisateur/poids/[poidsId].js\");\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_utilisateur_poids_poidsId_js__WEBPACK_IMPORTED_MODULE_3__, 'default'));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_utilisateur_poids_poidsId_js__WEBPACK_IMPORTED_MODULE_3__, 'config');\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/utilisateur/poids/[poidsId]\",\n        pathname: \"/api/utilisateur/poids/[poidsId]\",\n        // The following aren't used in production.\n        bundlePath: '',\n        filename: ''\n    },\n    userland: _pages_api_utilisateur_poids_poidsId_js__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaS1ub2RlKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYnVpbGQvd2VicGFjay9sb2FkZXJzL25leHQtcm91dGUtbG9hZGVyL2luZGV4LmpzP2tpbmQ9UEFHRVNfQVBJJnBhZ2U9JTJGYXBpJTJGdXRpbGlzYXRldXIlMkZwb2lkcyUyRiU1QnBvaWRzSWQlNUQmcHJlZmVycmVkUmVnaW9uPSZhYnNvbHV0ZVBhZ2VQYXRoPS4lMkZwYWdlcyUyRmFwaSUyRnV0aWxpc2F0ZXVyJTJGcG9pZHMlMkYlNUJwb2lkc0lkJTVELmpzJm1pZGRsZXdhcmVDb25maWdCYXNlNjQ9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNFO0FBQzFEO0FBQ3VFO0FBQ3ZFO0FBQ0EsaUVBQWUsd0VBQUssQ0FBQyxvRUFBUSxZQUFZLEVBQUM7QUFDMUM7QUFDTyxlQUFlLHdFQUFLLENBQUMsb0VBQVE7QUFDcEM7QUFDTyx3QkFBd0IseUdBQW1CO0FBQ2xEO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLFlBQVk7QUFDWixDQUFDOztBQUVEIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFnZXNBUElSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvcGFnZXMtYXBpL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgaG9pc3QgfSBmcm9tIFwibmV4dC9kaXN0L2J1aWxkL3RlbXBsYXRlcy9oZWxwZXJzXCI7XG4vLyBJbXBvcnQgdGhlIHVzZXJsYW5kIGNvZGUuXG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiLi9wYWdlcy9hcGkvdXRpbGlzYXRldXIvcG9pZHMvW3BvaWRzSWRdLmpzXCI7XG4vLyBSZS1leHBvcnQgdGhlIGhhbmRsZXIgKHNob3VsZCBiZSB0aGUgZGVmYXVsdCBleHBvcnQpLlxuZXhwb3J0IGRlZmF1bHQgaG9pc3QodXNlcmxhbmQsICdkZWZhdWx0Jyk7XG4vLyBSZS1leHBvcnQgY29uZmlnLlxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IGhvaXN0KHVzZXJsYW5kLCAnY29uZmlnJyk7XG4vLyBDcmVhdGUgYW5kIGV4cG9ydCB0aGUgcm91dGUgbW9kdWxlIHRoYXQgd2lsbCBiZSBjb25zdW1lZC5cbmV4cG9ydCBjb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBQYWdlc0FQSVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5QQUdFU19BUEksXG4gICAgICAgIHBhZ2U6IFwiL2FwaS91dGlsaXNhdGV1ci9wb2lkcy9bcG9pZHNJZF1cIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS91dGlsaXNhdGV1ci9wb2lkcy9bcG9pZHNJZF1cIixcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBhcmVuJ3QgdXNlZCBpbiBwcm9kdWN0aW9uLlxuICAgICAgICBidW5kbGVQYXRoOiAnJyxcbiAgICAgICAgZmlsZW5hbWU6ICcnXG4gICAgfSxcbiAgICB1c2VybGFuZFxufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhZ2VzLWFwaS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Futilisateur%2Fpoids%2F%5BpoidsId%5D&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Futilisateur%2Fpoids%2F%5BpoidsId%5D.js&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api-node)/./pages/api/utilisateur/poids/[poidsId].js":
/*!**************************************************!*\
  !*** ./pages/api/utilisateur/poids/[poidsId].js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../lib/prisma */ \"(api-node)/./lib/prisma.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_lib_prisma__WEBPACK_IMPORTED_MODULE_0__);\n\nasync function handler(req, res) {\n    const { poidsId } = req.query;\n    if (req.method !== \"DELETE\") {\n        return res.status(405).json({\n            message: \"Méthode non autorisée\"\n        });\n    }\n    try {\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_0___default().historiquePoids.delete({\n            where: {\n                id: poidsId\n            }\n        });\n        res.status(200).json({\n            message: \"Entrée supprimée\"\n        });\n    } catch (error) {\n        console.error(\"Erreur suppression :\", error);\n        res.status(500).json({\n            message: \"Erreur serveur\"\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaS1ub2RlKS8uL3BhZ2VzL2FwaS91dGlsaXNhdGV1ci9wb2lkcy9bcG9pZHNJZF0uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTRDO0FBRTdCLGVBQWVDLFFBQVFDLEdBQUcsRUFBRUMsR0FBRztJQUM1QyxNQUFNLEVBQUVDLE9BQU8sRUFBRSxHQUFHRixJQUFJRyxLQUFLO0lBRTdCLElBQUlILElBQUlJLE1BQU0sS0FBSyxVQUFVO1FBQzNCLE9BQU9ILElBQUlJLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUF3QjtJQUNqRTtJQUVBLElBQUk7UUFDRixNQUFNVCxrRUFBc0IsQ0FBQ1csTUFBTSxDQUFDO1lBQ2xDQyxPQUFPO2dCQUFFQyxJQUFJVDtZQUFRO1FBQ3ZCO1FBQ0FELElBQUlJLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUFtQjtJQUNyRCxFQUFFLE9BQU9LLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLHdCQUF3QkE7UUFDdENYLElBQUlJLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUFpQjtJQUNuRDtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvd29sbWVycm9tYWluL0Rlc2t0b3AvbWF0cmFuc2Zvcm1hdGlvbi1zdGFydGVyL3BhZ2VzL2FwaS91dGlsaXNhdGV1ci9wb2lkcy9bcG9pZHNJZF0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHByaXNtYSBmcm9tIFwiLi4vLi4vLi4vLi4vbGliL3ByaXNtYVwiO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIGNvbnN0IHsgcG9pZHNJZCB9ID0gcmVxLnF1ZXJ5O1xuXG4gIGlmIChyZXEubWV0aG9kICE9PSBcIkRFTEVURVwiKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA1KS5qc29uKHsgbWVzc2FnZTogXCJNw6l0aG9kZSBub24gYXV0b3Jpc8OpZVwiIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBwcmlzbWEuaGlzdG9yaXF1ZVBvaWRzLmRlbGV0ZSh7XG4gICAgICB3aGVyZTogeyBpZDogcG9pZHNJZCB9LFxuICAgIH0pO1xuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgbWVzc2FnZTogXCJFbnRyw6llIHN1cHByaW3DqWVcIiB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyZXVyIHN1cHByZXNzaW9uIDpcIiwgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgbWVzc2FnZTogXCJFcnJldXIgc2VydmV1clwiIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOlsicHJpc21hIiwiaGFuZGxlciIsInJlcSIsInJlcyIsInBvaWRzSWQiLCJxdWVyeSIsIm1ldGhvZCIsInN0YXR1cyIsImpzb24iLCJtZXNzYWdlIiwiaGlzdG9yaXF1ZVBvaWRzIiwiZGVsZXRlIiwid2hlcmUiLCJpZCIsImVycm9yIiwiY29uc29sZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api-node)/./pages/api/utilisateur/poids/[poidsId].js\n");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/pages-api.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages-api.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages-api.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Futilisateur%2Fpoids%2F%5BpoidsId%5D&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Futilisateur%2Fpoids%2F%5BpoidsId%5D.js&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();