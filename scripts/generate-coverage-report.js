import { execSync } from "child_process";
import fs from "fs";

const testOutput = execSync("pnpm run test:coverage").toString();

const extractCoverage = (output) => {
	const coverageRegex =
		/(Statements|Branches|Functions|Lines)\s*\|\s*(\d+\.\d+%)/g;
	const matches = [...output.matchAll(coverageRegex)];
	return matches.reduce((acc, match) => {
		acc[match[1].toLowerCase()] = match[2];
		return acc;
	}, {});
};

const coverage = extractCoverage(testOutput);

const report = `Test Coverage Report
====================

| Metric | Coverage |
|--------|----------|
| Statements | ${coverage.statements} |
| Branches | ${coverage.branches} |
| Functions | ${coverage.functions} |
| Lines | ${coverage.lines} |

${testOutput}
`;

fs.writeFileSync("../test-coverage.md", report);
