#!/usr/bin/env bun

import { executeCliProcess } from "./execute-cli-process";

process.exit(await executeCliProcess());
