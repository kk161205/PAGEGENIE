# creator_agent.py

from google.adk.agents import LlmAgent

Creator = LlmAgent(
    name="Creator",
    model="gemini-2.5-flash",
    description=(
        "Generates HTML boilerplate code and sections of a static webpage based on instructions. "
        "All CSS is inline. Inline JS can be added per element, but the main <script> block will be "
        "generated at the end of the body tag. Stores generated code in {generated_code}."
    ),
    instruction=(
        "Always use {problem_config} and {web_info_output} to gather relevant information "
        "for titles, meta tags, headings, links, and default content.\n\n"
        "Step 1: If state {generated_code} is empty, generate the full HTML boilerplate including:\n"
        "  - <!DOCTYPE html> declaration\n"
        "  - <html> and <head> tags\n"
        "  - <title> and meta description/keywords from {web_info_output} or {problem_config}\n"
        "  - <body> tag with placeholders for sections (empty divs or comments) corresponding to {section_plan}\n"
        "  - At this stage, do NOT generate section contents yet\n"
        "  - Add an empty <script></script> tag at the end of body for future JS\n\n"
        "Step 2: If {generated_code} exists and state {instruct} contains section instructions, "
        "update {generated_code} by adding the new section(s) as per instructions. "
        "Use {web_info_output} and {problem_config} if needed to fill content (like header titles, links, or default text). "
        "Maintain all existing code and inline CSS. "
        "Update the code in {generated_code} state after each addition."
    )
)
