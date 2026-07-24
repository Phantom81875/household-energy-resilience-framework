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

        name = appliance["Appliance"]

        database[name] = {
            "category": appliance["Category"],
            "wattage": int(appliance["Average_Wattage"]),
            "priority": int(appliance["Priority"]),
            "essential": appliance["Essential"] == "Yes"
        }

    return database
