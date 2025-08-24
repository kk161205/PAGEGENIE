# exit_loop_tool.py
from google.adk.tools.tool_context import ToolContext

def exit_loop(tool_context: ToolContext):
    """
    Call this tool to signal that the iterative generation loop should stop.
    Typically called when all sections are completed in {generated_code}.
    """
    print(f"[Tool Call] exit_loop triggered by {tool_context.agent_name}")
    tool_context.actions.escalate = True  # Escalate terminates the loop
    return {}  # Tools should return a JSON-serializable object
