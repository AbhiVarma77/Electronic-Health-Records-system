#!/bin/sh

sleep 5
echo "wokeup"
npx prisma generate
echo "genrate done"
npx prisma db push
echo " push done"
npx prisma studio --browser=none &
echo "browser initiated and nodemon"
nodemon index.js