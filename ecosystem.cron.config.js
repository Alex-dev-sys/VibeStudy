module.exports = {
    apps: [
        {
            name: 'vibestudy-cron',
            script: 'scripts/cron-service.ts',
            interpreter: 'node',
            interpreter_args: '-r ts-node/register',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
