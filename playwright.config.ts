"use strict"
Object.defineProperty(exports, "__esModule", { value: true});

const config = {
    testDir: "tests/e2e",
    timeout: 30 * 1000,
    use: {
        headless: true,
    },
    expect: {
        timeout: 5000
    },
};
exports.default = config;