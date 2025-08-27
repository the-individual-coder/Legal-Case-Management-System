#!/bin/bash

ROUTES_DIR="./routes/v1.0"
CONTROLLERS_DIR="./controllers"

# Create controllers folder if it doesn't exist
mkdir -p "$CONTROLLERS_DIR"

# Loop through all route files
for file in "$ROUTES_DIR"/*.js; do
    filename=$(basename "$file")
    name="${filename%.js}"                       # remove extension
    controller_file="$CONTROLLERS_DIR/${name}.controller.js"
    model_name="${name^}"                        # capitalize first letter

    # Skip if controller already exists
    if [ -f "$controller_file" ]; then
        echo "Already exists: $controller_file"
        continue
    fi

    # Create controller file with placeholder
    cat <<EOL > "$controller_file"
const {${model_name}} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class ${model_name}Controller extends BaseController {
    constructor(){
        super(${model_name})
    }

    async get${model_name}s(){
        const ${name} = await ${model_name}.findAll()
        console.log("the ${name}")
        return this.createResponse(${name})
    }
}
EOL

    echo "Created: $controller_file"
done
