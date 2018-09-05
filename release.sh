#!/bin/bash
cp config-prod.json config.json
gcloud app deploy
