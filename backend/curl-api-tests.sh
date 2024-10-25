#!/bin/bash

# Test the API with curl

baseurl='http://localhost:3002/todos/batch'

curl -X POST -H "Content-Type: application/json" -d '[{"text": "Hello, World!", "completed": "false", "priority": "null"}]' $baseurl

# Update

# curl -X PUT -H "Content-Type: application/json" -d '[{"text": "Hello, World!", "completed": "false", "priority": "null"}]' $baseurl

# Delete

# curl -X DELETE -H "Content-Type: application/json" -d '[{"id": 4}]' $baseurl