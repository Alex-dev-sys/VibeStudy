#!/bin/bash
cd /var/www/vibestudy
echo "$(date): Starting deploy..." >> /var/log/deploy.log
git pull origin main >> /var/log/deploy.log 2>&1
npm install >> /var/log/deploy.log 2>&1
NODE_OPTIONS="--max-old-space-size=1536" npm run build >> /var/log/deploy.log 2>&1
pm2 restart vibestudy >> /var/log/deploy.log 2>&1
echo "$(date): Deploy complete!" >> /var/log/deploy.log
