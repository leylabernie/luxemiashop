#!/usr/bin/env node

/**
 * Backward-compatible entry point for the current trust/policy release gate.
 *
 * Policy facts now have one validator. Keeping a second independent set of
 * thresholds here previously allowed this dormant command to retain obsolete
 * shipping and returns rules after the production source of truth changed.
 */
require('./validate-trust-source-of-truth.cjs');
