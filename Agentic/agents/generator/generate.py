# loop_agent.py

from google.adk.agents import LoopAgent

# Import your agents
from .creator import Creator
from .determiner import Determiner

# LoopAgent Definition
Webpage_Builder = LoopAgent(
    name="Webpage_Builder",
    description=(
        "Coordinates Creator and Determiner agents to iteratively build the HTML page. "
        "1. Starts with Creator generating the boilerplate code and storing it in {generated_code}. "
        "2. Determiner validates {generated_code}. If incorrect, Determiner sends {instruct} to Creator. "
        "3. If correct, Determiner provides {instruct} for adding the next section from {section_plan}. "
        "4. Creator updates {generated_code} with each instruction. "
        "5. Repeat until all sections are complete. "
        "6. Determiner calls the exit_loop tool to stop the loop once no instructions remain."
    ),
    sub_agents=[Creator, Determiner]
)

