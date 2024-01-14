from dotenv import load_dotenv
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
import json


load_dotenv()
config_list = [
    {
        'model': 'gpt-4',
        'api_key': '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',
    }
]
llm_config = {"config_list": config_list, "cache_seed": 42}

user_proxy = UserProxyAgent(
   name="User_proxy",
   system_message="A human admin.",
   code_execution_config={"last_n_messages": 2, "work_dir": "groupchat"},
   human_input_mode="TERMINATE"
)
coder = AssistantAgent(
    name="Coder",
    llm_config=llm_config,
)
pm = AssistantAgent(
    name="Product_manager",
    system_message="Creative in software product ideas.",
    llm_config=llm_config,
)
group_chat = GroupChat(agents=[user_proxy, coder, pm], messages=[], max_round=12)
manager = GroupChatManager(groupchat=group_chat, llm_config=llm_config)


def planner(data):
    user_proxy.initiate_chat(manager,
                             message=data)


class Chat:

    def __init__(self):
        pass

