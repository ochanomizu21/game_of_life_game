#!/bin/bash
# Usage: ./loop.sh [plan] [max_iterations]

# Configuration
DEFAULT_MODEL="zai-coding-plan/glm-4.7"
TIMEOUT_DURATION="20m"   # Max time to wait for one prompt

# Parse arguments
if [ "$1" = "plan" ]; then
    MODE="plan"
    PROMPT_FILE="PROMPT_plan.md"
    MAX_ITERATIONS=${2:-0}
    MODEL="$DEFAULT_MODEL"
elif [[ "$1" =~ ^[0-9]+$ ]]; then
    MODE="build"
    PROMPT_FILE="PROMPT_build.md"
    MAX_ITERATIONS=$1
    MODEL="$DEFAULT_MODEL"
else
    MODE="build"
    PROMPT_FILE="PROMPT_build.md"
    MAX_ITERATIONS=0
    MODEL="$DEFAULT_MODEL"
fi

ITERATION=0
CURRENT_BRANCH=$(git branch --show-current)
TEMP_LOG="opencode_output.log"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Mode:   $MODE"
echo "Prompt: $PROMPT_FILE"
echo "Model:  $MODEL"
echo "Branch: $CURRENT_BRANCH"
[ $MAX_ITERATIONS -gt 0 ] && echo "Max:    $MAX_ITERATIONS iterations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found"
    exit 1
fi

while true; do
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -ge $MAX_ITERATIONS ]; then
        echo "Reached max iterations: $MAX_ITERATIONS"
        break
    fi

    echo -e "\nRunning iteration $ITERATION..."

    # FIXED COMMAND: Updated flags to match your version of opencode
    timeout "$TIMEOUT_DURATION" opencode run \
        --model "$MODEL" \
        --format json \
        --log-level DEBUG \
        "$(cat "$PROMPT_FILE")" 2>&1 | tee "$TEMP_LOG"
    
    EXIT_CODE=$?

    # Display output
    cat "$TEMP_LOG"

    # Error Check
    if [ $EXIT_CODE -ne 0 ]; then
        echo "Error detected (Exit code: $EXIT_CODE). Check log above."
        # Optional: exit 1
    fi

    # Push changes
    git push origin "$CURRENT_BRANCH" || {
        echo "Failed to push. Creating remote branch..."
        git push -u origin "$CURRENT_BRANCH"
    }

    ITERATION=$((ITERATION + 1))
    echo -e "\n\n======================== LOOP $ITERATION COMPLETE ========================\n"
done
