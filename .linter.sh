#!/bin/bash
cd /home/kavia/workspace/code-generation/quizmaster-27987-d5b6373d/quizmaster_web_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

