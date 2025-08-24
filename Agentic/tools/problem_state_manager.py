from typing import Any, Dict, Union
from google.adk.tools import ToolContext

# Define which fields are expected to be lists
LIST_FIELDS = {
    "main_headings_sections",  # multiple headings/sections
    "images_media",            # multiple images
    "navigation_links",        # multiple nav links
    "interactive_elements"     # multiple interactive components
}

def update_problem_config_tool(
    key: str,
    value: Any,
    tool_context: ToolContext
) -> Dict[str, Any]:
    """
    Updates the session's problem_config or details state with a new value for the given key.
    Returns a plain dict instead of the raw State object to avoid serialization errors.
    """
    # Determine target dict
    target_dict = None
    if "problem_config" in tool_context.state and key in tool_context.state["problem_config"]:
        target_dict = tool_context.state["problem_config"]
    elif "details" in tool_context.state and key in tool_context.state["details"]:
        target_dict = tool_context.state["details"]
    else:
        return {
            "status": "error",
            "message": f"Key '{key}' is not a valid problem_config or details field.",
            "updated_config": {
                "problem_config": dict(tool_context.state.get("problem_config", {})),
                "details": dict(tool_context.state.get("details", {}))
            }
        }

    previous_value = target_dict.get(key)

    # Type validation
    if key in LIST_FIELDS:
        if isinstance(value, str):
            value = [v.strip() for v in value.split(",") if v.strip()]
        elif not isinstance(value, list):
            return {
                "status": "error",
                "message": f"Invalid type for '{key}': expected list or comma-separated string.",
                "updated_config": {
                    "problem_config": dict(tool_context.state.get("problem_config", {})),
                    "details": dict(tool_context.state.get("details", {}))
                }
            }
    else:
        value = str(value)

    # Update the target dict
    target_dict[key] = value

    # Save back to state
    if target_dict is tool_context.state.get("problem_config"):
        tool_context.state["problem_config"] = target_dict
    else:
        tool_context.state["details"] = target_dict

    return {
        "status": "success",
        "message": f"Updated '{key}' from '{previous_value}' to '{value}'",
        "updated_config": {
            "problem_config": dict(tool_context.state.get("problem_config", {})),
            "details": dict(tool_context.state.get("details", {}))
        }
    }
