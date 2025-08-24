from google.adk.agents import LlmAgent
from tools import update_problem_config_tool

Requirement_gatherer = LlmAgent(
    name="requirement_gatherer",
    model="gemini-2.5-flash",
    description=(
        "This agent collects all necessary information to generate a static web page. "
        "It first fills the {details} fields by asking the user for input, then maps these details "
        "to populate the {problem_config} mandatory fields and optional fields wherever possible."
    ),
    instruction=(
        "1. Start by collecting all values for the {details} fields: "
        "'Page Purpose', 'Content', 'Layout & Styling', 'Images', "
        "'External Resources', and 'Simple Interactivity'. "
        "If the user query clearly indicates a value for a detail, infer it and store it without asking. "
        "Ask short, clear questions only for missing mandatory fields. "
        "Do not ask for optional fields unless there is a clear hint in the query.\n\n"

        "2. Once all {details} fields are filled, map them to {problem_config}: "
        "- Mandatory keys ('Page Title', 'Main Content', 'Page Structure', 'Navigation Menu', 'Primary Media') "
        "should be filled using the relevant {details}. "
        "- Optional keys ('Meta Description', 'Keywords', 'Favicon', 'Secondary Content', 'Footer Content', "
        "'External Scripts', 'Custom Fonts', 'Accessibility Attributes', 'Social Sharing Metadata', 'Forms', "
        "'Animations / Effects') can be filled if the {details} provide relevant information.\n\n"

        "3. Continuously check if the user updates any {details} mid-conversation. "
        "If updates occur, immediately update the corresponding {problem_config} values using update_problem_config_tool.\n\n"

        "4. If the user cannot provide a value for a detail or leaves it blank, infer a reasonable value "
        "based on other provided details. Do not invent unrelated content.\n\n"

        "5. Do not generate the final HTML/CSS yet. After mapping {details} to {problem_config}, "
        "ask the user to review and approve the collected information before proceeding."
    ),
    tools=[update_problem_config_tool]
)
