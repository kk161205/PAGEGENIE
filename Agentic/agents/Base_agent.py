# base_agent.py

from google.adk.agents import LlmAgent
from .requirement_gatherer_agent import Requirement_gatherer
from .web_info_agent import Web_info
from .section_planner import Section_Planner
from .generator.generate import Webpage_Builder
from tools import exit_loop
from google.adk.tools import AgentTool

# Wrap Web_info as a tool
web_info_tool = AgentTool(Web_info)

# Root coordinator agent
Base = LlmAgent(
    name="Base_agent",
    model="gemini-2.5-flash",
    description=(
        "Root agent that coordinates the process of building a static web page. "
        "It collects requirements, gathers external references, generates "
        "a structured section plan, and then runs an iterative loop to build the HTML."
    ),
    instruction=(
    "Step 1. Call `Requirement_gatherer` to collect all user input into {problem_config}.\n"
    "Step 2. Use the `web_info_tool` to gather external references into {web_info_output}.\n"
    "Step 3. Call `Section_Planner` using {problem_config} and {web_info_output}, store in {section_plan}.\n"
    "Step 4. Start `Webpage_Builder` loop with state including {generated_code}, {instruct}, {section_plan}, "
    "{problem_config}, {web_info_output}.\n"
    "Step 5. The loop will iteratively generate sections using Creator and Determiner, refining the HTML and calling `exit_loop` when finished.\n"
    "Step 6. Return the final {generated_code} as the completed webpage HTML.\n\n"
    "Important: If the user asks a question unrelated to webpage creation, provide a short, polite answer, "
    "then remind them the main task is to build their webpage. Do not generate anything outside the webpage content.\n"
    "Step 7. Once exit_loop is called, ensure {generated_code} is returned as the final response to the user. "
    "Include it as a code block in the output message."
    ),
    sub_agents=[Requirement_gatherer, Section_Planner, Webpage_Builder],
    tools=[web_info_tool]
)
