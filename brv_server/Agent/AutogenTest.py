import autogen
from autogen import AssistantAgent, UserProxyAgent, GroupChatManager, GroupChat
from flask_socketio import SocketIO, emit


socket: SocketIO


def new_print_received_message(self, message, sender):
    print(f"PATCHED {sender.name}: {message}")
    socket.emit('agent_response', {"sender": sender.name, "content": message})


def run_agent(passed_socket: SocketIO, args: dict):

    global socket
    socket = passed_socket
    GroupChatManager._print_received_message = new_print_received_message
    local_config_list = [
        {
            "model": "llama-pro:latest",
            "base_url": "http://localhost:11434/v1",
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
            agents.append(AssistantAgent(team_member["name"], system_message=team_member["prompt"],
                                         llm_config=local_llm_config))
        else:
            agents.append(AssistantAgent(team_member["name"],
                                         llm_config=local_llm_config))

    user_proxy = UserProxyAgent("user_proxy",
                                code_execution_config={"work_dir": "working/" + room,
                                                       "use_docker": False,
                                                       "last_n_messages": "auto"},
                                human_input_mode="NEVER",
                                max_consecutive_auto_reply=10,
                                is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
                                )
    agents.append(user_proxy)

    GroupChatManager._print_received_message = new_print_received_message

    group_chat = GroupChat(agents=agents, messages=[])
    group_chat_manager = GroupChatManager(group_chat, llm_config=local_llm_config)
    user_proxy.initiate_chat(group_chat_manager, message=task)
