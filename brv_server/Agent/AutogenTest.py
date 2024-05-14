from typing import List

import uuid
from autogen import AssistantAgent, UserProxyAgent, GroupChatManager, GroupChat, Cache
from flask_socketio import SocketIO
socket: SocketIO


def new_print_received_message(self, message, sender):
    print(f"PATCHED {sender.name}: {message}")
    socket.emit('agent_response', {"sender": sender.name, "content": message})


def run_agent(passed_socket: SocketIO, args: dict):
    global socket
    socket = passed_socket
    GroupChatManager._print_received_message = new_print_received_message
    gpt_config_list = [
        {
            "model": "gpt-4-1106-preview",
        }
    ]
    gpt_llm_config = {
        "config_list": gpt_config_list

    }

    local_config_list = [
        {
            "model": "lamma3:8b",
            "base_url": "http://localhost:11434/api",
            "api_key": "ollama"
        }
    ]
    local_llm_config = {
        "config_list": local_config_list,
        "cache_seed": None

    }

    team = args["team"]
    room = args["room"]
    task = args["task"]

    agents = []

    for team_member in team:
        if "prompt" in team_member:
            agents.append(AssistantAgent(team_member["name"],
                                         system_message=team_member["prompt"],
                                         llm_config=local_llm_config,
                                         description=team_member["description"]
                                         ))

    assistant = AssistantAgent(name="Assistant", llm_config=local_llm_config,
                               description="""A helpful and general-purpose AI assistant that has strong 
                               language skills, Python skills, and Linux command line skills. 
                               Writes code to be executed by the Executor""",
                               system_message="""You are a helpful AI assistant.
Solve tasks using your coding and language skills.
In the following cases, suggest python code (in a python coding block) 
or shell script (in a sh coding block) for the user to execute.
    1. When you need to collect info, use the code to output the info you need, 
    for example, browse or search the web, download/read a file, print the content of 
    a webpage or a file, get the current date/time, check the operating system. After 
    sufficient info is printed and the task is ready to be solved based on your language skill, 
    you can solve the task by yourself.
    2. When you need to perform some task with code, use the code to perform the task and 
    output the result. Finish the task smartly.
Solve the task step by step if you need to. If a plan is not provided, explain your plan first. Be clear which step 
uses code, and which step uses your language skill.
When using code, you must indicate the script type in the code block. The user cannot provide any other 
feedback or perform any other action beyond executing the code you suggest. The user can't modify your code. 
So do not suggest incomplete code which requires users to modify. 
Don't use a code block if it's not intended to be executed by the user.
ALWAYS have  the user save the code in a file before executing it, put # filename: <filename> inside the 
code block as the first line. Don't include multiple code blocks in one response. Do not ask users to copy
 and paste the result. Instead, use 'print' function for the output 
 when relevant. Check the execution result returned by the user.
If the result indicates there is an error, fix the error and output the code again. Suggest the full code 
instead of partial code or code changes. 
If the error can't be fixed or if the task is not solved even after 
the code is executed successfully, analyze the problem, revisit 
your assumption, collect additional info you need, and think of a different approach to try.
When you find an answer, verify the answer carefully. Include verifiable evidence in your response if possible.
Reply "TERMINATE" in the end when everything is done.""")
    agents.append(assistant)
    guid = uuid.uuid4()
    user_proxy = UserProxyAgent("user",
                                system_message="""user. user the code written by the Assistant and output the 
                                 results to the work_dir.""",
                                code_execution_config={"work_dir": "working/" + str(guid),
                                                       "use_docker": "python:3.11.8",
                                                       "last_n_messages": "auto"},
                                human_input_mode="NEVER",
                                max_consecutive_auto_reply=50,
                                is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
                                )

    if len(agents) == 1:
       # with Cache.redis(redis_url="redis://localhost:6379/0") as cache:
        user_proxy.initiate_chat(assistant, message=task)
    else:
        GroupChatManager._print_received_message = new_print_received_message
        group_chat = GroupChat(agents=agents, messages=[], speaker_selection_method="round_robin")
        group_chat.next_agent(agents[0])
        group_chat_manager = GroupChatManager(group_chat, llm_config=gpt_llm_config)
        #with Cache.redis(redis_url="redis://localhost:6379/0") as cache:
        user_proxy.initiate_chat(group_chat_manager, message=task)

   # socket.emit("agent_message", result)
