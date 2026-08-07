import json
import os


def load_appliance_database():

    path = os.path.join(
        "data",
        "appliance_data",
        "common_appliances.json"
    )

    with open(path, "r") as file:
        appliances = json.load(file)


    database = {}

    for appliance in appliances:

        name = appliance["appliance"]

        database[name] = {
            "category": appliance["category"],
            "wattage": int(appliance["wattage"]),
            "priority": int(appliance["priority"]),
            "usage": appliance['usage'],
            "essential": appliance["essential"] == "Yes",
        }

    return database
