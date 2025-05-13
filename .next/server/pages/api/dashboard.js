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
exports.id = "pages/api/dashboard";
exports.ids = ["pages/api/dashboard"];
exports.modules = {

/***/ "(api-node)/./lib/prisma.js":
/*!***********************!*\
  !*** ./lib/prisma.js ***!
  \***********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("// lib/prisma.js\n\nconst { PrismaClient } = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\nlet prisma;\nif (false) {} else {\n    if (!global.prisma) {\n        global.prisma = new PrismaClient();\n    }\n    prisma = global.prisma;\n}\nmodule.exports = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaS1ub2RlKS8uL2xpYi9wcmlzbWEuanMiLCJtYXBwaW5ncyI6IkFBQUEsZ0JBQWdCOztBQUNoQixNQUFNLEVBQUVBLFlBQVksRUFBRSxHQUFHQyxtQkFBT0EsQ0FBQyxzQ0FBZ0I7QUFFakQsSUFBSUM7QUFFSixJQUFJQyxLQUFxQyxFQUFFLEVBRTFDLE1BQU07SUFDTCxJQUFJLENBQUNDLE9BQU9GLE1BQU0sRUFBRTtRQUNsQkUsT0FBT0YsTUFBTSxHQUFHLElBQUlGO0lBQ3RCO0lBQ0FFLFNBQVNFLE9BQU9GLE1BQU07QUFDeEI7QUFFQUcsT0FBT0MsT0FBTyxHQUFHSiIsInNvdXJjZXMiOlsiL1VzZXJzL3dvbG1lcnJvbWFpbi9EZXNrdG9wL21hdHJhbnNmb3JtYXRpb24tc3RhcnRlci9saWIvcHJpc21hLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGxpYi9wcmlzbWEuanNcbmNvbnN0IHsgUHJpc21hQ2xpZW50IH0gPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7XG5cbmxldCBwcmlzbWE7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpO1xufSBlbHNlIHtcbiAgaWYgKCFnbG9iYWwucHJpc21hKSB7XG4gICAgZ2xvYmFsLnByaXNtYSA9IG5ldyBQcmlzbWFDbGllbnQoKTtcbiAgfVxuICBwcmlzbWEgPSBnbG9iYWwucHJpc21hO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByaXNtYTtcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJyZXF1aXJlIiwicHJpc21hIiwicHJvY2VzcyIsImdsb2JhbCIsIm1vZHVsZSIsImV4cG9ydHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api-node)/./lib/prisma.js\n");

/***/ }),

/***/ "(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fdashboard&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fdashboard.js&middlewareConfigBase64=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fdashboard&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fdashboard.js&middlewareConfigBase64=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/pages-api/module.compiled */ \"(api-node)/./node_modules/next/dist/server/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(api-node)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api-node)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _pages_api_dashboard_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/api/dashboard.js */ \"(api-node)/./pages/api/dashboard.js\");\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_dashboard_js__WEBPACK_IMPORTED_MODULE_3__, 'default'));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_dashboard_js__WEBPACK_IMPORTED_MODULE_3__, 'config');\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/dashboard\",\n        pathname: \"/api/dashboard\",\n        // The following aren't used in production.\n        bundlePath: '',\n        filename: ''\n    },\n    userland: _pages_api_dashboard_js__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaS1ub2RlKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYnVpbGQvd2VicGFjay9sb2FkZXJzL25leHQtcm91dGUtbG9hZGVyL2luZGV4LmpzP2tpbmQ9UEFHRVNfQVBJJnBhZ2U9JTJGYXBpJTJGZGFzaGJvYXJkJnByZWZlcnJlZFJlZ2lvbj0mYWJzb2x1dGVQYWdlUGF0aD0uJTJGcGFnZXMlMkZhcGklMkZkYXNoYm9hcmQuanMmbWlkZGxld2FyZUNvbmZpZ0Jhc2U2ND1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ0U7QUFDMUQ7QUFDcUQ7QUFDckQ7QUFDQSxpRUFBZSx3RUFBSyxDQUFDLG9EQUFRLFlBQVksRUFBQztBQUMxQztBQUNPLGVBQWUsd0VBQUssQ0FBQyxvREFBUTtBQUNwQztBQUNPLHdCQUF3Qix5R0FBbUI7QUFDbEQ7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsWUFBWTtBQUNaLENBQUM7O0FBRUQiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYWdlc0FQSVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9wYWdlcy1hcGkvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBob2lzdCB9IGZyb20gXCJuZXh0L2Rpc3QvYnVpbGQvdGVtcGxhdGVzL2hlbHBlcnNcIjtcbi8vIEltcG9ydCB0aGUgdXNlcmxhbmQgY29kZS5cbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIuL3BhZ2VzL2FwaS9kYXNoYm9hcmQuanNcIjtcbi8vIFJlLWV4cG9ydCB0aGUgaGFuZGxlciAoc2hvdWxkIGJlIHRoZSBkZWZhdWx0IGV4cG9ydCkuXG5leHBvcnQgZGVmYXVsdCBob2lzdCh1c2VybGFuZCwgJ2RlZmF1bHQnKTtcbi8vIFJlLWV4cG9ydCBjb25maWcuXG5leHBvcnQgY29uc3QgY29uZmlnID0gaG9pc3QodXNlcmxhbmQsICdjb25maWcnKTtcbi8vIENyZWF0ZSBhbmQgZXhwb3J0IHRoZSByb3V0ZSBtb2R1bGUgdGhhdCB3aWxsIGJlIGNvbnN1bWVkLlxuZXhwb3J0IGNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IFBhZ2VzQVBJUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLlBBR0VTX0FQSSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2Rhc2hib2FyZFwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2Rhc2hib2FyZFwiLFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGFyZW4ndCB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICAgIGJ1bmRsZVBhdGg6ICcnLFxuICAgICAgICBmaWxlbmFtZTogJydcbiAgICB9LFxuICAgIHVzZXJsYW5kXG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFnZXMtYXBpLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fdashboard&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fdashboard.js&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api-node)/./pages/api/dashboard.js":
/*!********************************!*\
  !*** ./pages/api/dashboard.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../lib/prisma */ \"(api-node)/./lib/prisma.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_lib_prisma__WEBPACK_IMPORTED_MODULE_0__);\n// pages/api/dashboard.js\n\nasync function handler(req, res) {\n    const { utilisateurId } = req.query;\n    if (!utilisateurId) {\n        return res.status(400).json({\n            message: \"ID utilisateur requis\"\n        });\n    }\n    try {\n        const utilisateur = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0___default().user.findUnique({\n            where: {\n                id: utilisateurId\n            },\n            include: {\n                historiquePoids: {\n                    orderBy: {\n                        date: \"asc\"\n                    }\n                },\n                mensurations: {\n                    orderBy: {\n                        date: \"desc\"\n                    }\n                }\n            }\n        });\n        if (!utilisateur) {\n            return res.status(404).json({\n                message: \"Utilisateur non trouvé\"\n            });\n        }\n        res.status(200).json({\n            utilisateur\n        });\n    } catch (error) {\n        console.error(\"Erreur API /dashboard :\", error);\n        res.status(500).json({\n            message: \"Erreur serveur\"\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaS1ub2RlKS8uL3BhZ2VzL2FwaS9kYXNoYm9hcmQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEseUJBQXlCO0FBQ2E7QUFFdkIsZUFBZUMsUUFBUUMsR0FBRyxFQUFFQyxHQUFHO0lBQzVDLE1BQU0sRUFBRUMsYUFBYSxFQUFFLEdBQUdGLElBQUlHLEtBQUs7SUFFbkMsSUFBSSxDQUFDRCxlQUFlO1FBQ2xCLE9BQU9ELElBQUlHLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUF3QjtJQUNqRTtJQUVBLElBQUk7UUFDRixNQUFNQyxjQUFjLE1BQU1ULHVEQUFXLENBQUNXLFVBQVUsQ0FBQztZQUMvQ0MsT0FBTztnQkFBRUMsSUFBSVQ7WUFBYztZQUMzQlUsU0FBUztnQkFDUEMsaUJBQWlCO29CQUNmQyxTQUFTO3dCQUFFQyxNQUFNO29CQUFNO2dCQUN6QjtnQkFDQUMsY0FBYztvQkFDWkYsU0FBUzt3QkFBRUMsTUFBTTtvQkFBTztnQkFDMUI7WUFDRjtRQUNGO1FBRUEsSUFBSSxDQUFDUixhQUFhO1lBQ2hCLE9BQU9OLElBQUlHLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7Z0JBQUVDLFNBQVM7WUFBeUI7UUFDbEU7UUFFQUwsSUFBSUcsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztZQUFFRTtRQUFZO0lBQ3JDLEVBQUUsT0FBT1UsT0FBTztRQUNkQyxRQUFRRCxLQUFLLENBQUMsMkJBQTJCQTtRQUN6Q2hCLElBQUlHLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUFpQjtJQUNuRDtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvd29sbWVycm9tYWluL0Rlc2t0b3AvbWF0cmFuc2Zvcm1hdGlvbi1zdGFydGVyL3BhZ2VzL2FwaS9kYXNoYm9hcmQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFnZXMvYXBpL2Rhc2hib2FyZC5qc1xuaW1wb3J0IHByaXNtYSBmcm9tIFwiLi4vLi4vbGliL3ByaXNtYVwiO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIGNvbnN0IHsgdXRpbGlzYXRldXJJZCB9ID0gcmVxLnF1ZXJ5O1xuXG4gIGlmICghdXRpbGlzYXRldXJJZCkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IG1lc3NhZ2U6IFwiSUQgdXRpbGlzYXRldXIgcmVxdWlzXCIgfSk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHV0aWxpc2F0ZXVyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICB3aGVyZTogeyBpZDogdXRpbGlzYXRldXJJZCB9LFxuICAgICAgaW5jbHVkZToge1xuICAgICAgICBoaXN0b3JpcXVlUG9pZHM6IHtcbiAgICAgICAgICBvcmRlckJ5OiB7IGRhdGU6IFwiYXNjXCIgfVxuICAgICAgICB9LFxuICAgICAgICBtZW5zdXJhdGlvbnM6IHtcbiAgICAgICAgICBvcmRlckJ5OiB7IGRhdGU6IFwiZGVzY1wiIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCF1dGlsaXNhdGV1cikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgbWVzc2FnZTogXCJVdGlsaXNhdGV1ciBub24gdHJvdXbDqVwiIH0pO1xuICAgIH1cblxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXRpbGlzYXRldXIgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycmV1ciBBUEkgL2Rhc2hib2FyZCA6XCIsIGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IG1lc3NhZ2U6IFwiRXJyZXVyIHNlcnZldXJcIiB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbInByaXNtYSIsImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJ1dGlsaXNhdGV1cklkIiwicXVlcnkiLCJzdGF0dXMiLCJqc29uIiwibWVzc2FnZSIsInV0aWxpc2F0ZXVyIiwidXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImlkIiwiaW5jbHVkZSIsImhpc3RvcmlxdWVQb2lkcyIsIm9yZGVyQnkiLCJkYXRlIiwibWVuc3VyYXRpb25zIiwiZXJyb3IiLCJjb25zb2xlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api-node)/./pages/api/dashboard.js\n");

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
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fdashboard&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fdashboard.js&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();