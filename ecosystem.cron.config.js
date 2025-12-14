module.exports = {
    apps: [
        {
            name: 'vibestudy-cron',
            script: 'npm',
            args: 'run cron:start',
            interpreter: 'none',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
