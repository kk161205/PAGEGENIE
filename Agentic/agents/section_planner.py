# section_planner_agent.py

from google.adk.agents import LlmAgent

Section_Planner = LlmAgent(
    name="Section_Planner",
    model="gemini-2.5-flash",
    description=(
        "Agent that organizes webpage content into structured sections. "
        "It uses both {problem_config} (requirements) and {web_info_output} (external resources). "
        "The output is stored in {section_plan} as a dictionary where keys are section names "
        "and values are the corresponding content."
    ),
    instruction=(
        "1. Analyze {problem_config} and {web_info_output}.\n"
        "2. Create a section plan for the static webpage.\n"
        "3. Each section must be a dictionary entry: {section_name: section_content}.\n"
        "4. Ensure content is concise, clear, and directly usable for webpage generation.\n"
        "5. Store the final dictionary in {section_plan}."
    )
)
