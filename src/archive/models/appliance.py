from archive.appliance_database.appliance_data import load_appliance_database


DATABASE = load_appliance_database()


class Appliance:

    def __init__(self, name, quantity):

        self.name = name
        self.quantity = quantity

        if name in DATABASE:

            data = DATABASE[name]

            self.category = data["category"]
            self.wattage = data["wattage"]
            self.priority = data["priority"]
            self.essential = data["essential"]

        else:
            self.category = "Custom"
            self.wattage = int(input("Wattage: "))
            self.priority = int(input("Priority: "))
            self.essential = input(
                "Essential? yes/no: "
            ).lower() == "yes"
