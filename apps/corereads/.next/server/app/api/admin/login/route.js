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
exports.id = "app/api/admin/login/route";
exports.ids = ["app/api/admin/login/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Flogin%2Froute&page=%2Fapi%2Fadmin%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Flogin%2Froute.ts&appDir=%2FUsers%2Fsithuhtet%2FProjects%2FCoreLife%2Fapps%2Fcorereads%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fsithuhtet%2FProjects%2FCoreLife%2Fapps%2Fcorereads&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Flogin%2Froute&page=%2Fapi%2Fadmin%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Flogin%2Froute.ts&appDir=%2FUsers%2Fsithuhtet%2FProjects%2FCoreLife%2Fapps%2Fcorereads%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fsithuhtet%2FProjects%2FCoreLife%2Fapps%2Fcorereads&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_sithuhtet_Projects_CoreLife_apps_corereads_app_api_admin_login_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admin/login/route.ts */ \"(rsc)/./app/api/admin/login/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/login/route\",\n        pathname: \"/api/admin/login\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/login/route\"\n    },\n    resolvedPagePath: \"/Users/sithuhtet/Projects/CoreLife/apps/corereads/app/api/admin/login/route.ts\",\n    nextConfigOutput,\n    userland: _Users_sithuhtet_Projects_CoreLife_apps_corereads_app_api_admin_login_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/admin/login/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmxvZ2luJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhZG1pbiUyRmxvZ2luJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYWRtaW4lMkZsb2dpbiUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnNpdGh1aHRldCUyRlByb2plY3RzJTJGQ29yZUxpZmUlMkZhcHBzJTJGY29yZXJlYWRzJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnNpdGh1aHRldCUyRlByb2plY3RzJTJGQ29yZUxpZmUlMkZhcHBzJTJGY29yZXJlYWRzJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUM4QjtBQUMzRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2NvcmVyZWFkcy8/MWMwZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvc2l0aHVodGV0L1Byb2plY3RzL0NvcmVMaWZlL2FwcHMvY29yZXJlYWRzL2FwcC9hcGkvYWRtaW4vbG9naW4vcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2FkbWluL2xvZ2luL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYWRtaW4vbG9naW5cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2FkbWluL2xvZ2luL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL3NpdGh1aHRldC9Qcm9qZWN0cy9Db3JlTGlmZS9hcHBzL2NvcmVyZWFkcy9hcHAvYXBpL2FkbWluL2xvZ2luL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hZG1pbi9sb2dpbi9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Flogin%2Froute&page=%2Fapi%2Fadmin%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Flogin%2Froute.ts&appDir=%2FUsers%2Fsithuhtet%2FProjects%2FCoreLife%2Fapps%2Fcorereads%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fsithuhtet%2FProjects%2FCoreLife%2Fapps%2Fcorereads&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/admin/login/route.ts":
/*!**************************************!*\
  !*** ./app/api/admin/login/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n\n\nasync function GET() {\n    const authed = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__.isAdminAuthed)();\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        authed\n    });\n}\nasync function POST(request) {\n    const body = await request.json().catch(()=>null);\n    const password = body?.password;\n    const expected = process.env.COREREADS_ADMIN_PASSWORD;\n    if (!expected || password !== expected) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Unauthorized\"\n        }, {\n            status: 401\n        });\n    }\n    const response = next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        ok: true\n    });\n    response.cookies.set(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.ADMIN_COOKIE_NAME, \"1\", {\n        httpOnly: true,\n        sameSite: \"lax\",\n        secure: \"development\" === \"production\",\n        path: \"/\"\n    });\n    return response;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWluL2xvZ2luL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBd0Q7QUFDTTtBQUV2RCxlQUFlRztJQUNwQixNQUFNQyxTQUFTLE1BQU1GLHdEQUFhQTtJQUNsQyxPQUFPRixxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1FBQUVEO0lBQU87QUFDcEM7QUFFTyxlQUFlRSxLQUFLQyxPQUFvQjtJQUM3QyxNQUFNQyxPQUFPLE1BQU1ELFFBQVFGLElBQUksR0FBR0ksS0FBSyxDQUFDLElBQU07SUFDOUMsTUFBTUMsV0FBV0YsTUFBTUU7SUFDdkIsTUFBTUMsV0FBV0MsUUFBUUMsR0FBRyxDQUFDQyx3QkFBd0I7SUFFckQsSUFBSSxDQUFDSCxZQUFZRCxhQUFhQyxVQUFVO1FBQ3RDLE9BQU9YLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRVUsT0FBTztRQUFlLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ3BFO0lBRUEsTUFBTUMsV0FBV2pCLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7UUFBRWEsSUFBSTtJQUFLO0lBQzlDRCxTQUFTRSxPQUFPLENBQUNDLEdBQUcsQ0FBQ25CLHdEQUFpQkEsRUFBRSxLQUFLO1FBQzNDb0IsVUFBVTtRQUNWQyxVQUFVO1FBQ1ZDLFFBQVFYLGtCQUF5QjtRQUNqQ1ksTUFBTTtJQUNSO0lBRUEsT0FBT1A7QUFDVCIsInNvdXJjZXMiOlsid2VicGFjazovL2NvcmVyZWFkcy8uL2FwcC9hcGkvYWRtaW4vbG9naW4vcm91dGUudHM/ZjQ0YSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgeyBBRE1JTl9DT09LSUVfTkFNRSwgaXNBZG1pbkF1dGhlZCB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XG4gIGNvbnN0IGF1dGhlZCA9IGF3YWl0IGlzQWRtaW5BdXRoZWQoKTtcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgYXV0aGVkIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCk7XG4gIGNvbnN0IHBhc3N3b3JkID0gYm9keT8ucGFzc3dvcmQ7XG4gIGNvbnN0IGV4cGVjdGVkID0gcHJvY2Vzcy5lbnYuQ09SRVJFQURTX0FETUlOX1BBU1NXT1JEO1xuXG4gIGlmICghZXhwZWN0ZWQgfHwgcGFzc3dvcmQgIT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiVW5hdXRob3JpemVkXCIgfSwgeyBzdGF0dXM6IDQwMSB9KTtcbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlID0gTmV4dFJlc3BvbnNlLmpzb24oeyBvazogdHJ1ZSB9KTtcbiAgcmVzcG9uc2UuY29va2llcy5zZXQoQURNSU5fQ09PS0lFX05BTUUsIFwiMVwiLCB7XG4gICAgaHR0cE9ubHk6IHRydWUsXG4gICAgc2FtZVNpdGU6IFwibGF4XCIsXG4gICAgc2VjdXJlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIsXG4gICAgcGF0aDogXCIvXCJcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsIkFETUlOX0NPT0tJRV9OQU1FIiwiaXNBZG1pbkF1dGhlZCIsIkdFVCIsImF1dGhlZCIsImpzb24iLCJQT1NUIiwicmVxdWVzdCIsImJvZHkiLCJjYXRjaCIsInBhc3N3b3JkIiwiZXhwZWN0ZWQiLCJwcm9jZXNzIiwiZW52IiwiQ09SRVJFQURTX0FETUlOX1BBU1NXT1JEIiwiZXJyb3IiLCJzdGF0dXMiLCJyZXNwb25zZSIsIm9rIiwiY29va2llcyIsInNldCIsImh0dHBPbmx5Iiwic2FtZVNpdGUiLCJzZWN1cmUiLCJwYXRoIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admin/login/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ADMIN_COOKIE_NAME: () => (/* binding */ ADMIN_COOKIE_NAME),\n/* harmony export */   isAdminAuthed: () => (/* binding */ isAdminAuthed)\n/* harmony export */ });\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\nconst ADMIN_COOKIE_NAME = \"corereads_admin\";\nasync function isAdminAuthed() {\n    const store = await (0,next_headers__WEBPACK_IMPORTED_MODULE_0__.cookies)();\n    const value = store.get(ADMIN_COOKIE_NAME)?.value;\n    return value === \"1\";\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBdUM7QUFFaEMsTUFBTUMsb0JBQW9CLGtCQUFrQjtBQUU1QyxlQUFlQztJQUNwQixNQUFNQyxRQUFRLE1BQU1ILHFEQUFPQTtJQUMzQixNQUFNSSxRQUFRRCxNQUFNRSxHQUFHLENBQUNKLG9CQUFvQkc7SUFDNUMsT0FBT0EsVUFBVTtBQUNuQiIsInNvdXJjZXMiOlsid2VicGFjazovL2NvcmVyZWFkcy8uL2xpYi9hdXRoLnRzP2JmN2UiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29va2llcyB9IGZyb20gXCJuZXh0L2hlYWRlcnNcIjtcblxuZXhwb3J0IGNvbnN0IEFETUlOX0NPT0tJRV9OQU1FID0gXCJjb3JlcmVhZHNfYWRtaW5cIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzQWRtaW5BdXRoZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHN0b3JlID0gYXdhaXQgY29va2llcygpO1xuICBjb25zdCB2YWx1ZSA9IHN0b3JlLmdldChBRE1JTl9DT09LSUVfTkFNRSk/LnZhbHVlO1xuICByZXR1cm4gdmFsdWUgPT09IFwiMVwiO1xufVxuIl0sIm5hbWVzIjpbImNvb2tpZXMiLCJBRE1JTl9DT09LSUVfTkFNRSIsImlzQWRtaW5BdXRoZWQiLCJzdG9yZSIsInZhbHVlIiwiZ2V0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Flogin%2Froute&page=%2Fapi%2Fadmin%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Flogin%2Froute.ts&appDir=%2FUsers%2Fsithuhtet%2FProjects%2FCoreLife%2Fapps%2Fcorereads%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fsithuhtet%2FProjects%2FCoreLife%2Fapps%2Fcorereads&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();