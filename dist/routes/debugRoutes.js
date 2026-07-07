"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAppInstance = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
// Store app reference for route listing
let appInstance = null;
const setAppInstance = (app) => { appInstance = app; };
exports.setAppInstance = setAppInstance;
// List all registered routes
router.get('/routes', (req, res) => {
    if (!appInstance) {
        return res.json({ error: 'App instance not set' });
    }
    const routes = [];
    const extractRoutes = (stack, basePath = '') => {
        stack.forEach((layer) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                routes.push({ method: methods, path: basePath + layer.route.path });
            }
            else if (layer.name === 'router' && layer.handle.stack) {
                const routerPath = layer.regexp.source
                    .replace('\\/?', '')
                    .replace('(?=\\/|$)', '')
                    .replace(/\\\//g, '/')
                    .replace('^', '')
                    .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param');
                extractRoutes(layer.handle.stack, basePath + routerPath);
            }
        });
    };
    extractRoutes(appInstance._router.stack);
    // Filter for admin routes
    const adminRoutes = routes.filter(r => r.path.includes('/admin'));
    res.json({
        totalRoutes: routes.length,
        adminRoutes: adminRoutes,
        allRoutes: routes
    });
});
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Check Date
        const now = new Date();
        // 2. Check DB Connection
        let dbStatus = 'Unknown';
        let userCount = -1;
        let errorDetail = null;
        try {
            userCount = yield prisma_1.default.user.count();
            dbStatus = 'Connected';
        }
        catch (e) {
            dbStatus = 'Failed';
            errorDetail = e.message;
        }
        // 3. Check Env Vars (Masked)
        const dbUrl = process.env.DATABASE_URL || 'Not Set';
        const maskedDbUrl = dbUrl.length > 20
            ? `${dbUrl.substring(0, 10)}...${dbUrl.substring(dbUrl.length - 10)}`
            : dbUrl;
        res.json({
            status: 'Debug Info',
            version: 'v1.0.3-test',
            timestamp: now.toISOString(),
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
                DATABASE_URL: maskedDbUrl,
            },
            database: {
                status: dbStatus,
                userCount: userCount,
                error: errorDetail
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Debug endpoint failed',
            message: error.message,
            stack: error.stack
        });
    }
}));
router.get('/check-wholesaler-products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma_1.default.product.findMany({
            where: {
                retailerId: null
            }
        });
        res.json(products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            retailerPrice: p.retailerPrice,
            taxType: p.taxType
        })));
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
router.get('/check-retailer-products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma_1.default.product.findMany({
            where: {
                retailerId: { not: null }
            }
        });
        res.json(products);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
router.get('/check-invoices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoices = yield prisma_1.default.customProfitInvoice.findMany();
        res.json(invoices);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
router.get('/seed-templates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exec } = require('child_process');
        const path = require('path');
        const fs = require('fs');
        const isTS = __filename.endsWith('.ts');
        const ext = isTS ? 'ts' : 'js';
        const runner = isTS ? 'npx ts-node' : 'node';
        const templatesScript = path.join(__dirname, `../scripts/initTemplates.${ext}`);
        const mappingsScript = path.join(__dirname, `../scripts/initEventMappings.${ext}`);
        exec(`${runner} "${templatesScript}"`, (err1, stdout1, stderr1) => {
            if (err1) {
                return res.status(500).json({ error: 'Failed to seed templates', details: stderr1 || err1.message });
            }
            exec(`${runner} "${mappingsScript}"`, (err2, stdout2, stderr2) => {
                if (err2) {
                    return res.status(500).json({ error: 'Failed to seed mappings', details: stderr2 || err2.message });
                }
                res.json({
                    success: true,
                    message: 'Templates and event mappings seeded successfully on production database!',
                    templatesOutput: stdout1,
                    mappingsOutput: stdout2
                });
            });
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
router.get('/fix-taxes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = [];
        const retailerProducts = yield prisma_1.default.product.findMany({
            where: {
                retailerId: { not: null }
            }
        });
        for (const product of retailerProducts) {
            const wholesalerProduct = yield prisma_1.default.product.findFirst({
                where: {
                    name: product.name,
                    retailerId: null,
                    wholesalerId: { not: null }
                }
            });
            if (wholesalerProduct) {
                const correctTaxType = wholesalerProduct.taxType || 'B';
                const config = yield prisma_1.default.systemConfig.findFirst();
                const retailerMarkup = (config === null || config === void 0 ? void 0 : config.retailerMarkup) || 20;
                let cleanCost = product.costPrice || product.price;
                if (!product.costPrice) {
                    const { reverseVATCalculation } = require('../utils/pricingReversalUtils');
                    const reversed = reverseVATCalculation(product.price, product.taxType);
                    cleanCost = reversed.cleanBaseCost;
                }
                const markupPrice = cleanCost * (1 + retailerMarkup / 100);
                const vatMultiplier = correctTaxType === 'B' ? 1.18 : 1;
                const newPrice = (wholesalerProduct.retailerPrice && wholesalerProduct.retailerPrice > cleanCost)
                    ? wholesalerProduct.retailerPrice
                    : Math.ceil(markupPrice * vatMultiplier);
                if (product.taxType !== correctTaxType || product.price !== newPrice) {
                    yield prisma_1.default.product.update({
                        where: { id: product.id },
                        data: {
                            taxType: correctTaxType,
                            price: newPrice,
                            costPrice: cleanCost
                        }
                    });
                    results.push({
                        name: product.name,
                        taxType: `${product.taxType} -> ${correctTaxType}`,
                        price: `${product.price} -> ${newPrice} RWF`,
                        costPrice: cleanCost
                    });
                }
            }
        }
        // Correct past invoices that have volume instead of value stored
        const pastInvoices = yield prisma_1.default.customProfitInvoice.findMany({
            where: {
                rewardsGivenAmt: { gt: 0, lt: 10 }
            }
        });
        for (const inv of pastInvoices) {
            const systemConfig = yield prisma_1.default.systemConfig.findFirst();
            const gasPrice = (systemConfig === null || systemConfig === void 0 ? void 0 : systemConfig.gasPricePerM3) || 6500;
            const correctRewardsVal = Math.round(inv.rewardsGivenAmt * gasPrice);
            const newTotalExpense = inv.rentExpense + inv.salariesExpense + inv.otherExpense + correctRewardsVal;
            const newNetProfit = Math.max(0, inv.grossProfit - newTotalExpense - inv.tax);
            const newRecipientShare = Math.round(newNetProfit * (inv.recipientSharePct / 100) * 100) / 100;
            const newCompanyShare = Math.round(newNetProfit * (inv.companySharePct / 100) * 100) / 100;
            yield prisma_1.default.customProfitInvoice.update({
                where: { id: inv.id },
                data: {
                    rewardsGivenAmt: correctRewardsVal,
                    totalExpense: newTotalExpense,
                    netProfit: newNetProfit,
                    recipientShareAmt: newRecipientShare,
                    companyShareAmt: newCompanyShare,
                    finalPayable: newRecipientShare
                }
            });
            results.push({
                invoiceId: inv.id,
                recipientName: inv.recipientName,
                rewardsGivenAmt: `${inv.rewardsGivenAmt} -> ${correctRewardsVal} RWF`,
                netProfit: `${inv.netProfit} -> ${newNetProfit} RWF`
            });
        }
        res.json({ success: true, updated: results });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// === GPRS METER DIAGNOSTIC TEST ===
router.get('/gprs-test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const imei = req.query.imei || '865395070835713';
    const baseUrl = process.env.LORAWAN_BASE_URL || 'http://english.energyy.ucskype.com';
    const username = process.env.LORAWAN_USERNAME || 'Rwanda_Kayitare';
    const password = process.env.LORAWAN_PASSWORD || '123456';
    const results = { imei, baseUrl, tests: [] };
    try {
        const axios = (yield Promise.resolve().then(() => __importStar(require('axios')))).default;
        // Step 1: Login
        const loginPayload = { action: "lorawanMeter", method: "toLogin", params: { username, password } };
        const loginResp = yield axios.post(`${baseUrl}/api/commonInternal.jsp`, `requestParams=${encodeURIComponent(JSON.stringify(loginPayload))}`, { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 10000 });
        const apiToken = (_b = (_a = loginResp.data) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.apiToken;
        results.login = { success: !!apiToken, apiToken: apiToken ? `${apiToken.substring(0, 8)}...` : null, fullResponse: loginResp.data };
        if (!apiToken) {
            return res.json(Object.assign(Object.assign({}, results), { error: 'Login failed' }));
        }
        // Test all combinations
        const testCases = [
            { name: 'zlMeter+remotelyTopUp+imei', action: 'zlMeter', method: 'remotelyTopUp', paramKey: 'imei', extraParams: { topUpAmount: '1', topUpToDeviceAmount: '1' } },
            { name: 'zlMeter+remotelyTopUp+devEui', action: 'zlMeter', method: 'remotelyTopUp', paramKey: 'devEui', extraParams: { topUpAmount: '1', topUpToDeviceAmount: '1' } },
            { name: 'lorawanMeter+remotelyTopUp+imei', action: 'lorawanMeter', method: 'remotelyTopUp', paramKey: 'imei', extraParams: { topUpAmount: '1', topUpToDeviceAmount: '1' } },
            { name: 'lorawanMeter+remotelyTopUp+devEui', action: 'lorawanMeter', method: 'remotelyTopUp', paramKey: 'devEui', extraParams: { topUpAmount: '1', topUpToDeviceAmount: '1' } },
            { name: 'zlMeter+queryMeterInfo+imei', action: 'zlMeter', method: 'queryMeterInfo', paramKey: 'imei', extraParams: {} },
            { name: 'lorawanMeter+queryMeterInfo+imei', action: 'lorawanMeter', method: 'queryMeterInfo', paramKey: 'imei', extraParams: {} },
            { name: 'lorawanMeter+queryMeterInfo+devEui', action: 'lorawanMeter', method: 'queryMeterInfo', paramKey: 'devEui', extraParams: {} },
        ];
        for (const tc of testCases) {
            try {
                const payload = {
                    action: tc.action,
                    method: tc.method,
                    apiToken,
                    param: Object.assign({ [tc.paramKey]: imei }, tc.extraParams)
                };
                const resp = yield axios.post(`${baseUrl}/api/commonInternal.jsp`, `requestParams=${encodeURIComponent(JSON.stringify(payload))}`, { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 10000 });
                results.tests.push({ name: tc.name, payload: payload.param, response: resp.data });
            }
            catch (e) {
                results.tests.push({ name: tc.name, error: e.message });
            }
        }
        return res.json(results);
    }
    catch (e) {
        return res.json(Object.assign(Object.assign({}, results), { error: e.message }));
    }
}));
exports.default = router;
