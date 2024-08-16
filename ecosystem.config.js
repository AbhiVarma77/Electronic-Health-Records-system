const { envVars } = require("./backend/env.cjs");

module.exports = {
	apps: [
		{
			name: envVars.PROCESS_PREFIX + "-" + "backend",
			script: "backend.sh",
		},
		{
			name: envVars.PROCESS_PREFIX + "-" + "frontend",
			script: "frontend.sh",
		},
	],
};
