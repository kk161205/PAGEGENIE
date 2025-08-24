from google.adk.agents import LlmAgent
from google.adk.tools import google_search

# Web_info agent to gather external resources for static pages
Web_info = LlmAgent(
    name="Web_info",
    model="gemini-2.5-flash",
    description=(
        "An agent that performs targeted web searches to gather supporting links, images, "
        "and references for static web pages. Designed to suggest content without exceeding quota limits."
    ),
    instruction=(
    "1. Use ONLY the 'Page Title', 'Main Content', and 'Page Structure' from {problem_config} "
    "to form concise search queries.\n"
    "2. Perform searches using the `google_search` tool, limiting results to the top 5 most relevant links and media.\n"
    "3. Collect only the essential URLs or inspiration for design, colors, components, or external references.\n"
    "4. Store the final collected links and media in web_info_output, structured as a dictionary with keys:\n"
    "   - 'design_inspiration': list of links to design inspiration or example sites\n"
    "   - 'color_palettes': list of links to relevant color palettes\n"
    "   - 'component_examples': list of links to UI/component examples\n"
    "   - 'external_links': list of other reference URLs\n"
    "5. Return {web_info_output} with content related to the topics or fields described in {problem_config}.\n"
    "6. Avoid repeating searches for the same query in the same session."
    ),
    tools=[google_search]
)
